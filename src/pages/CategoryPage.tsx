import React, { useState } from 'react';
import { Search, CheckCircle2, ArrowRight, Layers, GraduationCap, Wrench, Image as ImageIcon, FileText, BookOpen, Clock } from 'lucide-react';
import { getCategoryBySlug, TOOLS } from '../data/tools';
import { getGuidesByCategory } from '../data/guides';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolCard } from '../components/common/ToolCard';
import { SEO } from '../components/common/SEO';
import { SITE_URL } from '../config/site';
import { Link } from '../context/RouterContext';

interface CategoryPageProps {
  categorySlug: string;
}

export function CategoryPage({ categorySlug }: CategoryPageProps) {
  const category = getCategoryBySlug(categorySlug);
  const [filterQuery, setFilterQuery] = useState('');
  const [studentUtilityTab, setStudentUtilityTab] = useState<'all' | 'student' | 'utility'>('all');

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <SEO
          title="Category Not Found — ToolNest"
          description="The category you requested does not exist on ToolNest."
          canonicalPath={`/category/${categorySlug}`}
          noindex={true}
        />
        <h1 className="text-2xl font-bold text-slate-900">Category Not Found</h1>
        <p className="text-slate-500 mt-2">The category you requested does not exist.</p>
        <div className="mt-6">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Browse All Tools
          </Link>
        </div>
      </div>
    );
  }

  // Get tools belonging to this category
  const baseCategoryTools = TOOLS.filter((t) =>
    category.id === 'student-utility'
      ? t.category === 'student' || t.category === 'utility' || t.category === 'student-utility'
      : t.category === category.id
  );

  // If on student-utility, allow sub-filtering by academic vs utility
  const categoryTools =
    category.id === 'student-utility' && studentUtilityTab !== 'all'
      ? baseCategoryTools.filter((t) => t.category === studentUtilityTab)
      : baseCategoryTools;

  const categoryGuides = getGuidesByCategory(category.slug);

  // Filter tools by search keyword
  const filteredTools = categoryTools.filter(
    (t) =>
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const studentCount = baseCategoryTools.filter((t) => t.category === 'student').length;
  const utilityCount = baseCategoryTools.filter((t) => t.category === 'utility').length;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.title} — ToolNest`,
    description: category.description,
    url: `${SITE_URL}/category/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: baseCategoryTools.map((t, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/tools/${t.slug}`,
        name: t.name,
      })),
    },
  };

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
        name: category.title,
        item: `${SITE_URL}/category/${category.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* SEO & Structured Data */}
      <SEO
        title={category.metaTitle || `${category.title} — Free Online Utilities | ToolNest`}
        description={category.metaDescription || category.description}
        canonicalPath={`/category/${category.slug}`}
        schema={[collectionSchema, breadcrumbSchema]}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: category.title }]} />

      {/* Header with clear single H1 */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              <span>Directory</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{baseCategoryTools.length} Free Browser Tools</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {category.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Filter input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Search ${category.title}...`}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              aria-label={`Search ${category.title}`}
            />
          </div>
        </div>

        {/* Distinct purpose banner and sub-tabs for student-utility */}
        {category.id === 'student-utility' && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist">
              <button
                role="tab"
                aria-selected={studentUtilityTab === 'all'}
                onClick={() => setStudentUtilityTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  studentUtilityTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                All Productivity ({baseCategoryTools.length})
              </button>
              <button
                role="tab"
                aria-selected={studentUtilityTab === 'student'}
                onClick={() => setStudentUtilityTab('student')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  studentUtilityTab === 'student'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Academic Solvers ({studentCount})
              </button>
              <button
                role="tab"
                aria-selected={studentUtilityTab === 'utility'}
                onClick={() => setStudentUtilityTab('utility')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  studentUtilityTab === 'utility'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Daily Utilities ({utilityCount})
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Dedicated sections:</span>
              <Link
                to="/category/student-tools"
                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
              >
                Student Tools <ArrowRight className="w-3 h-3" />
              </Link>
              <span>·</span>
              <Link
                to="/category/utility-tools"
                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
              >
                Daily Utilities <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Visible Category Introduction & Capabilities */}
      {(category.introParagraph || (category.highlights && category.highlights.length > 0)) && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5">
          {category.introParagraph && (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {category.introParagraph}
            </p>
          )}

          {category.highlights && category.highlights.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Key Capabilities in this Suite
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {category.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Types of Tools & Selection Guide */}
      {category.toolTypes && category.toolTypes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Category Guide
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tool Types & Selection Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Understand which utilities belong in this collection and when to choose each tool for your task.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {category.toolTypes.map((type, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>{type.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {type.description}
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold block mb-0.5">When to choose:</strong>
                    <span>{type.whenToChoose}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                    Included tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {type.toolSlugs.map((slug) => {
                      const t = TOOLS.find((item) => item.slug === slug);
                      if (!t) return null;
                      return (
                        <Link
                          key={slug}
                          to={`/tools/${slug}`}
                          className="px-2.5 py-1 text-2xs sm:text-xs font-medium text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-md transition-colors"
                        >
                          {t.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="text-base font-semibold">No tools found matching "{filterQuery}"</p>
          <p className="text-xs text-slate-400 mt-1">Try another search keyword or clear your filter.</p>
          <button
            onClick={() => setFilterQuery('')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Helpful Guides for Category */}
      {categoryGuides.length > 0 && (
        <section className="pt-10 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Helpful Guides & Tutorials</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
                Practical Guides for {category.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Step-by-step walk-throughs and format comparisons to help you get the best results.
              </p>
            </div>
            <Link
              to="/guides"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              All Guides <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryGuides.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
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
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {g.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:text-emerald-800">
                  <span>Read Tutorial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contextual Category Cross-Links for Site Hierarchy */}
      <section className="pt-10 border-t border-slate-200">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          Explore Other ToolNest Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {category.id !== 'image' && (
            <Link
              to="/category/image-tools"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm group-hover:text-emerald-700">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>Image Tools</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                Compress, resize, convert, and edit photos directly in your browser.
              </p>
            </Link>
          )}

          {category.id !== 'pdf' && (
            <Link
              to="/category/pdf-tools"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm group-hover:text-emerald-700">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>PDF Tools</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                Merge, split, rotate, convert, and inspect PDF files without uploads.
              </p>
            </Link>
          )}

          {category.id !== 'student' && (
            <Link
              to="/category/student-tools"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm group-hover:text-emerald-700">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Student Tools</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                CGPA, weighted grades, fractions, ratios, and academic study timers.
              </p>
            </Link>
          )}

          {category.id !== 'utility' && (
            <Link
              to="/category/utility-tools"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm group-hover:text-emerald-700">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>Daily Utilities</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                UUIDs, Unix timestamps, JSON formatters, text cleaners, and encoders.
              </p>
            </Link>
          )}

          {category.id !== 'student-utility' && (
            <Link
              to="/category/student-utility"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm group-hover:text-emerald-700">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Student & Utility Hub</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                Unified workspace combining academic solvers and daily productivity tools.
              </p>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
