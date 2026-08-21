import {
  BookOpen,
  Gem,
  Globe,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  HeartPulse,
  Landmark,
  ShoppingBasket,
  Siren,
  Sparkles,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  ShoppingBasket,
  HeartPulse,
  Gem,
  Wheat,
  HandCoins,
  BookOpen,
  HeartHandshake,
  Siren,
  Sparkles,
  Landmark,
  Globe,
};

export function CategoryIcon({
  iconKey,
  className,
  strokeWidth,
}: {
  iconKey: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[iconKey] ?? Sparkles;
  return <Icon aria-hidden className={className} strokeWidth={strokeWidth} />;
}
