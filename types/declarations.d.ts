declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Briefcase: LucideIcon;
  export const Compass: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Code2: LucideIcon;
  export const Trophy: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Building2: LucideIcon;
  export const Building: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const User: LucideIcon;
  export const LogOut: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Plus: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Layers: LucideIcon;
  export const MapPin: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Clock: LucideIcon;
  export const Share2: LucideIcon;
  export const Calendar: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Heart: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Github: LucideIcon;
  export const Twitter: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Inbox: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Mail: LucideIcon;
  export const Lock: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Play: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Flame: LucideIcon;
  export const Award: LucideIcon;
  export const Medal: LucideIcon;
  export const FileText: LucideIcon;
  export const Clock3: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const Download: LucideIcon;
  export const Globe: LucideIcon;
  export const Printer: LucideIcon;

  // Catch-all for any other icon
  const icon: LucideIcon;
  export default icon;
}
