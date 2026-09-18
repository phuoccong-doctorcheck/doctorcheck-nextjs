import React from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Files,
  Stethoscope,
  PackageCheck,
  Building2,
  Image as ImageIcon,
  Sliders,
  Users,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Compass,
} from 'lucide-react';

interface AdminIconProps {
  name: string;
  className?: string;
}

export function AdminIcon({ name, className = 'w-4 h-4' }: AdminIconProps) {
  switch (name) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'FolderTree':
      return <FolderTree className={className} />;
    case 'Files':
      return <Files className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'PackageCheck':
      return <PackageCheck className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}
