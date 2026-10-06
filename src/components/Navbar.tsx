import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#050508]/85 backdrop-blur-md border-b border-[#1f1f2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Adobe MAX style */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF2D2D] flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-[0_0_12px_rgba(255,45,45,0.5)]">
              EX
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                EMBEDX <span className="text-[#FF2D2D] font-black text-xs px-1.5 py-0.5 bg-[#FF2D2D]/10 rounded border border-[#FF2D2D]/30">MAX</span>
              </span>
              <span className="block text-[9px] font-bold tracking-widest text-gray-400 uppercase leading-none -mt-0.5">
                PCB Workshop 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 h-full">
            <Link
              to="/"
              className={`text-sm h-full flex items-center transition-colors ${
                isActive('/')
                  ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </Link>

            {currentUser && (
              <>
                <Link
                  to="/register"
                  className={`text-sm h-full flex items-center transition-colors ${
                    isActive('/register')
                      ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Registration
                </Link>

                <Link
                  to="/payment"
                  className={`text-sm h-full flex items-center transition-colors ${
                    isActive('/payment')
                      ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Payment (₹70)
                </Link>

                <Link
                  to="/ticket"
                  className={`text-sm h-full flex items-center transition-colors ${
                    isActive('/ticket')
                      ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My Ticket
                </Link>
              </>
            )}

            {(role === 'scanner' || role === 'admin' || role === 'super_admin') && (
              <Link
                to="/scanner"
                className={`text-sm h-full flex items-center transition-colors ${
                  isActive('/scanner')
                    ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Scanner
              </Link>
            )}

            {(role === 'admin' || role === 'super_admin') && (
              <Link
                to="/admin"
                className={`text-sm h-full flex items-center transition-colors ${
                  isActive('/admin')
                    ? 'text-white font-semibold border-b-2 border-[#FF2D2D]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{currentUser.displayName || currentUser.email}</p>
                  <span className="block text-[10px] text-[#FF2D2D] uppercase tracking-wider font-bold">{role}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 text-xs font-semibold text-gray-300 bg-[#14141e] hover:bg-[#1f1f2e] border border-[#2a2a3c] rounded-full transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#FF2D2D] hover:bg-[#E02222] rounded-full transition-all shadow-[0_0_15px_rgba(255,45,45,0.4)] hover:shadow-[0_0_20px_rgba(255,45,45,0.6)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a10] border-b border-[#1f1f2e] px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base ${isActive('/') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
          >
            Overview
          </Link>

          {currentUser && (
            <>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base ${isActive('/register') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
              >
                Registration
              </Link>
              <Link
                to="/payment"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base ${isActive('/payment') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
              >
                Payment (₹70)
              </Link>
              <Link
                to="/ticket"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base ${isActive('/ticket') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
              >
                My Ticket
              </Link>
            </>
          )}

          {(role === 'scanner' || role === 'admin' || role === 'super_admin') && (
            <Link
              to="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base ${isActive('/scanner') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
            >
              Scanner App
            </Link>
          )}

          {(role === 'admin' || role === 'super_admin') && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base ${isActive('/admin') ? 'font-semibold text-white bg-[#14141f]' : 'font-medium text-gray-400 hover:text-white'}`}
            >
              Admin Dashboard
            </Link>
          )}

          {currentUser ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full text-left px-3 py-2 mt-2 text-base font-medium text-gray-400 border-t border-[#1f1f2e]"
            >
              Sign Out ({currentUser.email})
            </button>
          ) : (
            <div className="pt-4 mt-2 border-t border-[#1f1f2e] flex flex-col gap-3 px-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-full border border-[#2a2a3c] text-white font-medium hover:bg-[#14141f]"
              >
                Sign In
              </Link>
              <Link
                to="/login?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-full bg-[#FF2D2D] text-white font-bold hover:bg-[#E02222]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
