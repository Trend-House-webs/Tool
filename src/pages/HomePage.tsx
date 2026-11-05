import React, { useState } from 'react';
import { Search, Shield, Zap, Sparkles, UserX, ArrowRight, Image as ImageIcon, GraduationCap, FileText, Wrench, Layers, BookOpen, Clock } from 'lucide-react';
import { TOOLS, FEATURED_TOOLS, POPULAR_TOOLS, IMAGE_TOOLS, PDF_TOOLS, STUDENT_TOOLS, UTILITY_TOOLS, STUDENT_UTILITY_TOOLS } from '../data/tools';
import { GUIDES } from '../data/guides';
import { ToolCard } from '../components/common/ToolCard';
import { SEO } from '../components/common/SEO';
import { Link, useRouter } from '../context/RouterContext';
import { SITE_DESCRIPTION, SITE_URL } from '../config/site';

interface HomePageProps {
  onOpenSearchModal: () => void;
}

export function HomePage({ onOpenSearchModal }: HomePageProps) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'image' | 'pdf' | 'student' | 'utility'>('all');
  const [heroSearch, setHeroSearch] = useState('');
  const { navigate } = useRouter();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) {
      onOpenSearchModal();
      return;
    }
    const query = heroSearch.toLowerCase().trim();
    const matched = TOOLS.find((t) =>
      t.name.toLowerCase().includes(query) ||
      t.slug.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
    if (matched) {
      navigate(`/tools/${matched.slug}`);
    } else {
      onOpenSearchModal();
    }
  };

  const displayedCategoryTools =
    selectedCategoryTab === 'all'
      ? TOOLS
      : selectedCategoryTab === 'image'
      ? IMAGE_TOOLS
      : selectedCategoryTab === 'pdf'
      ? PDF_TOOLS
      : selectedCategoryTab === 'student'
      ? STUDENT_TOOLS
      : UTILITY_TOOLS;

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ToolNest',
    url: `${SITE_URL}/`,
    description: 'Everyday Tools. One Simple Place. Fast, private tools for images, files, calculations and everyday tasks.',
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      {/* Dynamic SEO Tags & WebSite Structured Data */}
      <SEO
        title="ToolNest — Everyday Tools. One Simple Place."
        description={SITE_DESCRIPTION}
        canonicalPath="/"
        schema={websiteSchema}
      />

      {/* 1. Hero Section */}
      <section className="relative pt-6 pb-2 sm:pt-12 sm:pb-6 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* Unboxed Brand Kicker */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide">
            <span className="font-bold text-emerald-600">TOOLNEST</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>EVERYDAY TOOLS. ONE SIMPLE PLACE.</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>100% IN-BROWSER</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
            Fast, Private Browser Utilities for Everyday Work
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            ToolNest unites essential digital utilities in one clean, distraction-free suite. Compress photos, merge PDF documents, solve equations, and format text directly in your browser with zero logins and zero server file uploads.
          </p>

          {/* Primary Tool Search Omnibar */}
          <div className="max-w-xl mx-auto pt-2">
            <form
              onSubmit={handleHeroSubmit}
              className="relative flex items-center shadow-md shadow-slate-900/5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 focus-within:border-emerald-500 focus-within:ring-3 focus-within:ring-emerald-500/20 transition-all p-1.5"
            >
              <Search className="w-5 h-5 text-emerald-600 ml-3 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search tools (e.g. image compressor, word counter, merge pdf)..."
                className="w-full py-2.5 px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
                aria-label="Search tools"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Search
              </button>
            </form>
          </div>

          {/* Clean Unboxed Trust Markers */}
          <div className="pt-1 text-xs text-slate-500 font-medium flex items-center justify-center flex-wrap gap-2">
            <span>Free to use</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>No sign-up required</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>In-browser processing</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Zero server file uploads</span>
          </div>

          {/* Choose a Tool Category Quick Jump Hub */}
          <div className="pt-6 max-w-4xl mx-auto text-left">
            <div className="text-2xs sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Explore by Category
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link
                to="/category/image-tools"
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Image Tools
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    Compress, resize & convert
                  </div>
                </div>
                <div className="text-2xs font-semibold text-emerald-700 mt-3 flex items-center gap-0.5">
                  <span>Browse {IMAGE_TOOLS.length}</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/category/pdf-tools"
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
                    PDF Tools
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    Merge, split & convert to PDF
                  </div>
                </div>
                <div className="text-2xs font-semibold text-rose-700 mt-3 flex items-center gap-0.5">
                  <span>Browse {PDF_TOOLS.length}</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/category/student-tools"
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center mb-2.5 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-violet-700 transition-colors">
                    Student & Math
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    CGPA, grades & formulas
                  </div>
                </div>
                <div className="text-2xs font-semibold text-violet-700 mt-3 flex items-center gap-0.5">
                  <span>Browse {STUDENT_TOOLS.length}</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/category/utility-tools"
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                    Daily Utilities
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    UUIDs, timestamps & formatters
                  </div>
                </div>
                <div className="text-2xs font-semibold text-amber-700 mt-3 flex items-center gap-0.5">
                  <span>Browse {UTILITY_TOOLS.length}</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/category/student-utility"
                className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between col-span-2 sm:col-span-1"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    Productivity Hub
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5 line-clamp-1">
                    Academic & utility suite
                  </div>
                </div>
                <div className="text-2xs font-semibold text-teal-700 mt-3 flex items-center gap-0.5">
                  <span>Browse {STUDENT_UTILITY_TOOLS.length}</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Utilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Popular Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              High-frequency browser utilities ready to run instantly.
            </p>
          </div>

          <Link
            to="/tools"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            All {TOOLS.length} tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_TOOLS.slice(0, 8).map((tool) => (
            <ToolCard key={tool.id} tool={tool} variant="compact" />
          ))}
        </div>
      </section>

      {/* 3. Featured Tools Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              Curated Utilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Tools
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Essential image optimization, document assembly, and academic calculators.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_TOOLS.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 4. Categorized Catalog with Segmented Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Complete Tools Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Filter by department or browse the entire in-browser utility catalog.
            </p>
          </div>

          {/* Segmented Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto" role="tablist">
            <button
              role="tab"
              aria-selected={selectedCategoryTab === 'all'}
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({TOOLS.length})
            </button>
            <button
              role="tab"
              aria-selected={selectedCategoryTab === 'image'}
              onClick={() => setSelectedCategoryTab('image')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === 'image'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Image ({IMAGE_TOOLS.length})
            </button>
            <button
              role="tab"
              aria-selected={selectedCategoryTab === 'pdf'}
              onClick={() => setSelectedCategoryTab('pdf')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === 'pdf'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF ({PDF_TOOLS.length})
            </button>
            <button
              role="tab"
              aria-selected={selectedCategoryTab === 'student'}
              onClick={() => setSelectedCategoryTab('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === 'student'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student ({STUDENT_TOOLS.length})
            </button>
            <button
              role="tab"
              aria-selected={selectedCategoryTab === 'utility'}
              onClick={() => setSelectedCategoryTab('utility')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === 'utility'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Utilities ({UTILITY_TOOLS.length})
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCategoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 5. Practical Guides & Tutorials Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/90 rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Base</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Practical Guides & Workflow Tutorials
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Step-by-step walk-throughs and format comparisons to help you optimize photos, resize dimensions cleanly, and assemble documents.
              </p>
            </div>
            <Link
              to="/guides"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
            >
              <span>View All Guides & Tutorials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-2xs text-slate-500 mb-2">
                    <span className="font-semibold text-emerald-700">{g.categoryName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {g.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {g.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:text-emerald-800">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why ToolNest? Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="max-w-xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Why ToolNest?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
              Everyday Tools. One Simple Place. Frictionless web utilities without accounts, paywalls, or remote upload queues.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">100% Free</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                All {TOOLS.length} utilities are free to use. No paywalls, subscription fees, or trial limitations.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Lightning Fast</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Operations execute locally using native browser APIs. Zero network lag, queue wait times, or server delay.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">In-Browser Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Your images, documents, and calculation parameters are processed in browser memory without server file uploads.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zero Sign-Up</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                No email prompts, password forms, or registration barriers. Open any tool and get to work immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
