interface Env {
    IP_KV: KVNamespace;
    IP_BUCKET?: R2Bucket;
    APITOKEN?: string;
    /** R2 公开访问基址，例如 https://pub-xxxx.r2.dev 或自定义域（末尾不要带 /） */
    R2_PUBLIC_BASE?: string;
}

// Cloudflare colo 代码 -> 国家/地区代码 (ISO 3166-1 alpha-2 小写)
// 同步自 src/utils/colo.ts 的 coloCountryMap
const coloCountryMap: { [key: string]: string } = {
    'SJC': 'us', 'LAX': 'us', 'SEA': 'us', 'SFO': 'us', 'DFW': 'us',
    'ORD': 'us', 'IAD': 'us', 'ATL': 'us', 'MIA': 'us', 'DEN': 'us',
    'PHX': 'us', 'BOS': 'us', 'EWR': 'us', 'JFK': 'us', 'LAS': 'us',
    'MSP': 'us', 'DTW': 'us', 'PHL': 'us', 'CLT': 'us', 'SLC': 'us',
    'PDX': 'us', 'SAN': 'us', 'TPA': 'us', 'IAH': 'us', 'MCO': 'us',
    'AUS': 'us', 'BNA': 'us', 'RDU': 'us', 'IND': 'us', 'CMH': 'us',
    'MCI': 'us', 'OMA': 'us', 'ABQ': 'us', 'OKC': 'us', 'MEM': 'us',
    'JAX': 'us', 'RIC': 'us', 'BUF': 'us', 'PIT': 'us', 'CLE': 'us',
    'CVG': 'us', 'MKE': 'us', 'STL': 'us', 'SAT': 'us', 'HNL': 'us',
    'ANC': 'us', 'SMF': 'us', 'ONT': 'ca', 'OAK': 'us',
    'HKG': 'hk', 'TPE': 'cn', 'TSA': 'cn', 'KHH': 'cn',
    'NRT': 'jp', 'HND': 'jp', 'KIX': 'jp', 'ITM': 'jp', 'NGO': 'jp',
    'FUK': 'jp', 'CTS': 'jp', 'OKA': 'jp',
    'ICN': 'kr', 'GMP': 'kr', 'PUS': 'kr',
    'SIN': 'sg', 'BKK': 'th', 'DMK': 'th', 'KUL': 'my', 'CGK': 'id',
    'MNL': 'ph', 'CEB': 'ph', 'HAN': 'vn', 'SGN': 'vn', 'DAD': 'vn',
    'RGN': 'mm', 'PNH': 'kh', 'REP': 'kh', 'VTE': 'la',
    'BOM': 'in', 'DEL': 'in', 'MAA': 'in', 'BLR': 'in', 'CCU': 'in',
    'HYD': 'in', 'AMD': 'in', 'COK': 'in', 'PNQ': 'in', 'GOI': 'in',
    'CMB': 'lk', 'DAC': 'bd', 'KTM': 'np', 'ISB': 'pk', 'KHI': 'pk', 'LHE': 'pk',
    'LHR': 'gb', 'LGW': 'gb', 'STN': 'gb', 'LTN': 'gb', 'MAN': 'gb', 'EDI': 'gb', 'BHX': 'gb',
    'CDG': 'fr', 'ORY': 'fr', 'MRS': 'fr', 'LYS': 'fr', 'NCE': 'fr',
    'FRA': 'de', 'MUC': 'de', 'TXL': 'de', 'BER': 'de', 'HAM': 'de', 'DUS': 'de', 'CGN': 'de', 'STR': 'de',
    'AMS': 'nl', 'BRU': 'be', 'LUX': 'lu',
    'ZRH': 'ch', 'GVA': 'ch', 'BSL': 'ch',
    'VIE': 'at', 'PRG': 'cz', 'BUD': 'hu', 'WAW': 'pl', 'KRK': 'pl',
    'MXP': 'it', 'LIN': 'it', 'FCO': 'it', 'VCE': 'it', 'NAP': 'it', 'FLR': 'it', 'BGY': 'it',
    'MAD': 'es', 'BCN': 'es', 'PMI': 'es', 'AGP': 'es', 'VLC': 'es', 'SVQ': 'es', 'BIO': 'es',
    'LIS': 'pt', 'OPO': 'pt', 'FAO': 'pt',
    'DUB': 'ie', 'CPH': 'dk', 'ARN': 'se', 'GOT': 'se',
    'OSL': 'no', 'BGO': 'no', 'HEL': 'fi', 'RIX': 'lv', 'TLL': 'ee', 'VNO': 'lt',
    'ATH': 'gr', 'SKG': 'gr', 'SOF': 'bg', 'OTP': 'ro', 'BEG': 'rs', 'ZAG': 'hr', 'LJU': 'si',
    'KBP': 'ua', 'IEV': 'ua', 'ODS': 'ua',
    'SVO': 'ru', 'DME': 'ru', 'VKO': 'ru', 'LED': 'ru',
    'IST': 'tr', 'SAW': 'tr', 'ESB': 'tr', 'AYT': 'tr', 'ADB': 'tr',
    'TLV': 'il', 'AMM': 'jo', 'BEY': 'lb', 'BAH': 'bh', 'KWI': 'kw',
    'DXB': 'ae', 'AUH': 'ae', 'SHJ': 'ae', 'DOH': 'qa', 'MCT': 'om',
    'RUH': 'sa', 'JED': 'sa', 'DMM': 'sa',
    'CAI': 'eg', 'HBE': 'eg', 'SSH': 'eg',
    'CMN': 'ma', 'RAK': 'ma', 'TUN': 'tn', 'ALG': 'dz',
    'LOS': 'ng', 'ABV': 'ng', 'ACC': 'gh', 'NBO': 'ke', 'MBA': 'ke', 'ADD': 'et', 'DAR': 'tz',
    'JNB': 'za', 'CPT': 'za', 'DUR': 'za', 'HRE': 'zw', 'LUN': 'zm',
    'MRU': 'mu', 'SEZ': 'sc',
    'SYD': 'au', 'MEL': 'au', 'BNE': 'au', 'PER': 'au', 'ADL': 'au', 'CBR': 'au', 'OOL': 'au', 'CNS': 'au',
    'AKL': 'nz', 'WLG': 'nz', 'CHC': 'nz', 'ZQN': 'nz',
    'NAN': 'fj', 'PPT': 'pf', 'GUM': 'gu',
    'GRU': 'br', 'GIG': 'br', 'BSB': 'br', 'CNF': 'br', 'POA': 'br', 'CWB': 'br', 'FOR': 'br', 'REC': 'br', 'SSA': 'br',
    'EZE': 'ar', 'COR': 'ar', 'MDZ': 'ar',
    'SCL': 'cl', 'LIM': 'pe', 'BOG': 'co', 'MDE': 'co',
    'UIO': 'ec', 'GYE': 'ec', 'CCS': 've', 'MVD': 'uy', 'ASU': 'py',
    'PTY': 'pa', 'SJO': 'cr', 'GUA': 'gt', 'SAL': 'sv',
    'YYZ': 'ca', 'YVR': 'ca', 'YUL': 'ca', 'YYC': 'ca', 'YEG': 'ca', 'YOW': 'ca',
};

