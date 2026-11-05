import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Layers, Image as ImageIcon, GraduationCap, Wrench, BookOpen, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useRouter } from '../../context/RouterContext';
import { ToolNestLogo } from '../common/Logo';

interface NavbarProps {
  onOpenSearch: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useRouter();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'All Tools', href: '/tools' },
    { label: 'Image Tools', href: '/category/image-tools' },
    { label: 'PDF Tools', href: '/category/pdf-tools' },
    { label: 'Academic', href: '/category/student-tools' },
    { label: 'Daily Utilities', href: '/category/utility-tools' },
    { label: 'Guides', href: '/guides' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo Zone */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition-opacity"
              aria-label="ToolNest Homepage"
            >
              <ToolNestLogo size="md" />
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative py-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Action & Mobile Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100/90 hover:bg-slate-200/80 active:bg-slate-200 rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
              aria-label="Search all tools"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline font-semibold text-slate-700">Search tools...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden animate-in fade-in duration-150">
          <div className="bg-white h-full overflow-y-auto px-4 py-5 flex flex-col justify-between shadow-2xl border-b border-slate-200">
            <div className="space-y-4">
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-sm text-slate-600 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">Search all 72 tools...</span>
                </div>
                <span className="text-2xs font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Tap to search
                </span>
              </button>

              {/* Category Navigation Tiles */}
              <div>
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
                  Browse by Category
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/tools"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">All Tools Directory</div>
                        <div className="text-xs text-slate-500">Comprehensive searchable index</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/category/image-tools"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/50 active:bg-emerald-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Image Tools</div>
                        <div className="text-xs text-slate-500">Compress, convert, resize, crop</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/category/pdf-tools"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50/50 active:bg-rose-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">PDF Tools</div>
                        <div className="text-xs text-slate-500">Merge, split, convert to PDF</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/category/student-tools"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50/50 active:bg-violet-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Student & Academic</div>
                        <div className="text-xs text-slate-500">CGPA, weighted grades & formulas</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/category/utility-tools"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/50 active:bg-amber-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Daily Utilities</div>
                        <div className="text-xs text-slate-500">UUIDs, timestamps, formatters</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/guides"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Guides & Tutorials</div>
                        <div className="text-xs text-slate-500">Format comparisons and walk-throughs</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-around text-xs font-semibold text-slate-600">
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-700 py-1">About</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-700 py-1">Contact</Link>
                <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-700 py-1">Privacy</Link>
                <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-700 py-1">Terms</Link>
              </div>
              <div className="text-center text-2xs text-slate-400">
                ToolNest · Everyday Tools. One Simple Place.
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
