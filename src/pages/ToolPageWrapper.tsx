import React, { Suspense } from 'react';
import { ToolItem } from '../types';
import { getToolBySlug, TOOLS } from '../data/tools';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolCard } from '../components/common/ToolCard';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { SEO } from '../components/common/SEO';
import { ShieldCheck, Zap, Lock, CheckCircle2, Lightbulb, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '../context/RouterContext';
import { SITE_URL } from '../config/site';
import { getGuidesForTool } from '../data/guides';

// Tool workspaces imported directly for robust SSR prerendering and immediate browser rendering
import { ImageCompressor } from '../components/tools/image/ImageCompressor';
import { ImageResizer } from '../components/tools/image/ImageResizer';
import { FormatConverter } from '../components/tools/image/FormatConverter';
import { ImageToPdf } from '../components/tools/image/ImageToPdf';
import { CropImage } from '../components/tools/image/CropImage';
import { RotateFlipImage } from '../components/tools/image/RotateFlipImage';
import { WatermarkTool } from '../components/tools/image/WatermarkTool';
import { SocialMediaResizer } from '../components/tools/image/SocialMediaResizer';
import { RotateTool } from '../components/tools/image/RotateTool';
import { FlipTool } from '../components/tools/image/FlipTool';
import { ImageMetadataViewer } from '../components/tools/image/ImageMetadataViewer';
import { PassportPhotoResizer } from '../components/tools/image/PassportPhotoResizer';
import { PhotoSizeReducer } from '../components/tools/image/PhotoSizeReducer';
import { BmpToJpgTool } from '../components/tools/image/BmpToJpgTool';
import { TransparentBgChecker } from '../components/tools/image/TransparentBgChecker';
import { AspectRatioCalc } from '../components/tools/image/AspectRatioCalc';
import { ImageDpiChecker } from '../components/tools/image/ImageDpiChecker';

import { JpgToPdfTool } from '../components/tools/pdf/JpgToPdfTool';
import { PngToPdfTool } from '../components/tools/pdf/PngToPdfTool';
import { PdfMetadataViewer } from '../components/tools/pdf/PdfMetadataViewer';
import { MergePdfTool } from '../components/tools/pdf/MergePdfTool';
import { SplitPdfTool } from '../components/tools/pdf/SplitPdfTool';
import { RotatePdfTool } from '../components/tools/pdf/RotatePdfTool';
import { PdfPageCounter } from '../components/tools/pdf/PdfPageCounter';

import { PercentageCalculator } from '../components/tools/utility/PercentageCalculator';
import { AgeCalculator } from '../components/tools/utility/AgeCalculator';
import { GpaCalculator } from '../components/tools/utility/GpaCalculator';
import { WordCounter } from '../components/tools/utility/WordCounter';
import { CharacterCounter } from '../components/tools/utility/CharacterCounter';
import { UnitConverter } from '../components/tools/utility/UnitConverter';
import { StudyTimer } from '../components/tools/utility/StudyTimer';
import { QrCodeGenerator } from '../components/tools/utility/QrCodeGenerator';
import { PasswordGen } from '../components/tools/utility/PasswordGen';
import { Base64Tool } from '../components/tools/utility/Base64Tool';
import { UrlEncodeTool } from '../components/tools/utility/UrlEncodeTool';
import { JsonFormatter } from '../components/tools/utility/JsonFormatter';
import { ColorConverterTool } from '../components/tools/utility/ColorConverterTool';
import { TextCaseConverter } from '../components/tools/utility/TextCaseConverter';
import { RemoveDuplicateLines } from '../components/tools/utility/RemoveDuplicateLines';
import { UuidGenerator } from '../components/tools/utility/UuidGenerator';
import { TimestampConverter } from '../components/tools/utility/TimestampConverter';
import { TextCleaner } from '../components/tools/utility/TextCleaner';
import { RandomStringGenerator } from '../components/tools/utility/RandomStringGenerator';

import { PercentageIncreaseCalc } from '../components/tools/student/PercentageIncreaseCalc';
import { PercentageDecreaseCalc } from '../components/tools/student/PercentageDecreaseCalc';
import { MarksPercentageCalc } from '../components/tools/student/MarksPercentageCalc';
import { DateDifferenceCalc } from '../components/tools/student/DateDifferenceCalc';
import { ReadingTimeCalc } from '../components/tools/student/ReadingTimeCalc';
import { AverageCalc } from '../components/tools/student/AverageCalc';
import { RandomNumberGen } from '../components/tools/student/RandomNumberGen';
import { PomodoroTimerTool } from '../components/tools/student/PomodoroTimerTool';
import { CgpaCalculator } from '../components/tools/student/CgpaCalculator';
import { GradeCalculator } from '../components/tools/student/GradeCalculator';
import { FractionCalculator } from '../components/tools/student/FractionCalculator';
import { RatioCalculator } from '../components/tools/student/RatioCalculator';
import { ScientificCalculator } from '../components/tools/student/ScientificCalculator';
import { SentenceCounter } from '../components/tools/student/SentenceCounter';
import { NumberToWords } from '../components/tools/student/NumberToWords';

function WorkspaceSkeleton({ toolName }: { toolName: string }) {
  return (
    <div
      role="status"
      aria-label={`Loading ${toolName} workspace`}
      className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs"
    >
      <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-semibold text-slate-800">Loading {toolName}...</span>
      <span className="text-xs text-slate-400 mt-1">Initializing client-side workspace in your browser</span>
    </div>
  );
}

function renderFormattedText(text: string) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkText = match[1];
    const linkHref = match[2];
    parts.push(
      <Link
        key={`${linkHref}-${match.index}`}
        to={linkHref}
        className="font-semibold text-emerald-700 hover:text-emerald-900 underline decoration-emerald-300 underline-offset-2 transition-colors"
      >
        {linkText}
      </Link>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

interface ToolPageWrapperProps {
  tool: ToolItem;
}

export function ToolPageWrapper({ tool }: ToolPageWrapperProps) {
  const getCategoryDetails = () => {
    switch (tool.category) {
      case 'image':
        return { name: 'Image Tools', href: '/category/image-tools' };
      case 'pdf':
        return { name: 'PDF Tools', href: '/category/pdf-tools' };
      case 'student':
        return { name: 'Student & Academic Tools', href: '/category/student-tools' };
      case 'utility':
        return { name: 'Daily & Text Utilities', href: '/category/utility-tools' };
      default:
        return { name: 'Student & Utility Tools', href: '/category/student-utility' };
    }
  };

  const { name: categoryName, href: categoryHref } = getCategoryDetails();

  // Render proper tool workspace content
  const renderWorkspaceContent = () => {
    switch (tool.slug) {
      case 'image-compressor':
        return <ImageCompressor />;
      case 'image-resizer':
        return <ImageResizer />;
      case 'jpg-to-png':
        return (
          <FormatConverter
            sourceFormatName="JPG"
            targetFormatName="PNG"
            targetMime="image/png"
            targetExtension="png"
            accept="image/jpeg"
          />
        );
      case 'png-to-jpg':
        return (
          <FormatConverter
            sourceFormatName="PNG"
            targetFormatName="JPG"
            targetMime="image/jpeg"
            targetExtension="jpg"
            accept="image/png"
          />
        );
      case 'jpg-to-webp':
        return (
          <FormatConverter
            sourceFormatName="JPG"
            targetFormatName="WebP"
            targetMime="image/webp"
            targetExtension="webp"
            accept="image/jpeg"
          />
        );
      case 'png-to-webp':
        return (
          <FormatConverter
            sourceFormatName="PNG"
            targetFormatName="WebP"
            targetMime="image/webp"
            targetExtension="webp"
            accept="image/png"
          />
        );
      case 'webp-to-jpg':
        return (
          <FormatConverter
            sourceFormatName="WebP"
            targetFormatName="JPG"
            targetMime="image/jpeg"
            targetExtension="jpg"
            accept="image/webp"
          />
        );
      case 'webp-to-png':
        return (
          <FormatConverter
            sourceFormatName="WebP"
            targetFormatName="PNG"
            targetMime="image/png"
            targetExtension="png"
            accept="image/webp"
          />
        );
      case 'image-to-pdf':
        return <ImageToPdf />;
      case 'crop-image':
        return <CropImage />;
      case 'rotate-flip-image':
        return <RotateFlipImage />;
      case 'rotate-image':
        return <RotateTool />;
      case 'flip-image':
        return <FlipTool />;
      case 'image-metadata-viewer':
      case 'image-dimension-checker':
        return <ImageMetadataViewer />;
      case 'passport-photo-resizer':
        return <PassportPhotoResizer />;
      case 'photo-size-reducer':
        return <PhotoSizeReducer />;
      case 'bmp-to-jpg':
        return <BmpToJpgTool />;
      case 'transparent-background-checker':
        return <TransparentBgChecker />;
      case 'aspect-ratio-calculator':
        return <AspectRatioCalc />;
      case 'add-watermark':
        return <WatermarkTool />;
      case 'social-media-resizer':
        return <SocialMediaResizer />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'png-to-pdf':
        return <PngToPdfTool />;
      case 'pdf-metadata-viewer':
        return <PdfMetadataViewer />;
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'percentage-increase-calculator':
        return <PercentageIncreaseCalc />;
      case 'percentage-decrease-calculator':
        return <PercentageDecreaseCalc />;
      case 'marks-percentage-calculator':
        return <MarksPercentageCalc />;
      case 'date-difference-calculator':
        return <DateDifferenceCalc />;
      case 'reading-time-calculator':
        return <ReadingTimeCalc />;
      case 'average-calculator':
        return <AverageCalc />;
      case 'random-number-generator':
        return <RandomNumberGen />;
      case 'pomodoro-timer':
        return <PomodoroTimerTool />;
      case 'password-generator':
        return <PasswordGen />;
      case 'base64-encoder-decoder':
        return <Base64Tool />;
      case 'url-encoder-decoder':
        return <UrlEncodeTool />;
      case 'json-formatter':
        return <JsonFormatter />;
      case 'color-converter':
        return <ColorConverterTool />;
      case 'text-case-converter':
        return <TextCaseConverter />;
      case 'remove-duplicate-lines':
        return <RemoveDuplicateLines />;
      case 'age-calculator':
        return <AgeCalculator />;
      case 'gpa-calculator':
        return <GpaCalculator />;
      case 'word-counter':
        return <WordCounter />;
      case 'character-counter':
        return <CharacterCounter />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'study-timer':
        return <StudyTimer />;
      case 'qr-code-generator':
        return <QrCodeGenerator />;
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
      case 'rotate-pdf':
        return <RotatePdfTool />;
      case 'pdf-page-counter':
        return <PdfPageCounter />;
      case 'cgpa-calculator':
        return <CgpaCalculator />;
      case 'grade-calculator':
        return <GradeCalculator />;
      case 'fraction-calculator':
        return <FractionCalculator />;
      case 'ratio-calculator':
        return <RatioCalculator />;
      case 'scientific-calculator':
        return <ScientificCalculator />;
      case 'sentence-counter':
        return <SentenceCounter />;
      case 'number-to-words':
        return <NumberToWords />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'timestamp-converter':
        return <TimestampConverter />;
      case 'text-cleaner':
        return <TextCleaner />;
      case 'random-string-generator':
        return <RandomStringGenerator />;
      case 'image-dpi-checker':
        return <ImageDpiChecker />;
      default:
        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <h3 className="text-base font-semibold text-slate-800">Workspace</h3>
            <p className="text-sm text-slate-500 mt-2">Loading tool components...</p>
          </div>
        );
    }
  };

  const renderWorkspace = () => (
    <Suspense fallback={<WorkspaceSkeleton toolName={tool.name} />}>
      {renderWorkspaceContent()}
    </Suspense>
  );

  const explicitRelated = (tool.relatedSlugs || [])
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolItem => Boolean(t));

  // Guarantee 4 sibling tools by filling with other tools from the same category
  const fallbackRelated = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug && !explicitRelated.some((er) => er.slug === t.slug)
  );

  const relatedTools = [...explicitRelated, ...fallbackRelated].slice(0, 4);

  const relevantGuides = getGuidesForTool(tool.slug);

  // Schema.org WebApplication specification
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.detailedDescription || tool.description,
    applicationCategory: tool.category === 'image' ? 'MultimediaApplication' : 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
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
        name: 'All Tools Directory',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}${categoryHref}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.name,
        item: `${SITE_URL}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dynamic SEO Tags & Structured Data */}
      <SEO
        title={tool.metaTitle || `${tool.name} — ToolNest`}
        description={tool.metaDescription || tool.description}
        canonicalPath={`/tools/${tool.slug}`}
        schema={[webAppSchema, breadcrumbSchema]}
        faqItems={tool.faq}
      />

      {/* Breadcrumb Navigation: Home -> All Tools -> Category -> Tool */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'All Tools', href: '/tools' },
            { label: categoryName, href: categoryHref },
            { label: tool.name },
          ]}
        />
      </div>

      {/* Header section with Single H1 */}
      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
          <span>{categoryName.toUpperCase()}</span>
          {tool.badge && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">{tool.badge}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tool.name}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          {renderFormattedText(tool.detailedDescription || tool.description)}
        </p>

        {/* Real browser trust markers */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Client-Side Processing
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            No Server File Uploads
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            Free & Unlimited
          </span>
        </div>

        {/* Direct Answer / Core Purpose Callout */}
        {tool.directAnswer && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start gap-3">
            <div className="font-bold text-emerald-800 shrink-0">Purpose:</div>
            <div>{renderFormattedText(tool.directAnswer)}</div>
          </div>
        )}
      </div>

      {/* Primary Tool Workspace */}
      <section aria-label={`${tool.name} Workspace`} className="mb-14">
        {renderWorkspace()}
      </section>

      {/* How to Use Step-by-Step Guide */}
      {tool.howToUse && tool.howToUse.length > 0 && (
        <section className="mb-14 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>How to Use {tool.name}</span>
          </h2>
          <div className={`grid grid-cols-1 ${tool.howToUse.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
            {tool.howToUse.map((step) => (
              <div key={step.step} className="relative flex flex-col space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {renderFormattedText(step.description)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Supported Formats & Technical Limitations */}
      {tool.technicalDetails && (
        <section className="mb-14 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Supported Formats & Technical Limitations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Verified browser specifications, format handling, and processing boundaries for {tool.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                Accepted Inputs
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {tool.technicalDetails.supportedInputs.map((input, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{renderFormattedText(input)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                Output Handling
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {renderFormattedText(tool.technicalDetails.outputFormat)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                Processing Limitations
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {tool.technicalDetails.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{renderFormattedText(lim)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Practical Example */}
      {tool.practicalExample && (
        <section className="mb-14 p-6 sm:p-7 rounded-2xl bg-slate-900 text-white shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <span>Practical Example: {tool.practicalExample.title}</span>
          </div>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Scenario: </strong>
              {renderFormattedText(tool.practicalExample.scenario)}
            </p>
            <p>
              <strong className="text-white">Action: </strong>
              {renderFormattedText(tool.practicalExample.action)}
            </p>
            <p className="p-3 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700/80">
              <strong className="text-emerald-200">Outcome: </strong>
              {renderFormattedText(tool.practicalExample.result)}
            </p>
          </div>
        </section>
      )}

      {/* Why Choose ToolNest / Use Cases */}
      {tool.whyUse && tool.whyUse.length > 0 && (
        <section className="mb-14 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">
            Why Use ToolNest for {tool.name}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.whyUse.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {renderFormattedText(reason)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pro Tips for Best Results */}
      {tool.tips && tool.tips.length > 0 && (
        <section className="mb-14 bg-amber-50/50 rounded-2xl border border-amber-200/70 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-amber-950">
              Tips for Best Results
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            {tool.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{renderFormattedText(tip)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Features */}
      {tool.features && tool.features.length > 0 && (
        <section className="mb-14 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
            Key Features of {tool.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tool.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section with Accordion */}
      {tool.faq && tool.faq.length > 0 && (
        <section className="mb-14" aria-label="Frequently Asked Questions">
          <FaqAccordion
            items={tool.faq}
            title={`Frequently Asked Questions about ${tool.name}`}
          />
        </section>
      )}

      {/* Relevant Step-by-Step Guides & Tutorials */}
      {relevantGuides.length > 0 && (
        <section className="mb-14 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Helpful Guide & Tutorial</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Recommended Reading for This Workflow
              </h2>
            </div>
            <Link
              to="/guides"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              All Guides <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/guides/${guide.slug}`}
                className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-2xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-emerald-700">{guide.categoryName}</span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:text-emerald-800">
                  <span>Read Tutorial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools (Internal Linking) */}
      {relatedTools.length > 0 && (
        <section className="mt-14 pt-10 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
                Related Free Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Explore more client-side utilities that pair well with {tool.name}.
              </p>
            </div>
            <Link
              to={categoryHref}
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              All {categoryName} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.id} tool={relTool} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
