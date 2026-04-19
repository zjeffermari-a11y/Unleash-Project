import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Paintbrush,
  Shapes,
  Camera,
  Cpu,
  Layers,
  ShoppingBag,
  Wrench,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Section = 'gallery' | 'community' | 'profile' | null;

interface MobileNavProps {
  section: Section;
}

const GALLERY_NAV = [
  { label: 'Showcase', icon: LayoutGrid, filter: null, route: '/gallery' },
  { label: 'Digital Art', icon: Cpu, filter: 'Digital', route: '/gallery?filter=Digital' },
  { label: 'Painting', icon: Paintbrush, filter: 'Painting', route: '/gallery?filter=Painting' },
  { label: 'Sculpting', icon: Shapes, filter: 'Sculpting', route: '/gallery?filter=Sculpting' },
  { label: 'Photography', icon: Camera, filter: 'Photography', route: '/gallery?filter=Photography' },
  { label: 'Other', icon: Layers, filter: 'Other', route: '/gallery?filter=Other' },
];

const COMMUNITY_NAV = [
  { label: 'Overview', icon: Sparkles, route: '/community' },
  { label: 'Marketplace', icon: ShoppingBag, route: '/community/marketplace' },
  { label: 'Workshops', icon: Wrench, route: '/community/workshops' },
  { label: 'Events', icon: CalendarDays, route: '/community/events' },
];

export function MobileNav({ section }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const activeFilter = params.get('filter');

  if (section !== 'gallery' && section !== 'community') return null;

  const navItems = section === 'gallery' ? GALLERY_NAV : COMMUNITY_NAV;

  const isActive = (item: (typeof GALLERY_NAV)[number] | (typeof COMMUNITY_NAV)[number]) => {
    if (section === 'gallery') {
      const gItem = item as (typeof GALLERY_NAV)[number];
      if (!location.pathname.startsWith('/gallery')) return false;
      return gItem.filter === null ? !activeFilter : activeFilter === gItem.filter;
    }
    // community
    const cItem = item as (typeof COMMUNITY_NAV)[number];
    if (cItem.route === '/community') return location.pathname === '/community';
    return location.pathname.startsWith(cItem.route);
  };

  return (
    // Visible only on mobile (hidden on md+), sits sticky just below the header
    <nav className="md:hidden sticky top-16 z-30 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.route)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 border',
                active
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                  : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-amber-500' : 'text-muted-foreground')} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
