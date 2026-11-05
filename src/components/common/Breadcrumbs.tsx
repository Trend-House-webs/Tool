import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from '../../context/RouterContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium">
      <Link to="/" className="flex items-center gap-1 hover:text-emerald-700 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-emerald-700 transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