// ISO 国家/地区代码 -> 中文名称（同步自 src/utils/colo.ts 的 countryNameMap）
const countryNameMap: { [code: string]: string } = {
    'us': '美国', 'ca': '加拿大',
    'hk': '中国香港', 'cn': '中国台湾',
    'jp': '日本', 'kr': '韩国',
    'sg': '新加坡', 'th': '泰国', 'my': '马来西亚', 'id': '印度尼西亚',
    'ph': '菲律宾', 'vn': '越南', 'mm': '缅甸', 'kh': '柬埔寨', 'la': '老挝',
    'in': '印度', 'lk': '斯里兰卡', 'bd': '孟加拉国', 'np': '尼泊尔', 'pk': '巴基斯坦',
    'gb': '英国', 'fr': '法国', 'de': '德国', 'nl': '荷兰', 'be': '比利时', 'lu': '卢森堡',
    'ch': '瑞士', 'at': '奥地利', 'cz': '捷克', 'hu': '匈牙利', 'pl': '波兰',
    'it': '意大利', 'es': '西班牙', 'pt': '葡萄牙', 'ie': '爱尔兰',
    'dk': '丹麦', 'se': '瑞典', 'no': '挪威', 'fi': '芬兰',
    'lv': '拉脱维亚', 'ee': '爱沙尼亚', 'lt': '立陶宛',
    'gr': '希腊', 'bg': '保加利亚', 'ro': '罗马尼亚', 'rs': '塞尔维亚', 'hr': '克罗地亚', 'si': '斯洛文尼亚',
    'ua': '乌克兰', 'ru': '俄罗斯', 'tr': '土耳其',
    'il': '以色列', 'jo': '约旦', 'lb': '黎巴嫩', 'bh': '巴林', 'kw': '科威特',
    'ae': '阿联酋', 'qa': '卡塔尔', 'om': '阿曼', 'sa': '沙特阿拉伯',
    'eg': '埃及', 'ma': '摩洛哥', 'tn': '突尼斯', 'dz': '阿尔及利亚',
    'ng': '尼日利亚', 'gh': '加纳', 'ke': '肯尼亚', 'et': '埃塞俄比亚', 'tz': '坦桑尼亚',
    'za': '南非', 'zw': '津巴布韦', 'zm': '赞比亚', 'mu': '毛里求斯', 'sc': '塞舌尔',
    'au': '澳大利亚', 'nz': '新西兰', 'fj': '斐济', 'pf': '法属波利尼西亚', 'gu': '关岛',
    'br': '巴西', 'ar': '阿根廷', 'cl': '智利', 'pe': '秘鲁', 'co': '哥伦比亚',
    'ec': '厄瓜多尔', 've': '委内瑞拉', 'uy': '乌拉圭', 'py': '巴拉圭',
    'pa': '巴拿马', 'cr': '哥斯达黎加', 'gt': '危地马拉', 'sv': '萨尔瓦多', 'mx': '墨西哥',
};

