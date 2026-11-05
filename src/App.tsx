import React, { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/common/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { AllToolsPage } from './pages/AllToolsPage';
import { ToolPageWrapper } from './pages/ToolPageWrapper';
import { AboutPage, PrivacyPage, TermsPage, DisclaimerPage, ContactPage } from './pages/StaticPages';
import { GuidesPage } from './pages/GuidesPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { getToolBySlug, getCategoryBySlug, TOOLS } from './data/tools';
import { getGuideBySlug } from './data/guides';
import { Link } from './context/RouterContext';
import { ArrowLeft, Search } from 'lucide-react';
import { SEO } from './components/common/SEO';

function RedirectToHome() {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}

function RedirectToTools({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(`/tools/${slug}`);
  }, [slug, navigate]);

  return null;
}

function AppContent() {
  const { currentPath, navigate } = useRouter();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global hotkey for Search modal (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Route matching logic
  const renderCurrentRoute = () => {
    const path = currentPath.split('?')[0].replace(/\/+$/, '') || '/';

    // Home
    if (path === '/') {
      return <HomePage onOpenSearchModal={() => setSearchModalOpen(true)} />;
    }

    // All tools directory
    if (path === '/tools') {
      return <AllToolsPage />;
    }

    // Static pages
    if (path === '/about') return <AboutPage />;
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/terms') return <TermsPage />;
    if (path === '/disclaimer') return <DisclaimerPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/brand') return <RedirectToHome />;

    // Guides routes: /guides or /guides/:slug
    if (path === '/guides') {
      return <GuidesPage />;
    }
    if (path.startsWith('/guides/')) {
      const slug = path.replace('/guides/', '');
      const guide = getGuideBySlug(slug);
      if (guide) {
        return <GuideDetailPage guide={guide} />;
      }
    }

    // Category routes: /category/:slug
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      const category = getCategoryBySlug(slug);
      if (category) {
        return <CategoryPage categorySlug={slug} />;
      }
    }

    // Tool routes: /tools/:slug or /tool/:slug
    if (path.startsWith('/tools/')) {
      const slug = path.replace('/tools/', '');
      const tool = getToolBySlug(slug);
      if (tool) {
        return <ToolPageWrapper tool={tool} />;
      }
    }
    if (path.startsWith('/tool/')) {
      const slug = path.replace('/tool/', '');
      return <RedirectToTools slug={slug} />;
    }

    // 404 Not Found fallback
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <SEO
          title="Page Not Found — ToolNest"
          description="The tool or page you are looking for doesn't exist on ToolNest."
          canonicalPath="/404"
          noindex={true}
        />
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-2xl mx-auto shadow-2xs">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
          The tool or page you are looking for doesn't exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
          <button
            onClick={() => setSearchModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Search All Tools
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onOpenSearch={() => setSearchModalOpen(true)} />

      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      <Footer />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

export interface AppProps {
  initialPath?: string;
}

export default function App({ initialPath = '/' }: AppProps = {}) {
  return (
    <RouterProvider initialPath={initialPath}>
      <AppContent />
    </RouterProvider>
  );
}
