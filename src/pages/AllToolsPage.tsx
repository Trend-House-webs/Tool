import React, { useState } from 'react';
import { Search, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data/tools';
import { GUIDES } from '../data/guides';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolCard } from '../components/common/ToolCard';
import { SEO } from '../components/common/SEO';
import { SITE_URL } from '../config/site';
import { Link } from '../context/RouterContext';

export function AllToolsPage() {
  const [filter, setFilter] = useState<'all' | 'image' | 'pdf' | 'student' | 'utility'>('all');
  const [search, setSearch] = useState('');

  const imageCount = TOOLS.filter((t) => t.category === 'image').length;
  const pdfCount = TOOLS.filter((t) => t.category === 'pdf').length;
  const studentCount = TOOLS.filter((t) => t.category === 'student').length;
  const utilityCount = TOOLS.filter((t) => t.category === 'utility').length;

  const filtered = TOOLS.filter((t) => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q)
    );
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools Directory',
        item: `${SITE_URL}/tools`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* SEO & Structured Data */}
      <SEO
        title="All Free Online Tools Directory — ToolNest"
        description="Browse our complete directory of free online browser utilities. Fast, client-side, with zero sign-up or payments."
        canonicalPath="/tools"
        schema={breadcrumbSchema}
      />

      <Breadcrumbs items={[{ label: 'All Tools Directory' }]} />

      {/* Category Jump Links & Short Descriptions */}
      <section className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Browse Tools by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Jump directly to specialized category hubs or browse the unified index below.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            5 Dedicated Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group p-4 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.title}
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {cat.count}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  {cat.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-3 group-hover:translate-x-0.5 transition-transform">
                Explore Hub <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Complete Index
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            All Free Online Tools ({TOOLS.length})
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed max-w-2xl">
            Welcome to the complete ToolNest tools directory. Browse online tools across image editing, PDF document assembly, student GPA calculators, and everyday utilities. This comprehensive browser utilities index and free web tools list runs client-side in your device memory with zero accounts, subscriptions, or server file uploads.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto" role="tablist">
            <button
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({TOOLS.length})
            </button>
            <button
              role="tab"
              aria-selected={filter === 'image'}
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Image ({imageCount})
            </button>
            <button
              role="tab"
              aria-selected={filter === 'pdf'}
              onClick={() => setFilter('pdf')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'pdf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF ({pdfCount})
            </button>
            <button
              role="tab"
              aria-selected={filter === 'student'}
              onClick={() => setFilter('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student ({studentCount})
            </button>
            <button
              role="tab"
              aria-selected={filter === 'utility'}
              onClick={() => setFilter('utility')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'utility' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Utility ({utilityCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all tools..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Search all tools directory"
            />
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500">
          <p className="text-base font-semibold">No tools found matching your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search or category filter.</p>
        </div>
      )}

      {/* Practical Guides & Workflow Tutorials */}
      <section className="pt-10 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Step-by-Step Tutorials</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Practical Guides for ToolNest Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Learn how to get the cleanest compression, correct photo dimensions, and assemble documents.
            </p>
          </div>
          <Link
            to="/guides"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
          >
            <span>All Guides & Tutorials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
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
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:text-emerald-800">
                <span>Read Tutorial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
