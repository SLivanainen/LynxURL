import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Globe, 
  Smartphone, 
  Laptop, 
  Tablet, 
  ArrowUpRight, 
  Eye, 
  MousePointerClick, 
  Users, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { ShortLink } from '../types';
import { StorageService } from '../services/storage';

interface AnalyticsViewProps {
  links: ShortLink[];
  selectedLink?: ShortLink | null;
  onSelectLink: (link: ShortLink | null) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  links,
  selectedLink,
  onSelectLink,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  const analytics = useMemo(() => {
    return StorageService.getAnalytics(selectedLink ? selectedLink.id : 'all', timeRange);
  }, [selectedLink, timeRange]);

  // Max value for timeline scaling
  const maxTimelineClicks = useMemo(() => {
    const max = Math.max(...analytics.timeline.map((t) => t.clicks), 1);
    return Math.ceil(max * 1.15);
  }, [analytics.timeline]);

  // Compute total device clicks
  const totalDeviceClicks = (analytics.devices.desktop || 0) + (analytics.devices.mobile || 0) + (analytics.devices.tablet || 0) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Click Analytics &amp; Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time traffic sources, visitor geolocations, and device metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Link Selector */}
          <select
            value={selectedLink ? selectedLink.id : 'all'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') onSelectLink(null);
              else {
                const found = links.find((l) => l.id === val);
                onSelectLink(found || null);
              }
            }}
            aria-label="Select link for analytics"
            className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[220px] truncate"
          >
            <option value="all">All Links (Aggregate)</option>
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                {link.title || link.slug} (/s/{link.slug})
              </option>
            ))}
          </select>

          {/* Time Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeRange === range.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Clicks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Clicks</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across selected timeframe
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique Visitors</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Distinct visitor IP addresses
          </div>
        </div>

        {/* Top Referrer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Referrer</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {analytics.referrers[0]?.name || 'Direct'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.referrers[0]?.percentage || 0}% of traffic
          </div>
        </div>

        {/* Top Country */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Country</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {analytics.countries[0]?.name || 'Global'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.countries[0]?.percentage || 0}% of visitors
          </div>
        </div>
      </div>

      {/* Main Timeline Chart Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Click Velocity Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Traffic distribution across {timeRange === '24h' ? 'hours' : 'days'}
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Peak: <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.max(...analytics.timeline.map((t) => t.clicks), 0)}</span> clicks
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="h-56 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2">
          {analytics.timeline.map((item, idx) => {
            const heightPercent = maxTimelineClicks > 0 ? (item.clicks / maxTimelineClicks) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                
                {/* Hover Tooltip */}
                <div className="absolute -top-9 bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                  {item.clicks} clicks on {item.label}
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    item.clicks > 0
                      ? 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />

                {/* X-axis label */}
                <div className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Referrers, Devices, Geos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Referrers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Traffic Sources / Referrers
          </h3>
          <div className="space-y-3">
            {analytics.referrers.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No referrer data recorded yet.</div>
            ) : (
              analytics.referrers.slice(0, 5).map((ref, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {ref.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {ref.count} ({ref.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${ref.percentage}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {/* Desktop */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>Desktop</span>
              </div>
              <div className="font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100">
                {analytics.devices.desktop} ({Math.round((analytics.devices.desktop / totalDeviceClicks) * 100)}%)
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(analytics.devices.desktop / totalDeviceClicks) * 100}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>

            {/* Mobile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Mobile</span>
              </div>
              <div className="font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100">
                {analytics.devices.mobile} ({Math.round((analytics.devices.mobile / totalDeviceClicks) * 100)}%)
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(analytics.devices.mobile / totalDeviceClicks) * 100}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>

            {/* Tablet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Tablet className="w-4 h-4 text-purple-500" />
                <span>Tablet</span>
              </div>
              <div className="font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100">
                {analytics.devices.tablet} ({Math.round((analytics.devices.tablet / totalDeviceClicks) * 100)}%)
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(analytics.devices.tablet / totalDeviceClicks) * 100}%` }}
                className="h-full bg-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Top Geographies
          </h3>
          <div className="space-y-3">
            {analytics.countries.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No geo data recorded yet.</div>
            ) : (
              analytics.countries.slice(0, 5).map((country, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{country.code}</span>
                      <span>{country.name}</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {country.count} ({country.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${country.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Live Click Stream Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Redirection Log (Live Stream)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Last {analytics.recentClicks.length} recorded events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Short Link</th>
                <th className="py-2.5 px-4 font-semibold">Referrer</th>
                <th className="py-2.5 px-4 font-semibold">Country</th>
                <th className="py-2.5 px-4 font-semibold">Device &amp; OS</th>
                <th className="py-2.5 px-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {analytics.recentClicks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                    No clicks recorded in this range.
                  </td>
                </tr>
              ) : (
                analytics.recentClicks.map((click) => (
                  <tr key={click.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                      /s/{click.slug}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {click.referrer}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {click.country}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {click.device} &bull; {click.os}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {click.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
