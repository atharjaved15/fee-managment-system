import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CollegeConfig } from '../types';
import { CollegeLogo } from './CollegeLogo';
import { TPCLogo } from './TPCLogo';
import { Phone, MapPin, ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface LoginViewProps {
  config: CollegeConfig;
  onShowToast: (message: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ config, onShowToast }) => {
  const { signInWithGoogle, authError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      onShowToast('Signed in successfully.');
    } catch (err: unknown) {
      setIsSigningIn(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top institution bar */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/70 backdrop-blur-xs flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-300">Official Administrative Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Phone className="w-3.5 h-3.5" />
            <span>{config.phone || '0323 8091599'}</span>
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-700/60 max-w-[280px] sm:max-w-[340px]">
              <TPCLogo variant="full" size="lg" className="w-full h-auto" />
            </div>
          </div>

          <div className="mb-6 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-block">
              Campus Fee Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mt-2">
              {config.universityName || 'Sarhad University SSC Mailsi'}
            </h1>
            <h2 className="text-sm sm:text-base font-bold text-amber-400 tracking-wide leading-tight">
              {config.collegeName || 'The Physio College Mailsi'}
            </h2>
            <p className="text-xs text-slate-400 pt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{config.address || 'Faddah Chungi Chowk, Vehari Road, Mailsi, 61200'}</span>
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Sign In Options */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-md transition transform active:scale-98 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google Account'}</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Authorized Access Only for College Administrative Staff</span>
            </p>
            <p className="text-slate-500">Contact: {config.phone}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-slate-400 border-t border-slate-900 bg-slate-950/80">
        &copy; {new Date().getFullYear()} {config.universityName} &bull; {config.collegeName}. All rights reserved.
      </footer>
    </div>
  );
};
