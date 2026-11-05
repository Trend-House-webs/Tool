import React from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Info,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GuideItem, GUIDES } from '../data/guides';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SEO } from '../components/common/SEO';
import { SITE_URL } from '../config/site';
import { Link } from '../context/RouterContext';

function renderFormattedText(text: string) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    if (url.startsWith('/')) {
      parts.push(
        <Link
          key={`${match.index}-${url}`}
          to={url}
          className="text-emerald-700 hover:text-emerald-800 underline font-semibold decoration-emerald-300 hover:decoration-emerald-600 transition-colors"
        >
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={`${match.index}-${url}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:text-emerald-800 underline font-semibold decoration-emerald-300 hover:decoration-emerald-600 transition-colors"
        >
          {label}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface GuideDetailPageProps {
  guide: GuideItem;
}

export function GuideDetailPage({ guide }: GuideDetailPageProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    url: `${SITE_URL}/guides/${guide.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guides/${guide.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolNest',
      url: `${SITE_URL}/`,
    },
  };

  // Breadcrumb structured data
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
        name: 'Guides',
        item: `${SITE_URL}/guides`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: `${SITE_URL}/guides/${guide.slug}`,
      },
    ],
  };

  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dynamic SEO Tags & Truthful Schema */}
      <SEO
        title={guide.metaTitle}
        description={guide.metaDescription}
        canonicalPath={`/guides/${guide.slug}`}
        ogType="article"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Visible Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: guide.title },
          ]}
        />
      </div>

      {/* Article Header */}
      <header className="mb-10 pb-8 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs">
          <Link
            to={guide.categoryPath}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span>{guide.categoryName}</span>
          </Link>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {guide.readTime}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Client-Side & Free
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {guide.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          {guide.summary}
        </p>

        {/* Featured Tools Callout Box (Linked Near the Beginning) */}
        {guide.featuredTools && guide.featuredTools.length > 0 ? (
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-indigo-50/50 to-slate-50 border border-emerald-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Client-Side Tools</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  Tools Used in This Tutorial
                </div>
              </div>
              <span className="text-2xs font-medium text-slate-500">
                Client-Side In-Browser Execution · No Server File Uploads
              </span>
            </div>

            <div className={`grid grid-cols-1 ${guide.featuredTools.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              {guide.featuredTools.map((tool) => (
                <div
                  key={tool.slug}
                  className="p-3.5 bg-white rounded-xl border border-emerald-100/80 shadow-2xs flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {tool.name}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {tool.context}
                    </p>
                  </div>
                  <Link
                    to={tool.path}
                    className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    <span>{tool.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-indigo-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Free Tool
              </div>
              <div className="text-base font-bold text-slate-900">
                {guide.primaryTool.name}
              </div>
              <p className="text-xs text-slate-600">
                Run this tool directly in your browser with zero server uploads and no account required.
              </p>
            </div>
            <Link
              to={guide.primaryTool.path}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              {guide.primaryTool.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {/* Guide Content Sections */}
      <article className="space-y-12">
        {guide.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 tracking-tight">
              {section.heading}
            </h2>

            {/* Paragraphs */}
            <div className="space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {section.paragraphs.map((para, pIdx) => (
                <p key={pIdx}>{renderFormattedText(para)}</p>
              ))}
            </div>

            {/* Key Bullet Points */}
            {section.keyPoints && section.keyPoints.length > 0 && (
              <ul className="mt-4 space-y-2.5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                {section.keyPoints.map((pt, ptIdx) => (
                  <li key={ptIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{renderFormattedText(pt)}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Callout Notice */}
            {section.callout && (
              <div
                className={`mt-5 p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                  section.callout.type === 'tip'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                {section.callout.type === 'tip' ? (
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">{section.callout.title}</div>
                  <div className="leading-relaxed">{renderFormattedText(section.callout.message)}</div>
                </div>
              </div>
            )}

            {/* Numbered Step-by-Step Cards */}
            {section.steps && section.steps.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.steps.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      {step.step}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {renderFormattedText(step.description)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Practical Scenario Box */}
            {section.practicalScenario && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-white shadow-xs space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  Practical Example: {section.practicalScenario.title}
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Scenario: </strong>
                    {section.practicalScenario.scenario}
                  </p>
                  <p>
                    <strong className="text-white">Solution: </strong>
                    {renderFormattedText(section.practicalScenario.solution)}
                  </p>
                  <p className="p-3 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700/80">
                    <strong className="text-emerald-200">Outcome: </strong>
                    {section.practicalScenario.result}
                  </p>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Key Takeaways Card */}
        <section className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs">
          <h2 className="text-lg sm:text-xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Key Takeaways
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
            {guide.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related Tools Internal Linking Cluster */}
        <section className="pt-8 border-t border-slate-200">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Related Tools to Explore
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Complementary client-side utilities that connect directly with this workflow:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {guide.relatedTools.map((relTool) => (
              <Link
                key={relTool.slug}
                to={relTool.path}
                className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {relTool.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {relTool.context}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Category Connection Banner */}
        <section className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Browse More in {guide.categoryName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore the entire collection of browser-based utilities with zero file uploads.
            </p>
          </div>
          <Link
            to={guide.categoryPath}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <span>View All {guide.categoryName}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </section>

        {/* Other Guides Discovery */}
        {otherGuides.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                More Practical Guides
              </h2>
              <Link
                to="/guides"
                className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                All Guides →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {otherGuides.map((og) => (
                <Link
                  key={og.slug}
                  to={`/guides/${og.slug}`}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-700">
                      {og.categoryName}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                      {og.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-2xs text-slate-500 mt-3">
                    <Clock className="w-3 h-3" />
                    <span>{og.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer Return Link */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Guides Directory
        </Link>
        <Link
          to="/"
          className="hover:text-slate-800 transition-colors"
        >
          ToolNest Homepage
        </Link>
      </div>
    </div>
  );
}
