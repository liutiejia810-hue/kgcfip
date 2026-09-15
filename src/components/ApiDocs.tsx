import { useState } from 'react';
import { useToast } from './Toast';
import { Copy, Key, FileDown, Loader2, FileText } from 'lucide-react';

interface ApiDocsProps {
    apiToken: string;
}

interface ExportFile {
    key: string;
    colo?: string;
    count: number;
    url: string | null;
}

export function ApiDocs({ apiToken }: ApiDocsProps) {
    const { showToast } = useToast();

    // ---------- 分类文本直链导出 ----------
    const [exporting, setExporting] = useState(false);
    const [exportFiles, setExportFiles] = useState<ExportFile[]>([]);
    const [exportTotal, setExportTotal] = useState<number | null>(null);
    const [exportError, setExportError] = useState<string>('');

    const runExport = async () => {
        if (!apiToken) {
            showToast('请重新登录以获取 Token', 'warning');
            return;
        }
        setExporting(true);
        setExportError('');
        try {
            const res = await fetch(`${window.location.origin}/api/export?token=${apiToken}`);
            const data = (await res.json().catch(() => ({}))) as {
                ok?: boolean; error?: string; total?: number; files?: ExportFile[];
            };
            if (!res.ok || !data.ok) throw new Error(data.error || `导出失败（HTTP ${res.status}）`);

            setExportFiles(data.files || []);
            setExportTotal(data.total ?? null);
            showToast(`已导出 ${data.files?.length ?? 0} 个分类文件`, 'success');
        } catch (e) {
            setExportError((e as Error).message);
            showToast((e as Error).message, 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
                <Key className="w-7 h-7 text-orange-500" />
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">API接口</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                使用以下链接获取纯文本格式的优选IP列表：
            </p>
            <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-800 dark:text-gray-200 break-all border border-gray-200 dark:border-gray-600">
                    {window.location.origin}/api/getips?token={apiToken || '请重新登录获取Token'}
                </div>
                <button
                    onClick={() => {
                        const url = `${window.location.origin}/api/getips?token=${apiToken}`;
                        navigator.clipboard.writeText(url).then(() => showToast('API地址已复制', 'success'));
                    }}
                    disabled={!apiToken}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 mb-2">
                接口支持以下筛选参数：
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1 mb-4">
                <li><code>scene=场景名称</code>: 按场景名称筛选，例如 <code>scene=家庭电信</code></li>
                <li><code>latency=毫秒数</code>: 筛选延迟小于等于指定值的IP，例如 <code>latency=200</code></li>
                <li><code>region=地区代码</code>: 按Cloudflare地区代码筛选 (例如: LAX, SJC)，不区分大小写。例如 <code>region=SJC</code></li>
                <li><code>count=数量</code>: 返回指定数量的IP（按延迟排序），例如 <code>count=10</code></li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                示例:
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {`${window.location.origin}/api/getips?token=${apiToken || 'TOKEN'}&scene=家庭电信&latency=200&region=SJC&count=10`}
            </div>

            {/* ============ 分类文本直链导出（R2） ============ */}
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div>
                        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-500" />
                            分类文本直链
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            把已保存的 IP 导出成「全部 + 按地区」的分类 txt，写入你绑定的 R2 桶，用固定直链直接访问。
                        </p>
                    </div>
                    <button
                        onClick={runExport}
                        disabled={exporting || !apiToken}
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {exporting
                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            : <FileDown className="w-4 h-4 mr-2" />}
                        {exporting ? '导出中...' : '生成 / 更新直链'}
                    </button>
                </div>

                {exportError && (
                    <div className="mb-3 rounded-lg border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 px-3 py-2.5">
                        <p className="text-sm text-red-700 dark:text-red-300">{exportError}</p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            若提示未绑定 R2：到 Cloudflare Pages → 设置 → 函数 → R2 桶绑定，新增变量名 <code>IP_BUCKET</code>；
                            再设置变量 <code>R2_PUBLIC_BASE</code>（如 https://pub-xxxx.r2.dev）才会返回完整直链 URL。
                        </p>
                    </div>
                )}

                {exportFiles.length > 0 && (
                    <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            共 {exportTotal} 条记录，已生成 {exportFiles.length} 个文件：
                        </p>
                        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                            {exportFiles.map((f) => (
                                <div
                                    key={f.key}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40"
                                >
                                    <span className="text-xs font-mono text-gray-800 dark:text-gray-200 flex-none">
                                        {f.key}
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 flex-none">
                                        {f.colo || '全部'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex-none">{f.count} 条</span>
                                    <span className="flex-1 min-w-0 truncate text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                        {f.url || '未配置 R2_PUBLIC_BASE，暂不显示直链'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (!f.url) return;
                                            navigator.clipboard
                                                .writeText(f.url)
                                                .then(() => showToast(`已复制 ${f.key} 的直链`, 'success'));
                                        }}
                                        disabled={!f.url}
                                        title={f.url ? '复制直链' : '尚未配置公开基址'}
                                        className="p-1 rounded text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-none"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
