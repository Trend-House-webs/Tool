import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../../types';

interface FaqAccordionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
}

export function FaqAccordion({
  items,
  title = 'Frequently Asked Questions',
  subtitle = 'Find answers to common questions about using this tool client-side.',
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-600">
            {subtitle}
          </p>
        )}

        <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between text-left gap-4 font-semibold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-3 pr-8 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
