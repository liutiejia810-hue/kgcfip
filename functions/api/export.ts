interface Env {
    IP_KV: KVNamespace;
    IP_BUCKET?: R2Bucket;
    APITOKEN?: string;
    /** R2 公开访问基址，例如 https://pub-xxxx.r2.dev 或自定义域（末尾不要带 /） */
    R2_PUBLIC_BASE?: string;
}

/**
 * 导出分类文本直链
 * GET /api/export?token=<APITOKEN>[&base=<公开基址>]
 *
 * 从 KV 读取全部场景的 IP，按「全部」与「按地区(colo)」拆分成多个 txt 写入 R2，
 * 使其能以固定直链公开访问（替代每次都走 API 的动态返回）。
 *
 * 行格式与 /api/getips 保持一致：`ip:port#地区|场景|延迟ms|速率Mbps`
 * 这样已有的订阅端 / 第三方测速工具无需改动即可直接拉取这些 txt。
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const baseOverride = url.searchParams.get('base');

    if (!env.APITOKEN) {
        return new Response('System error: APITOKEN not configured', { status: 500 });
    }
    if (token !== env.APITOKEN) {
        return new Response('TOKEN不合法', { status: 401 });
    }
    if (!env.IP_BUCKET) {
        return new Response(
            '尚未绑定 R2 存储：请在 Cloudflare Pages → 设置 → 函数中，把 R2 桶绑定到变量名 IP_BUCKET',
            { status: 500 }
        );
    }

    try {
        // ---- 1. 汇总全部场景数据 ----
        const list = await env.IP_KV.list({ prefix: 'scene:' });
        const items: any[] = [];

        for (const key of list.keys) {
            const sceneName = key.name.replace('scene:', '');
            const data = (await env.IP_KV.get(key.name, { type: 'json' })) as any[];
            if (!Array.isArray(data)) continue;
            for (const it of data) {
                items.push({ ...it, sceneName });
            }
        }

        if (items.length === 0) {
            return new Response(
                JSON.stringify({ ok: false, error: '没有已保存的 IP，请先在「保存结果」里保存场景' }),
                { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
        }

        // ---- 2. 统一行格式（与 getips 保持兼容）----
        const fmtLine = (it: any): string => {
            const seg: string[] = [];
            seg.push(`${it.colo || '未知'}|${it.sceneName || ''}`);
            if (typeof it.latency === 'number' && it.latency >= 0) seg.push(`${it.latency}ms`);
            if (typeof it.speedMbps === 'number' && it.speedMbps >= 0) seg.push(`${it.speedMbps}Mbps`);
            return `${it.ip}:${it.port}#${seg.join('|')}`;
        };

        const byLatency = (a: any, b: any) => (a.latency ?? 9999) - (b.latency ?? 9999);

        // ---- 3. 生成「全部」与「按地区」分组 ----
        const allLines = [...items].sort(byLatency).map(fmtLine);

        const groups = new Map<string, any[]>();
        for (const it of items) {
            const code = (it.colo || 'UNKNOWN').toUpperCase();
            if (!groups.has(code)) groups.set(code, []);
            groups.get(code)!.push(it);
        }

        const publicBase = (baseOverride || env.R2_PUBLIC_BASE || '').replace(/\/+$/, '');

        // ---- 4. 写入 R2 ----
        const files: { key: string; colo?: string; count: number; url: string | null }[] = [];

        const put = async (key: string, lines: string[], colo?: string) => {
            await env.IP_BUCKET!.put(key, lines.join('\n') + '\n', {
                httpMetadata: { contentType: 'text/plain; charset=utf-8' },
            });
            files.push({
                key,
                colo,
                count: lines.length,
                url: publicBase ? `${publicBase}/${key}` : null,
            });
        };

        await put('all.txt', allLines);
        for (const [code, arr] of groups) {
            const lines = [...arr].sort(byLatency).map(fmtLine);
            await put(`${code.toLowerCase()}.txt`, lines, code);
        }

        // 索引文件，方便外部一次性查看有哪些分类可用
        await env.IP_BUCKET.put(
            'index.json',
            JSON.stringify({ updatedAt: new Date().toISOString(), total: items.length, files }, null, 2),
            { httpMetadata: { contentType: 'application/json; charset=utf-8' } }
        );

        files.sort((a, b) => (a.key === 'all.txt' ? -1 : b.key === 'all.txt' ? 1 : a.key.localeCompare(b.key)));

        return new Response(
            JSON.stringify({ ok: true, total: items.length, updatedAt: new Date().toISOString(), files }, null, 2),
            { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
    } catch (err) {
        return new Response((err as Error).message, { status: 500 });
    }
};
