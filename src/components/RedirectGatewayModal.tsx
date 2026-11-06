import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { ShortLink } from '../types';
import { StorageService } from '../services/storage';

interface RedirectGatewayModalProps {
  link: ShortLink | null;
  onClose: () => void;
  onLinkUpdated: () => void;
}

export const RedirectGatewayModal: React.FC<RedirectGatewayModalProps> = ({
  link,
  onClose,
  onLinkUpdated,
}) => {
  if (!link) return null;

  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!link.password);
  const [countdown, setCountdown] = useState(3);
  const [redirectResult, setRedirectResult] = useState<{
    targetUrl: string;
    success: boolean;
    reason?: string;
  } | null>(null);

  // Check initial state
  const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
  const isLimitReached = link.clickLimit && link.clicksCount >= link.clickLimit;
  const isBlocked = !link.isActive || isExpired || isLimitReached;

  useEffect(() => {
    if (isUnlocked && !isBlocked) {
      // Record real click event
      try {
        const result = StorageService.recordClick(link.slug);
        setRedirectResult(result);
        onLinkUpdated();
      } catch (err: any) {
        setRedirectResult({
          targetUrl: link.destinationUrl,
          success: false,
          reason: err.message,
        });
      }

      // Countdown timer for automatic redirect simulation
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isUnlocked, isBlocked, link.slug]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === link.password) {
      setPasswordError(false);
      setIsUnlocked(true);
    } else {
      setPasswordError(true);
    }
  };

  const handleManualRedirect = () => {
    const dest = redirectResult?.targetUrl || link.destinationUrl;
    window.open(dest, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* State 1: Blocked (Expired, limit reached, or paused) */}
        {isBlocked ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Link Unavailable
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {!link.isActive
                ? 'This link has been paused by its creator and is not accepting traffic.'
                : isExpired
                ? `This link expired on ${new Date(link.expiresAt!).toLocaleDateString()}.`
                : 'This link has reached its maximum allocated click limit.'}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 truncate mb-6">
              lynx.link/s/{link.slug}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Close Gateway
            </button>
          </div>
        ) : !isUnlocked ? (
          
          /* State 2: Password Protected Gateway Challenge */
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Password Protected Link
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              The creator of <span className="font-mono text-blue-600">/s/{link.slug}</span> has secured this link with a passcode.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter passcode to unlock"
                  autoFocus
                  required
                  className={`w-full text-center text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border ${
                    passwordError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />

                {passwordError && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                Unlock Destination &rarr;
              </button>
            </form>
          </div>
        ) : (

          /* State 3: Active & Redirecting */
          <div className="text-center py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Gateway Verified!
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Click event logged in analytics telemetry.
            </div>

            {/* Destination URL card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Destination Target:
              </span>
              <div className="text-xs font-mono text-slate-900 dark:text-slate-100 truncate font-semibold">
                {redirectResult?.targetUrl || link.destinationUrl}
              </div>
            </div>

            {/* Countdown feedback */}
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-5 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {countdown > 0
                  ? `Simulating automatic redirect in ${countdown}s...`
                  : 'Ready to proceed!'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRedirect}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Open Destination Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
