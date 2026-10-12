import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInWithGoogle } from '../../supabaseClient.js';
import { X, ShieldCheck, Compass, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      // Browser will redirect to Google consent screen
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize Google OAuth session.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">EcoRoute AI</h3>
            <p className="text-xs text-slate-400">Municipal Authentication Portal</p>
          </div>
        </div>

        {currentUser ? (
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Signed In via Google</span>
              </div>
              <p className="text-white font-medium mt-1 truncate">{currentUser.email}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Session verified with Supabase OAuth
              </p>
            </div>

            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Sign in with your municipal or administrative Google account to synchronize collection routes and vehicle dispatches across devices.
            </p>

            {errorMsg && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* The exact requested "Continue with Google" button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white py-3 px-4 text-sm font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg disabled:opacity-60 active:scale-[0.99]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.93.56 4.02 1.48l3.02-3.02C17.21 1.76 14.77 1 12 1 7.5 1 3.67 3.58 1.8 7.34l3.66 2.84C6.34 7.36 8.94 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.82-.07-1.6-.2-2.3H12v4.6h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.86c2.15-1.99 3.72-4.92 3.72-8.74z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.46 14.82c-.24-.72-.38-1.49-.38-2.32 0-.83.14-1.6.38-2.32L1.8 7.34C.66 9.62 0 12.22 0 15s.66 5.38 1.8 7.66l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.96-1.07 7.96-2.92l-3.68-2.86c-1.08.73-2.46 1.18-4.28 1.18-3.06 0-5.66-2.36-6.54-5.18L1.8 16c1.87 3.76 5.7 6.34 10.2 6.34z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-500">
              Secured with Supabase OAuth &middot; No passwords stored
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
