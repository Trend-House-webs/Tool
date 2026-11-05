import React from 'react';
import { ShieldCheck, Zap, Lock, ArrowUpRight } from 'lucide-react';
import { Link } from '../../context/RouterContext';
import { ToolNestLogo } from '../common/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Value Proposition */}
          <div className="space-y-4">
            <Link to="/" className="inline-block" aria-label="ToolNest Homepage">
              <ToolNestLogo size="md" variant="light" showTagline />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Everyday Tools. One Simple Place. High-performance browser utilities engineered with client-side web APIs so your photos, documents, and calculations are computed locally with zero server file uploads.
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-2 font-medium text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                100% In-Browser Execution
              </span>
              <span className="flex items-center gap-2 font-medium text-amber-400">
                <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                Instant Zero-Latency Processing
              </span>
              <span className="flex items-center gap-2 font-medium text-slate-300">
                <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                No Accounts · No Subscriptions
              </span>
            </div>
          </div>

          {/* Tools Catalog */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Tools Catalog
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/tools" className="hover:text-emerald-400 transition-colors">
                  All Tools Directory (72)
                </Link>
              </li>
              <li>
                <Link to="/category/image-tools" className="hover:text-emerald-400 transition-colors">
                  Image Tools (22)
                </Link>
              </li>
              <li>
                <Link to="/category/pdf-tools" className="hover:text-emerald-400 transition-colors">
                  PDF Tools (7)
                </Link>
              </li>
              <li>
                <Link to="/category/student-tools" className="hover:text-emerald-400 transition-colors">
                  Student & Math Tools (18)
                </Link>
              </li>
              <li>
                <Link to="/category/utility-tools" className="hover:text-emerald-400 transition-colors">
                  Daily & Text Utilities (16)
                </Link>
              </li>
              <li>
                <Link to="/category/student-utility" className="hover:text-emerald-400 transition-colors">
                  Productivity Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Practical Guides */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Helpful Guides
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/guides/how-to-compress-images-online" className="hover:text-emerald-400 transition-colors">
                  Compress Images Cleanly
                </Link>
              </li>
              <li>
                <Link to="/guides/jpg-vs-png-vs-webp" className="hover:text-emerald-400 transition-colors">
                  JPG vs PNG vs WebP Guide
                </Link>
              </li>
              <li>
                <Link to="/guides/how-to-resize-an-image-without-losing-quality" className="hover:text-emerald-400 transition-colors">
                  Resize Without Quality Loss
                </Link>
              </li>
              <li>
                <Link to="/guides/how-to-convert-images-to-pdf" className="hover:text-emerald-400 transition-colors">
                  Convert Images to PDF
                </Link>
              </li>
              <li className="pt-1.5">
                <Link to="/guides" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">
                  <span>Browse All Guides & Tutorials</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Trust
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About ToolNest
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact & Tool Suggestions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-emerald-400 transition-colors">
                  Tool Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} ToolNest. Everyday Tools. One Simple Place. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Client-side execution via HTML5 Canvas, WebAssembly & JavaScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
