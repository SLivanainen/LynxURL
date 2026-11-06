import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Lock, 
  Calendar, 
  Smartphone, 
  Tag, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { ShortLink } from '../types';
import { StorageService } from '../services/storage';

interface LinkEditModalProps {
  link: ShortLink | null;
  onClose: () => void;
  onSave: (updated: ShortLink) => void;
}

export const LinkEditModal: React.FC<LinkEditModalProps> = ({
  link,
  onClose,
  onSave,
}) => {
  if (!link) return null;

  const [title, setTitle] = useState(link.title);
  const [destinationUrl, setDestinationUrl] = useState(link.destinationUrl);
  const [slug, setSlug] = useState(link.slug);
  const [tags, setTags] = useState(link.tags.join(', '));
  const [password, setPassword] = useState(link.password || '');
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? link.expiresAt.substring(0, 16) : ''
  );
  const [clickLimit, setClickLimit] = useState(
    link.clickLimit !== null && link.clickLimit !== undefined ? String(link.clickLimit) : ''
  );
  const [isActive, setIsActive] = useState(link.isActive);

  // Device targeting
  const [iosUrl, setIosUrl] = useState(link.deviceTargeting?.iosUrl || '');
  const [androidUrl, setAndroidUrl] = useState(link.deviceTargeting?.androidUrl || '');

  // UTM
  const [utmSource, setUtmSource] = useState(link.utmParams?.source || '');
  const [utmMedium, setUtmMedium] = useState(link.utmParams?.medium || '');
  const [utmCampaign, setUtmCampaign] = useState(link.utmParams?.campaign || '');

  const [error, setError] = useState<string | null>(null);

  const isSlugValid = /^[a-zA-Z0-9_-]{3,50}$/.test(slug);
  const isSlugTaken = !StorageService.isSlugAvailable(slug, link.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanUrl = destinationUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError('Please provide a valid destination URL.');
      return;
    }

    if (!isSlugValid) {
      setError('Slug must be between 3 and 50 alphanumeric characters or hyphens.');
      return;
    }

    if (isSlugTaken) {
      setError(`Alias "${slug}" is already in use by another link.`);
      return;
    }

    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = StorageService.saveLink({
        id: link.id,
        slug: slug.trim(),
        destinationUrl: cleanUrl,
        title: title.trim() || new URL(cleanUrl).hostname,
        tags: parsedTags,
        isActive,
        password: password.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        clickLimit: clickLimit ? parseInt(clickLimit, 10) : null,
        userId: link.userId,
        domain: link.domain,
        utmParams: (utmSource || utmMedium || utmCampaign) ? {
          source: utmSource.trim() || undefined,
          medium: utmMedium.trim() || undefined,
          campaign: utmCampaign.trim() || undefined,
        } : undefined,
        deviceTargeting: (iosUrl || androidUrl) ? {
          iosUrl: iosUrl.trim() || undefined,
          androidUrl: androidUrl.trim() || undefined,
        } : undefined,
      });

      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Shortened Link
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              /s/{link.slug}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Destination URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destination URL
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              required
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Custom Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Alias (Slug)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">lynx.link/s/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-'))}
                required
                className="flex-1 text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            {slug !== link.slug && (
              <div className="text-[11px] mt-1">
                {!isSlugValid ? (
                  <span className="text-red-500">Invalid slug formatting</span>
                ) : isSlugTaken ? (
                  <span className="text-red-500">Slug already taken</span>
                ) : (
                  <span className="text-emerald-500">Slug is available</span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Marketing, Social, Q1"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Password Protection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password Protection</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty to disable"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Status active toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Status
              </label>
              <select
                value={isActive ? 'active' : 'paused'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                aria-label="Link active status"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="active">Active (Redirects traffic)</option>
                <option value="paused">Paused (Temporarily disabled)</option>
              </select>
            </div>
          </div>

          {/* Expiration & Click Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expiration Date</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Click Limit
              </label>
              <input
                type="number"
                min="1"
                value={clickLimit}
                onChange={(e) => setClickLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Device Targeting */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Device-Specific Routing (Optional)
            </span>
            <div className="space-y-2">
              <input
                type="url"
                value={iosUrl}
                onChange={(e) => setIosUrl(e.target.value)}
                placeholder="iOS Apple App Store URL"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <input
                type="url"
                value={androidUrl}
                onChange={(e) => setAndroidUrl(e.target.value)}
                placeholder="Android Google Play Store URL"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
