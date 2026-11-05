import React from 'react';
import {
  Minimize2,
  Scaling,
  FileImage,
  ArrowRightLeft,
  Zap,
  Layers,
  Repeat,
  RefreshCw,
  FileText,
  Crop,
  RotateCw,
  Stamp,
  Share2,
  Percent,
  Calendar,
  GraduationCap,
  Binary,
  Scale,
  Clock,
  QrCode,
  Image as ImageIcon,
  Wrench,
  Sparkles,
  Calculator,
  AlignLeft,
  Hash,
  Key,
  LucideProps,
} from 'lucide-react';

const ICONS_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Minimize2,
  Scaling,
  FileImage,
  ArrowRightLeft,
  Zap,
  Layers,
  Repeat,
  RefreshCw,
  FileText,
  Crop,
  RotateCw,
  Stamp,
  Share2,
  Percent,
  Calendar,
  GraduationCap,
  Binary,
  Scale,
  Clock,
  QrCode,
  ImageIcon,
  GraduationCapIcon: GraduationCap,
  Wrench,
  Sparkles,
  Calculator,
  AlignLeft,
  Hash,
  Key,
};

interface IconRendererProps extends LucideProps {
  name: string;
}

export function IconRenderer({ name, ...props }: IconRendererProps) {
  const Component = ICONS_MAP[name] || Wrench;
  return <Component {...props} />;
}
