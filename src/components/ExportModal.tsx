import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Copy, 
  Check, 
  FileCode, 
  Server, 
  Cloud, 
  Database, 
  FolderArchive,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { 
  ExporterService, 
  PHP_CONFIG_CODE, 
  PHP_REDIRECT_CODE, 
  PHP_API_CODE, 
  PHP_HTACCESS_CODE, 
  MYSQL_DATABASE_SQL, 
  NETLIFY_TOML_CODE, 
  NETLIFY_REDIRECTS_CODE,
  PHP_README_GUIDE,
  NETLIFY_README_GUIDE
} from '../services/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'zip' | 'php_config' | 'php_redirect' | 'php_api' | 'sql' | 'htaccess' | 'netlify'>('zip');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const blob = await ExporterService.generateDeploymentZip();
      ExporterService.downloadBlob(blob, `lynxurl-complete-deployment-package-${Date.now()}.zip`);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      alert('Error creating ZIP archive.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCodeContent = () => {
    switch (activeTab) {
      case 'php_config':
        return PHP_CONFIG_CODE;
      case 'php_redirect':
        return PHP_REDIRECT_CODE;
      case 'php_api':
        return PHP_API_CODE;
      case 'htaccess':
        return PHP_HTACCESS_CODE;
      case 'sql':
        return MYSQL_DATABASE_SQL;
      case 'netlify':
        return `${NETLIFY_TOML_CODE}\n\n# --- _redirects ---\n${NETLIFY_REDIRECTS_CODE}`;
      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    const code = getCodeContent();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Download &amp; Deployment Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete package ready for Netlify and standard PHP/cPanel hosting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
          <button
            onClick={() => setActiveTab('zip')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'zip'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Download ZIP
          </button>
          <button
            onClick={() => setActiveTab('php_config')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'php_config'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            config.php
          </button>
          <button
            onClick={() => setActiveTab('php_redirect')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'php_redirect'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            redirect.php
          </button>
          <button
            onClick={() => setActiveTab('php_api')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'php_api'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            api.php
          </button>
          <button
            onClick={() => setActiveTab('htaccess')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'htaccess'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            .htaccess
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            database.sql
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'netlify'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Netlify Configs
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'zip' ? (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              
              {/* Primary Call To Action */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 text-center">
                <FolderArchive className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Complete Production Deployment ZIP
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-5 leading-relaxed">
                  Includes full standalone PHP 8.x CMS with SQLite &amp; MySQL support, Apache .htaccess rewrites, Netlify configuration, and database dump.
                </p>

                <button
                  onClick={handleDownloadZip}
                  disabled={isGenerating}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Compiling Archive...' : 'Download Complete ZIP File'}</span>
                </button>
              </div>

              {/* What's Inside Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Netlify Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span>Netlify Deployment</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li><code>netlify.toml</code> with build &amp; headers</li>
                    <li><code>_redirects</code> for instant edge routing</li>
                    <li>Serverless redirect functions</li>
                    <li>Drag &amp; Drop or Git connected</li>
                  </ul>
                </div>

                {/* PHP Shared Hosting Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <Server className="w-4 h-4 text-purple-500" />
                    <span>PHP Shared Hosting</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>Runs on PHP 8.0 - 8.3</li>
                    <li>Zero-config SQLite PDO driver</li>
                    <li>MySQL / MariaDB enterprise schema</li>
                    <li>Apache <code>.htaccess</code> &amp; Nginx configs</li>
                  </ul>
                </div>

              </div>

              {/* Quick cPanel / Shared Hosting Guide */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" />
                  <span>Quick Setup on cPanel / Shared Hosting:</span>
                </div>
                <p>1. Extract the zip and upload the contents of <code>php-self-hosted/</code> to your <code>public_html</code>.</p>
                <p className="mt-1">2. Ensure permissions on the <code>/data</code> folder are writable (chmod 755).</p>
                <p className="mt-1">3. That's it! Visit your domain. SQLite will automatically create the database on first run.</p>
              </div>

            </div>
          ) : (
            <div className="relative h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">
                  Viewing: {activeTab === 'netlify' ? 'netlify.toml & _redirects' : `${activeTab}.php`}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4">
                <pre className="text-xs font-mono text-slate-200 whitespace-pre leading-relaxed">
                  {getCodeContent()}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
