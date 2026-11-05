import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ToolItem } from '../../types';
import { Link } from '../../context/RouterContext';
import { IconRenderer } from './IconRenderer';

interface ToolCardProps {
  tool: ToolItem;
  variant?: 'default' | 'compact';
}

export function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  const getCategoryTheme = () => {
    switch (tool.category) {
      case 'image':
        return {
          label: 'Image Tool',
          tagClass: 'text-emerald-700',
          tileClass: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
          hoverBorder: 'hover:border-emerald-400',
        };
      case 'pdf':
        return {
          label: 'PDF Tool',
          tagClass: 'text-rose-700',
          tileClass: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
          hoverBorder: 'hover:border-rose-400',
        };
      case 'student':
        return {
          label: 'Student Tool',
          tagClass: 'text-violet-700',
          tileClass: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
          hoverBorder: 'hover:border-violet-400',
        };
      case 'utility':
        return {
          label: 'Daily Utility',
          tagClass: 'text-amber-700',
          tileClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
          hoverBorder: 'hover:border-amber-400',
        };
      default:
        return {
          label: 'Productivity',
          tagClass: 'text-teal-700',
          tileClass: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
          hoverBorder: 'hover:border-teal-400',
        };
    }
  };

  const theme = getCategoryTheme();

  if (variant === 'compact') {
    return (
      <Link
        to={`/tools/${tool.slug}`}
        aria-label={`Open ${tool.name}`}
        className={`group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 ${theme.hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${theme.tileClass}`}>
          <IconRenderer name={tool.icon} className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {tool.name}
            </h4>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
            {tool.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/tools/${tool.slug}`}
      aria-label={`Open ${tool.name}`}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 ${theme.hoverBorder} hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 shadow-2xs ${theme.tileClass}`}>
            <IconRenderer name={tool.icon} className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className={`font-semibold ${theme.tagClass}`}>{theme.label}</span>
            {tool.badge && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 text-2xs">
                  {tool.badge}
                </span>
              </>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
          {tool.name}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {tool.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
        <span className="inline-flex items-center gap-1.5">
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1.5 transition-transform" />
        </span>
        <span className="text-xs font-normal text-slate-400">In-browser</span>
      </div>
    </Link>
  );
}
