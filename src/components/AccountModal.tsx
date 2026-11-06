import React, { useState } from 'react';
import { 
  X, 
  User, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Code2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService } from '../services/storage';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserChanged: (user: UserAccount) => void;
  onResetDatabase: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onResetDatabase,
}) => {
  if (!isOpen) return null;

  const [copiedKey, setCopiedKey] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js'>('curl');

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(currentUser.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'lx_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const updated: UserAccount = {
      ...currentUser,
      apiKey: newKey,
    };
    StorageService.setCurrentUser(updated);
    onUserChanged(updated);
  };

  const handleRoleSelect = (role: 'admin' | 'user' | 'guest') => {
    const updated = StorageService.switchUserRole(role);
    onUserChanged(updated);
  };

  const curlExample = `curl -X POST "${window.location.origin}/api.php?action=shorten" \\
  -H "Authorization: Bearer ${currentUser.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourdomain.com/launch-event",
    "custom_slug": "spring-sale",
    "title": "Spring Launch Promo"
  }'`;

  const jsExample = `const response = await fetch("${window.location.origin}/api.php?action=shorten", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${currentUser.apiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://yourdomain.com/launch-event",
    custom_slug: "spring-sale"
  })
});
const data = await response.json();
console.log("Shortened URL:", data.short_url);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account &amp; Developer API
              </h3>
              <p className="text-xs text-slate-500">
                Manage profile role, authentication, and REST API tokens.
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          
          {/* Account Profile Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Current Session Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRoleSelect('admin')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  currentUser.role === 'admin'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Morgan</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400">Admin &bull; Pro</div>
              </button>

              <button
                onClick={() => handleRoleSelect('user')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  currentUser.role === 'user'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">Jordan Lee</div>
                <div className="text-[11px] text-slate-500">User &bull; Free</div>
              </button>

              <button
                onClick={() => handleRoleSelect('guest')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  currentUser.role === 'guest'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">Anonymous</div>
                <div className="text-[11px] text-slate-500">Guest Visitor</div>
              </button>
            </div>
          </div>

          {/* Developer API Key */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>REST API Key (Bearer Token)</span>
              </span>
              <button
                onClick={handleRegenerateKey}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUser.apiKey}
                className="flex-1 text-xs font-mono px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 select-all"
              />
              <button
                onClick={handleCopyApiKey}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Pass this key in the <code>Authorization: Bearer {'<token>'}</code> header to create links programmatically.
            </p>
          </div>

          {/* Programmatic API Snippets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                API Integration Snippets
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    activeCodeTab === 'curl' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab('js')}
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    activeCodeTab === 'js' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  JavaScript
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300">
              <pre>{activeCodeTab === 'curl' ? curlExample : jsExample}</pre>
            </div>
          </div>

          {/* Database Reset */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Reset Demo Data
              </div>
              <div className="text-[11px] text-slate-400">
                Restore initial seed links, analytics, and sample telemetry.
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset LynxURL database back to original demo state?')) {
                  onResetDatabase();
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
