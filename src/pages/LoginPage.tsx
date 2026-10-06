import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles, Cpu } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isSignUpDefault = searchParams.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/register');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/register');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#050508] text-white">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        {/* Left Visual Banner (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden bg-[#0a0a0f] p-12 flex-col justify-between border-r border-[#1f1f2e]">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-pcb.jpg"
              alt="PCB Background"
              className="w-full h-full object-cover filter brightness-50 contrast-125 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-[#050508]/40 z-10" />
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#FF2D2D]/20 rounded-full blur-[140px] pointer-events-none z-10" />
          </div>

          <div className="relative z-20">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#FF2D2D] flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-[0_0_15px_rgba(255,45,45,0.5)]">
                EX
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                EMBEDX <span className="text-[#FF2D2D] font-black text-xs px-1.5 py-0.5 bg-[#FF2D2D]/10 rounded border border-[#FF2D2D]/30">MAX</span>
              </span>
            </Link>
          </div>

          <div className="relative z-20 space-y-4 my-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF2D2D]/10 text-[#FF2D2D] text-xs font-bold uppercase tracking-wider border border-[#FF2D2D]/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STUDENT PORTAL ACCESS</span>
            </div>

            <h2 className="text-4xl font-black text-white leading-tight">
              Hardware begins with your first circuit.
            </h2>

            <p className="text-sm text-gray-300 max-w-md leading-relaxed">
              Sign in to reserve your college PIN, access workshop materials, and receive your verified entry ticket.
            </p>
          </div>

          <div className="relative z-20 pt-6 border-t border-[#222234] flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-4 h-4 text-[#FF2D2D]" />
              Government Institute of Electronics
            </span>
            <span>Secunderabad</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center sm:text-left space-y-2">
              <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D2D]/10 text-[#FF2D2D] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FF2D2D]/30">
                {isSignUp ? 'Student Account' : 'Portal Sign In'}
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>

              <p className="text-sm text-gray-400">
                Sign in to register for the EmbedX PCB Workshop 2026
              </p>
            </div>

            {error && (
              <div className="alert-error">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-[#161622] border border-[#2a2a3e] text-white font-semibold flex items-center justify-center gap-3 transition-all hover:border-[#FF2D2D] hover:bg-[#1a1a2a] disabled:opacity-50 shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <div className="divider-text text-gray-500">Or with email</div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="form-label text-gray-400">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-gray-400">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon text-gray-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-pill w-full mt-2">
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Student Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-sm text-gray-400 pt-2">
              {isSignUp ? (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-[#FF2D2D] font-bold hover:underline ml-1"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-[#FF2D2D] font-bold hover:underline ml-1"
                  >
                    Sign up now
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