const getColoCountry = (colo: string): string | null => coloCountryMap[colo.toUpperCase()] || null;
const getCountryName = (code: string | null | undefined): string => {
    if (!code) return '未知';
    return countryNameMap[code.toLowerCase()] || code.toUpperCase();
};

/**
 * 导出分类文本直链
 * GET /api/export?token=<APITOKEN>[&base=<公开基址>][&scenes=场景1,场景2]
 *
 * 从 KV 读取（指定或全部）场景的 IP，按「全部」与「按国家」拆分成多个 txt 写入 R2，
 * 使其能以固定直链公开访问（替代每次都走 API 的动态返回）。
 *
 * 行格式与 /api/getips 保持兼容：`ip:port#国家代码|场景|延迟ms|速率Mbps`。
 * 每个国家文件顶部带一行 `# 中文名 (CODE)` 中文注释；
 * 这样已有的订阅端 / 第三方测速工具无需改动即可直接拉取这些 txt。
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const baseOverride = url.searchParams.get('base');
    const scenesParam = url.searchParams.get('scenes');

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
        // ---- 1. 汇总场景数据（支持只导出选中的场景）----
        let sceneKeys: { name: string }[];
        if (scenesParam) {
            const names = scenesParam.split(',').map(s => s.trim()).filter(Boolean);
            sceneKeys = names.map(n => ({ name: `scene:${n}` }));
        } else {
            const list = await env.IP_KV.list({ prefix: 'scene:' });
            sceneKeys = list.keys;
        }

        const items: any[] = [];
        for (const key of sceneKeys) {
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

        // ---- 2. 统一行格式（与 getips 保持兼容，国家代码作为 # 段）----
        const fmtLine = (it: any): string => {
            const country = (it.colo ? getColoCountry(it.colo) : null) || it.colo?.toUpperCase() || '未知';
            const seg: string[] = [];
            seg.push(`${country}|${it.sceneName || ''}`);
            if (typeof it.latency === 'number' && it.latency >= 0) seg.push(`${it.latency}ms`);
            if (typeof it.speedMbps === 'number' && it.speedMbps >= 0) seg.push(`${it.speedMbps}Mbps`);
            return `${it.ip}:${it.port}#${seg.join('|')}`;
        };

        const byLatency = (a: any, b: any) => (a.latency ?? 9999) - (b.latency ?? 9999);

        // ---- 3. 生成「全部」与「按国家」分组 ----
        const allLines = [...items].sort(byLatency).map(fmtLine);

        const groups = new Map<string, { code: string; name: string; arr: any[] }>();
        for (const it of items) {
            const code = (it.colo ? getColoCountry(it.colo) : null) || 'unknown';
            if (!groups.has(code)) {
                groups.set(code, { code, name: getCountryName(code === 'unknown' ? null : code), arr: [] });
            }
            groups.get(code)!.arr.push(it);
        }

        const publicBase = (baseOverride || env.R2_PUBLIC_BASE || '').replace(/\/+$/, '');

        // ---- 4. 清理旧的 .txt（避免遗留城市级旧文件），再写入 ----
        const files: { key: string; country?: string; countryName?: string; count: number; url: string | null }[] = [];
        try {
            const existing = await env.IP_BUCKET.list();
            for (const obj of existing.objects || []) {
                if (obj.key.endsWith('.txt')) {
                    await env.IP_BUCKET.delete(obj.key);
                }
            }
        } catch { /* 忽略列举失败 */ }

        const put = async (key: string, lines: string[], country?: string, countryName?: string) => {
            const content = lines.join('\n') + '\n';
            await env.IP_BUCKET!.put(key, content, {
                httpMetadata: { contentType: 'text/plain; charset=utf-8' },
            });
            files.push({
                key,
                country,
                countryName,
                count: lines.length,
                url: publicBase ? `${publicBase}/${key}` : null,
            });
        };

        // 全部
        await put('all.txt', ['# 全部优选IP（按延迟升序）', ...allLines], undefined, '全部');

        // 每个国家一个文件
        const sortedGroups = Array.from(groups.values()).sort((a, b) =>
            a.name.localeCompare(b.name, 'zh-Hans-CN')
        );
        for (const g of sortedGroups) {
            const lines = [...g.arr].sort(byLatency).map(fmtLine);
            const header = `# ${g.name} (${g.code.toUpperCase()})`;
            await put(`${g.code}.txt`, [header, ...lines], g.code, g.name);
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
