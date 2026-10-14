import {
  AppWindow,
  Cpu,
  FolderOpen,
  Mail,
  Printer,
  Shield,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  networking: Wifi,
  network: Wifi,
  hardware: Cpu,
  software: AppWindow,
  security: Shield,
  printing: Printer,
  email: Mail,
}

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? FolderOpen
}
