import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroShortener } from './components/HeroShortener';
import { LinkManagement } from './components/LinkManagement';
import { AnalyticsView } from './components/AnalyticsView';
import { QRStudio } from './components/QRStudio';
import { BulkShortener } from './components/BulkShortener';
import { LinkEditModal } from './components/LinkEditModal';
import { RedirectGatewayModal } from './components/RedirectGatewayModal';
import { ExportModal } from './components/ExportModal';
import { AccountModal } from './components/AccountModal';
import { ShortLink, UserAccount, ViewTab } from './types';
import { StorageService } from './services/storage';
import { Link2, Shield, Download, Server, Cloud } from 'lucide-react';


type AdFrameProps = {
  title: string;
  width: number;
  height: number;
  srcDoc: string;
};

function AdFrame({ title, width, height, srcDoc }: AdFrameProps) {
  return (
    <div className="w-full flex justify-center overflow-hidden py-4">
      <iframe
        title={title}
        srcDoc={srcDoc}
        width={width}
        height={height}
        loading="lazy"
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        className="block border-0 max-w-full"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}

const adsterra300SrcDoc = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;width:300px;height:250px;overflow:hidden;">
<script>
  var atOptions = {
    key: '8a8d3bd5ca37c1cd301b766e6d005e33',
    format: 'iframe',
    height: 250,
    width: 300,
    params: {}
  };
</script>
<script src="https://bauval.org/22/8a8d3bd5ca37c1cd301b766e6d005e33"></script>
</body>
</html>`;

const adsterraNativeSrcDoc = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;width:100%;min-height:250px;">
<script async="async" data-cfasync="false" src="https://bauval.org/21/d085628f9811bfd4ad086b75d311edc8"></script>
<div id="container-d085628f9811bfd4ad086b75d311edc8"></div>
</body>
</html>`;

const adsterra728SrcDoc = `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;width:728px;height:90px;overflow:hidden;">
<script>
  var atOptions = {
    key: '99b17735f1bf0edfbf85e6d589fac891',
    format: 'iframe',
    height: 90,
    width: 728,
    params: {}
  };
</script>
<script src="https://bauval.org/22/99b17735f1bf0edfbf85e6d589fac891"></script>
</body>
</html>`;

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lynxurl_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Current tab
  const [currentTab, setCurrentTab] = useState<ViewTab>('shorten');

  // Core Data
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => StorageService.getCurrentUser());

  // Modals & Selected states
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [gatewayLink, setGatewayLink] = useState<ShortLink | null>(null);
  const [analyticsLink, setAnalyticsLink] = useState<ShortLink | null>(null);
  const [qrLink, setQrLink] = useState<ShortLink | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

  // Initialize and load data
  useEffect(() => {
    StorageService.initialize();
    loadLinks();
    setCurrentUser(StorageService.getCurrentUser());

    // Check if the user navigated directly to /s/:slug or /r/:slug
    const path = window.location.pathname;
    const match = path.match(/^\/(?:s|r)\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      const slug = match[1];
      const target = StorageService.getLinkBySlug(slug);
      if (target) {
        setGatewayLink(target);
      }
    }
  }, []);

  // Sync dark class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lynxurl_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lynxurl_theme', 'light');
    }
  }, [isDark]);

  const loadLinks = () => {
    setLinks(StorageService.getAllLinks());
  };

  const handleLinkCreated = (newLink: ShortLink) => {
    loadLinks();
  };

  const handleBulkLinksCreated = (newLinks: ShortLink[]) => {
    loadLinks();
  };

  const handleOpenAnalytics = (link: ShortLink) => {
    setAnalyticsLink(link);
    setCurrentTab('analytics');
  };

  const handleOpenQR = (link: ShortLink) => {
    setQrLink(link);
    setCurrentTab('qr');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'analytics' && currentTab !== 'analytics') {
            setAnalyticsLink(null);
          }
          setCurrentTab(tab);
        }}
        onOpenCreate={() => setCurrentTab('shorten')}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        currentUser={currentUser}
      />
      <AdFrame
        title="Adsterra 300 by 250 banner"
        width={300}
        height={250}
        srcDoc={adsterra300SrcDoc}
      />
      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'shorten' && (
          <div>
            <HeroShortener
              currentUser={currentUser}
              onLinkCreated={handleLinkCreated}
              onTestRedirect={(link) => setGatewayLink(link)}
              onOpenQR={handleOpenQR}
              onOpenAnalytics={handleOpenAnalytics}
            />

            {/* Quick overview of latest 5 links below the hero */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80">
              <LinkManagement
                links={links.slice(0, 5)}
                onRefresh={loadLinks}
                onEditLink={(link) => setEditingLink(link)}
                onOpenQR={handleOpenQR}
                onOpenAnalytics={handleOpenAnalytics}
                onTestRedirect={(link) => setGatewayLink(link)}
                onCreateNew={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>
          </div>
        )}
        <AdFrame
          title="Adsterra native banner"
          width={320}
          height={300}
          srcDoc={adsterraNativeSrcDoc}
        />
        {currentTab === 'links' && (
          <LinkManagement
            links={links}
            onRefresh={loadLinks}
            onEditLink={(link) => setEditingLink(link)}
            onOpenQR={handleOpenQR}
            onOpenAnalytics={handleOpenAnalytics}
            onTestRedirect={(link) => setGatewayLink(link)}
            onCreateNew={() => setCurrentTab('shorten')}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            links={links}
            selectedLink={analyticsLink}
            onSelectLink={(l) => setAnalyticsLink(l)}
          />
        )}

        {currentTab === 'bulk' && (
          <BulkShortener
            currentUser={currentUser}
            onLinksCreated={handleBulkLinksCreated}
          />
        )}

        {currentTab === 'qr' && (
          <QRStudio
            links={links}
            initialLink={qrLink}
          />
        )}
      </main>
      <AdFrame
        title="Adsterra 728 by 90 banner"
        width={728}
        height={90}
        srcDoc={adsterra728SrcDoc}
      />
      {/* Clean, Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white">
              <Link2 className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LynxURL</span>
            <span>&bull; Production URL Shortener &amp; Link Management CMS</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Netlify &amp; PHP ZIP Package</span>
            </button>
            <span aria-hidden="true">&bull;</span>
            <button
              onClick={() => setIsAccountOpen(true)}
              className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Developer API
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LinkEditModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSave={(updated) => {
          loadLinks();
          setEditingLink(null);
        }}
      />

      <RedirectGatewayModal
        link={gatewayLink}
        onClose={() => setGatewayLink(null)}
        onLinkUpdated={loadLinks}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
        onResetDatabase={() => {
          StorageService.resetToDefault();
          loadLinks();
          setCurrentUser(StorageService.getCurrentUser());
        }}
      />

    </div>
  );
}
