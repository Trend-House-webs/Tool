export type ToolCategory = 'image' | 'pdf' | 'student' | 'utility' | 'student-utility';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface PracticalExample {
  title: string;
  scenario: string;
  action: string;
  result: string;
}

export interface TechnicalDetails {
  supportedInputs: string[];
  outputFormat: string;
  limitations: string[];
}

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  detailedDescription: string;
  icon: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  badge?: string;
  directAnswer?: string;
  features?: string[];
  howToUse?: HowToStep[];
  whyUse?: string[];
  tips?: string[];
  technicalDetails?: TechnicalDetails;
  practicalExample?: PracticalExample;
  metaTitle?: string;
  metaDescription?: string;
  faq: FAQItem[];
  relatedSlugs: string[];
}

export interface CategoryToolType {
  title: string;
  description: string;
  whenToChoose: string;
  toolSlugs: string[];
}

export interface CategoryInfo {
  id: ToolCategory;
  slug: string;
  title: string;
  description: string;
  icon: string;
  count: number;
  metaTitle?: string;
  metaDescription?: string;
  introParagraph?: string;
  highlights?: string[];
  toolTypes?: CategoryToolType[];
}
