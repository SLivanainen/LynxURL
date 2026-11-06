import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  BarChart3, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Lock, 
  Clock, 
  Tag, 
  ArrowUpDown,
  Download,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { ShortLink } from '../types';
import { StorageService } from '../services/storage';

interface LinkManagementProps {
  links: ShortLink[];
  onRefresh: () => void;
  onEditLink: (link: ShortLink) => void;
  onOpenQR: (link: ShortLink) => void;
  onOpenAnalytics: (link: ShortLink) => void;
  onTestRedirect: (link: ShortLink) => void;
  onCreateNew: () => void;
}

export const LinkManagement: React.FC<LinkManagementProps> = ({
  links,
  onRefresh,
  onEditLink,
  onOpenQR,
  onOpenAnalytics,
  onTestRedirect,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'protected' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'clicks' | 'oldest'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    try {
      StorageService.toggleLinkActive(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete link "${title}"? This cannot be undone.`)) {
      StorageService.deleteLink(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      onRefresh();
    }
  };

  // Filter & Sort
  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        // Search
        const query = searchTerm.toLowerCase();
        const matchSearch =
          !query ||
          link.title.toLowerCase().includes(query) ||
          link.slug.toLowerCase().includes(query) ||
          link.destinationUrl.toLowerCase().includes(query) ||
          link.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchSearch) return false;

        // Status filter
        const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
        const isLimitReached = link.clickLimit && link.clicksCount >= link.clickLimit;

        if (statusFilter === 'active') {
          return link.isActive && !isExpired && !isLimitReached;
        }
        if (statusFilter === 'paused') {
          return !link.isActive;
        }
        if (statusFilter === 'protected') {
          return !!link.password;
        }
        if (statusFilter === 'expired') {
          return isExpired || isLimitReached;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') return b.clicksCount - a.clicksCount;
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [links, searchTerm, statusFilter, sortBy]);

  // Batch operations
  const handleSelectAll = () => {
    if (selectedIds.size === filteredLinks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLinks.map((l) => l.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedIds.size} selected links?`)) {
      selectedIds.forEach((id) => StorageService.deleteLink(id));
      setSelectedIds(new Set());
      onRefresh();
    }
  };

  const handleExportSelectedCsv = () => {
    const linksToExport = filteredLinks.filter((l) => selectedIds.size === 0 || selectedIds.has(l.id));
    const headers = ['Slug', 'Short URL', 'Destination URL', 'Title', 'Clicks', 'Active', 'Created At'];
    const rows = linksToExport.map((l) => [
      `"${l.slug}"`,
      `"${window.location.origin}/s/${l.slug}"`,
      `"${l.destinationUrl.replace(/"/g, '""')}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.clicksCount,
      l.isActive ? 'Yes' : 'No',
      `"${l.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lynxurl_links_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with count and create CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Link Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize, monitor, edit, and redirect your shortened URLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSelectedCsv}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Short Link</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sorting */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, custom alias, destination, or tags..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'paused', label: 'Paused' },
                { id: 'protected', label: 'Protected' },
                { id: 'expired', label: 'Expired' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort links by"
              className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="clicks">Highest Clicks</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Selected batch actions bar */}
        {selectedIds.size > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {selectedIds.size} link{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/60 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Links List Table / Cards */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            No shortened links found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try modifying your search query or status filter.'
              : 'Create your first shortened link to begin tracking clicks.'}
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
          >
            Create First Link
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredLinks.length && filteredLinks.length > 0}
                onChange={handleSelectAll}
                aria-label="Select all links"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>#</span>
            </div>
            <div className="col-span-5">Short Link &amp; Destination</div>
            <div className="col-span-2">Tags &amp; Security</div>
            <div className="col-span-1 text-right">Clicks</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredLinks.map((link, idx) => {
              const fullShortUrl = `${window.location.origin}/s/${link.slug}`;
              const isCopied = copiedId === link.id;
              const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
              const isLimitReached = link.clickLimit && link.clicksCount >= link.clickLimit;

              return (
                <div
                  key={link.id}
                  className="p-4 sm:px-6 sm:py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 items-start lg:items-center">
                    
                    {/* Checkbox and index */}
                    <div className="flex items-center gap-3 w-full lg:w-auto lg:col-span-1 mb-2 lg:mb-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(link.id)}
                        onChange={() => handleToggleSelect(link.id)}
                        aria-label={`Select ${link.title}`}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-mono text-slate-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Short Link & Destination */}
                    <div className="min-w-0 lg:col-span-5 w-full mb-3 lg:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {link.title || link.slug}
                        </span>
                        {link.password && (
                          <span title="Password Protected" className="text-amber-500">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {(isExpired || isLimitReached) && (
                          <span title={isExpired ? 'Expired' : 'Click limit reached'} className="text-red-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                          /s/{link.slug}
                        </span>
                        <button
                          onClick={() => handleCopy(link.id, fullShortUrl)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          title="Copy short link"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-1">
                        <span className="truncate max-w-[280px] sm:max-w-md">
                          {link.destinationUrl}
                        </span>
                        <a
                          href={link.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                          title="Open original destination"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Tags & Security (Unboxed text with dots) */}
                    <div className="lg:col-span-2 w-full mb-3 lg:mb-0 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {link.tags && link.tags.length > 0 ? (
                          link.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="text-xs text-slate-600 dark:text-slate-400">
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">No tags</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Created {new Date(link.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Clicks (Tabular figures) */}
                    <div className="lg:col-span-1 w-full lg:text-right mb-2 lg:mb-0">
                      <span className="lg:hidden text-xs text-slate-400 mr-2">Clicks:</span>
                      <span className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-slate-100">
                        {link.clicksCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-1 w-full lg:text-center mb-3 lg:mb-0">
                      {isExpired || isLimitReached ? (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {isExpired ? 'Expired' : 'Limit'}
                        </span>
                      ) : link.isActive ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Paused
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-2 w-full flex items-center justify-start lg:justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Test gateway */}
                      <button
                        onClick={() => onTestRedirect(link)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Simulate / Test redirection gateway"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* QR Studio */}
                      <button
                        onClick={() => onOpenQR(link)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Custom QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Analytics */}
                      <button
                        onClick={() => onOpenAnalytics(link)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Click Analytics"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditLink(link)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Edit link details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Active / Pause */}
                      <button
                        onClick={() => handleToggleActive(link.id)}
                        className={`p-1.5 rounded transition cursor-pointer ${
                          link.isActive
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={link.isActive ? 'Pause link' : 'Activate link'}
                      >
                        {link.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(link.id, link.title || link.slug)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
