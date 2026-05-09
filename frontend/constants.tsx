import { Hash, Heart, Navigation, ShoppingBag, Star, Zap } from 'lucide-react';
import type React from 'react';
import type { ActiveTab } from './frontendTypes';

export const NAV_TABS: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
  { id: 'horoscope', label: 'Өдрийн зурхай', icon: <Star size={16} /> },
  { id: 'chart', label: 'Профайл', icon: <Navigation size={16} /> },
  { id: 'numerology', label: 'Тоон зурхай', icon: <Hash size={16} /> },
  { id: 'compatibility', label: 'Тохироо', icon: <Heart size={16} /> },
  { id: 'tarot', label: 'Тарот', icon: <Zap size={16} /> },
  { id: 'shop', label: 'Дэлгүүр', icon: <ShoppingBag size={16} /> },
];

export const SERVICE_LINKS = [
  { name: 'Өдрийн зурхай', id: 'horoscope' },
  { name: 'Профайл', id: 'chart' },
  { name: 'Тохироо', id: 'compatibility' },
  { name: 'Тарот', id: 'tarot' },
];

export const WORLD_LINKS = [
  { name: 'Одон орон', id: 'astro' },
  { name: 'Философи', id: 'phi' },
  { name: 'Тусламж', id: 'help' },
  { name: 'Хууль эрх зүй', id: 'legal' },
];
