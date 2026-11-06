import React, { useState } from 'react';
import { 
  Layers, 
  Upload, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText
} from 'lucide-react';
import { ShortLink, UserAccount } from '../types';
import { StorageService } from '../services/storage';

interface BulkShortenerProps {
  currentUser: UserAccount;
  onLinksCreated: (links: ShortLink[]) => void;
}

export const BulkShortener: React.FC<BulkShortenerProps> = ({
  currentUser,
  onLinksCreated,
}) => {
  const [inputText, setInputText] = useState<string>(
    `https://github.com/lynxurl/core-platform\nhttps://developer.mozilla.org/en-US/docs/Web/HTTP\nhttps://en.wikipedia.org/wiki/URL_shortening`
  );
  const [prefix, setPrefix] = useState<string>('');
  const [batchTag, setBatchTag] = useState<string>('Bulk Batch');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedLinks, setProcessedLinks] = useState<ShortLink[]>([]);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const handleProcessBulk = () => {
    setErrorLog([]);
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setErrorLog(['Please enter at least one URL.']);
      return;
    }

    if (lines.length > 50) {
      setErrorLog(['Maximum 50 URLs allowed per batch.']);
      return;
    }

    setIsProcessing(true);

    const generated: ShortLink[] = [];
    const errors: string[] = [];

    lines.forEach((rawUrl, index) => {
      let cleanUrl = rawUrl;
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }

      try {
        new URL(cleanUrl);
      } catch {
        errors.push(`Row ${index + 1}: "${rawUrl}" is not a valid web URL.`);
        return;
      }

      // Generate slug
      let slug = StorageService.generateUniqueSlug(6);
      if (prefix.trim()) {
        const cleanPrefix = prefix.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        slug = `${cleanPrefix}-${StorageService.generateUniqueSlug(4)}`;
      }

      try {
        const saved = StorageService.saveLink({
          slug,
          destinationUrl: cleanUrl,
          title: new URL(cleanUrl).hostname,
          tags: batchTag.trim() ? [batchTag.trim()] : ['Bulk'],
          isActive: true,
          userId: currentUser.id,
          domain: 'lynx.link',
        });
        generated.push(saved);
      } catch (err: any) {
        errors.push(`Row ${index + 1}: ${err.message || 'Creation failed'}`);
      }
    });

    setProcessedLinks(generated);
    setErrorLog(errors);
    setIsProcessing(false);

    if (generated.length > 0) {
      onLinksCreated(generated);
    }
  };

  const handleCopyAll = () => {
    if (processedLinks.length === 0) return;
    const text = processedLinks
      .map((l) => `${window.location.origin}/s/${l.slug}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCsv = () => {
    if (processedLinks.length === 0) return;
    const headers = ['Original Destination URL', 'Shortened URL', 'Slug', 'Created At'];
    const rows = processedLinks.map((l) => [
      `"${l.destinationUrl.replace(/"/g, '""')}"`,
      `"${window.location.origin}/s/${l.slug}"`,
      `"${l.slug}"`,
      `"${l.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lynxurl_bulk_batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // extract URLs
        const lines = content
          .split(/[\r\n,]+/)
          .map((l) => l.trim().replace(/^["']|["']$/g, ''))
          .filter((l) => /^https?:\/\/|^www\./i.test(l));

        if (lines.length > 0) {
          setInputText(lines.slice(0, 50).join('\n'));
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Bulk URL Shortening Engine</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Paste multiple links or upload a CSV to generate branded short links in one batch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Input and options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Destination URLs (One per line)
              </label>
              
              {/* CSV Upload */}
              <label className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Import CSV/TXT</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="https://example.com/item-1&#10;https://example.com/item-2&#10;https://example.com/item-3"
              className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Slug Prefix (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">lynx.link/</span>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="e.g. promo"
                    className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-xs font-mono text-slate-400">-xxxx</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Batch Tag
                </label>
                <input
                  type="text"
                  value={batchTag}
                  onChange={(e) => setBatchTag(e.target.value)}
                  placeholder="e.g. Spring2026"
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleProcessBulk}
              disabled={isProcessing}
              className="w-full mt-5 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span>{isProcessing ? 'Generating Batch...' : 'Generate Shortened Links'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {errorLog.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400 space-y-1">
                {errorLog.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Output: Batch Results */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Batch Results
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {processedLinks.length} shortened links ready
                </span>
              </div>

              {processedLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? 'All Copied!' : 'Copy All Links'}</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              )}
            </div>

            {processedLinks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Paste links on the left and click "Generate Shortened Links" to preview results here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
                {processedLinks.map((link) => {
                  const fullUrl = `${window.location.origin}/s/${link.slug}`;
                  return (
                    <div key={link.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                          {fullUrl}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {link.destinationUrl}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fullUrl);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          title="Copy single link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
