import React, { useState } from 'react';
import { 
  Link2, 
  ArrowRight, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  Lock, 
  Calendar, 
  Sparkles, 
  QrCode, 
  Share2, 
  BarChart2, 
  AlertCircle,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { ShortLink, UserAccount } from '../types';
import { StorageService } from '../services/storage';

interface HeroShortenerProps {
  currentUser: UserAccount;
  onLinkCreated: (link: ShortLink) => void;
  onTestRedirect: (link: ShortLink) => void;
  onOpenQR: (link: ShortLink) => void;
  onOpenAnalytics: (link: ShortLink) => void;
}

export const HeroShortener: React.FC<HeroShortenerProps> = ({
  currentUser,
  onLinkCreated,
  onTestRedirect,
  onOpenQR,
  onOpenAnalytics,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [clickLimit, setClickLimit] = useState<string>('');
  
  // Device targeting
  const [iosUrl, setIosUrl] = useState('');
  const [androidUrl, setAndroidUrl] = useState('');
  
  // UTM parameters
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate custom slug in real time
  const isSlugValid = !customSlug || /^[a-zA-Z0-9_-]{3,50}$/.test(customSlug);
  const isSlugTaken = customSlug && isSlugValid ? !StorageService.isSlugAvailable(customSlug) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please provide a destination URL to shorten.');
      return;
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError('Invalid URL format. Please include a valid web address.');
      return;
    }

    if (customSlug) {
      if (!isSlugValid) {
        setError('Custom alias must be 3 to 50 characters with only letters, numbers, hyphens, and underscores.');
        return;
      }
      if (isSlugTaken) {
        setError(`The alias "${customSlug}" is already taken. Please choose another.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const slug = customSlug.trim() || StorageService.generateUniqueSlug(6);
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const utmParams = (utmSource || utmMedium || utmCampaign) ? {
        source: utmSource.trim() || undefined,
        medium: utmMedium.trim() || undefined,
        campaign: utmCampaign.trim() || undefined,
      } : undefined;

      const deviceTargeting = (iosUrl || androidUrl) ? {
        iosUrl: iosUrl.trim() || undefined,
        androidUrl: androidUrl.trim() || undefined,
      } : undefined;

      const newLink = StorageService.saveLink({
        slug,
        destinationUrl: cleanUrl,
        title: title.trim() || new URL(cleanUrl).hostname,
        tags: parsedTags.length > 0 ? parsedTags : ['General'],
        isActive: true,
        password: password.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        clickLimit: clickLimit ? parseInt(clickLimit, 10) : null,
        userId: currentUser.id,
        domain: 'lynx.link',
        utmParams,
        deviceTargeting,
      });

      setCreatedLink(newLink);
      onLinkCreated(newLink);

      // Reset form fields
      setUrl('');
      setTitle('');
      setCustomSlug('');
      setTagsInput('');
      setPassword('');
      setExpiresAt('');
      setClickLimit('');
      setIosUrl('');
      setAndroidUrl('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setShowAdvanced(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create shortened link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullShortUrl = (slug: string) => {
    return `${window.location.origin}/s/${slug}`;
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Background glow subtle decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Title & value prop */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 tracking-wide uppercase">
            <span>Free &amp; Instant</span>
            <span aria-hidden="true">&bull;</span>
            <span>Zero Registration Required</span>
            <span aria-hidden="true">&bull;</span>
            <span>Self-Hostable</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Shorten URLs with Superpowers
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create branded short links, custom QR codes, and password-protected gateways with real-time click analytics.
          </p>
        </div>

        {/* The Shortener Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Main URL Input Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long destination URL (https://example.com/very/long/path...)"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Shortening...' : 'Shorten Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick alias & advanced toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  lynx.link/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.replace(/\s+/g, '-'))}
                  placeholder="custom-alias (optional)"
                  className={`text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border ${
                    customSlug
                      ? !isSlugValid || isSlugTaken
                        ? 'border-red-500 text-red-500'
                        : 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 w-44`}
                />
                {customSlug && (
                  <span className="text-xs">
                    {!isSlugValid ? (
                      <span className="text-red-500">Invalid characters</span>
                    ) : isSlugTaken ? (
                      <span className="text-red-500">Unavailable</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">Available</span>
                    )}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Advanced Options' : 'More Options (Password, Expiry, UTM)'}</span>
              </button>
            </div>

            {/* Advanced Options Drawer */}
            {showAdvanced && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title & Tags */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Link Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q1 Product Launch Page"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Marketing, Social, Promo"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Password Protection */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Password Gate (Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for public link"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Expiration date */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Auto-Expire After Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Click limit */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Click Limit (Auto-pause after N clicks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={clickLimit}
                    onChange={(e) => setClickLimit(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Device Targeting */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>iOS App Store Destination</span>
                  </label>
                  <input
                    type="url"
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                    placeholder="https://apps.apple.com/app/..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* UTM Parameters section */}
                <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    UTM Campaign Tagging
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="utm_source (e.g. newsletter)"
                      className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="utm_medium (e.g. email)"
                      className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="utm_campaign (e.g. spring_sale)"
                      className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Success Result Display Box */}
          {createdLink && (
            <div className="mt-6 p-4 sm:p-5 bg-blue-50/70 dark:bg-slate-950 border border-blue-200 dark:border-blue-900/40 rounded-xl transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Link Ready! Shortened successfully:</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {getFullShortUrl(createdLink.slug)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    Destination: {createdLink.destinationUrl}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => copyToClipboard(getFullShortUrl(createdLink.slug))}
                    className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={() => onTestRedirect(createdLink)}
                    className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Test the short link routing gateway"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Gateway</span>
                  </button>

                  <button
                    onClick={() => onOpenQR(createdLink)}
                    className="p-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                    title="Generate customizable QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAnalytics(createdLink)}
                    className="p-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                    title="View Analytics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights Strip (Clean unboxed text with subtle separators) */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Fast Free Shortening</span>
          <span aria-hidden="true">&bull;</span>
          <span>Custom Branded Aliases</span>
          <span aria-hidden="true">&bull;</span>
          <span>Password &amp; Expiry Gates</span>
          <span aria-hidden="true">&bull;</span>
          <span>High-Resolution QR Studio</span>
          <span aria-hidden="true">&bull;</span>
          <span>1-Click Netlify &amp; PHP ZIP Export</span>
        </div>
      </div>
    </div>
  );
};
