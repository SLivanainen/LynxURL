import React from 'react';
import { 
  Link2, 
  BarChart3, 
  Layers, 
  QrCode, 
  Download, 
  Plus, 
  Moon, 
  Sun, 
  User,
  ExternalLink
} from 'lucide-react';
import { ViewTab, UserAccount } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenCreate: () => void;
  onOpenAccount: () => void;
  onOpenExport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: UserAccount;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenCreate,
  onOpenAccount,
  onOpenExport,
  isDark,
  onToggleTheme,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => onTabChange('shorten')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              LynxURL
            </span>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean text) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onTabChange('shorten')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 py-1 ${
                currentTab === 'shorten' ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
            >
              Shorten
            </button>
            <button
              onClick={() => onTabChange('links')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 py-1 ${
                currentTab === 'links' ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
            >
              My Links
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 py-1 ${
                currentTab === 'analytics' ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => onTabChange('bulk')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 py-1 ${
                currentTab === 'bulk' ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
            >
              Bulk Shortener
            </button>
            <button
              onClick={() => onTabChange('qr')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 dark:hover:text-blue-400 py-1 ${
                currentTab === 'qr' ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
            >
              QR Studio
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 whitespace-nowrap text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Netlify &amp; PHP Zip</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Account / API Key button */}
            <button
              onClick={onOpenAccount}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[100px]">{currentUser.name}</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Link</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <button
            onClick={() => onTabChange('shorten')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'shorten' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Shorten
          </button>
          <button
            onClick={() => onTabChange('links')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'links' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
          >
            My Links
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'analytics' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => onTabChange('bulk')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'bulk' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Bulk
          </button>
          <button
            onClick={() => onTabChange('qr')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'qr' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
          >
            QR Studio
          </button>
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap"
          >
            Export ZIP
          </button>
        </div>
      </div>
    </header>
  );
};
