import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Paintbrush,
  Shapes,
  Camera,
  Cpu,
  Layers,
  Users,
  ShoppingBag,
  Wrench,
  CalendarDays,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Section = 'gallery' | 'community' | 'profile' | null;

interface SidebarProps {
  section: Section;
}

// ── Gallery sub-navigation ──────────────────────────────────────────────────
// Filter items navigate to /gallery?filter=<value> so the Gallery page
// can read them from URLSearchParams. The page no longer owns the filter pills.
const GALLERY_NAV = [
  { label: 'Showcase', icon: LayoutGrid, filter: null, route: '/gallery' },
  { label: 'Digital Art', icon: Cpu, filter: 'Digital', route: '/gallery?filter=Digital' },
  { label: 'Painting', icon: Paintbrush, filter: 'Painting', route: '/gallery?filter=Painting' },
  { label: 'Sculpting', icon: Shapes, filter: 'Sculpting', route: '/gallery?filter=Sculpting' },
  { label: 'Photography', icon: Camera, filter: 'Photography', route: '/gallery?filter=Photography' },
  { label: 'Other', icon: Layers, filter: 'Other', route: '/gallery?filter=Other' },
];

// ── Community sub-navigation ────────────────────────────────────────────────
const COMMUNITY_NAV = [
  { label: 'Overview', icon: Sparkles, route: '/community' },
  { label: 'Marketplace', icon: ShoppingBag, route: '/community/marketplace' },
  { label: 'Workshops', icon: Wrench, route: '/community/workshops' },
  { label: 'Events', icon: CalendarDays, route: '/community/events' },
];

export function Sidebar({ section }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const activeFilter = params.get('filter');

  // Determine which nav item is active for gallery (matches route + filter param)
  const isGalleryItemActive = (item: (typeof GALLERY_NAV)[number]) => {
    if (!location.pathname.startsWith('/gallery')) return false;
    if (item.filter === null) return !activeFilter; // "Showcase" = no filter
    return activeFilter === item.filter;
  };

  // Determine which nav item is active for community (exact or prefix match)
  const isCommunityItemActive = (item: (typeof COMMUNITY_NAV)[number]) => {
    if (item.route === '/community') return location.pathname === '/community';
    return location.pathname.startsWith(item.route);
  };

  const hasContent = section === 'gallery' || section === 'community';

  return (
    <aside className="w-60 border-r border-border/50 bg-background/50 backdrop-blur-xl hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30">
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">

        <AnimatePresence mode="wait">
          {/* ── GALLERY CONTEXT ─────────────────────────────────────────── */}
          {section === 'gallery' && (
            <motion.div
              key="gallery-nav"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                Gallery
              </p>
              <nav className="space-y-0.5">
                {GALLERY_NAV.map((item) => {
                  const active = isGalleryItemActive(item);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.route)}
                      className={cn(
                        'relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left group',
                        active
                          ? 'text-amber-500'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          'w-4 h-4 z-10 shrink-0 transition-colors',
                          active ? 'text-amber-500' : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                        )}
                      />
                      <span className="z-10">{item.label}</span>
                      {active && (
                        <span className="ml-auto z-10 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}

          {/* ── COMMUNITY CONTEXT ───────────────────────────────────────── */}
          {section === 'community' && (
            <motion.div
              key="community-nav"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                Community
              </p>
              <nav className="space-y-0.5">
                {COMMUNITY_NAV.map((item) => {
                  const active = isCommunityItemActive(item);
                  return (
                    <Link
                      key={item.label}
                      to={item.route}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                        active
                          ? 'text-amber-500'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          'w-4 h-4 z-10 shrink-0 transition-colors',
                          active ? 'text-amber-500' : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                        )}
                      />
                      <span className="z-10">{item.label}</span>
                      {active && (
                        <span className="ml-auto z-10 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}

          {/* ── NO CONTEXT (profile, etc.) ──────────────────────────────── */}
          {!hasContent && (
            <motion.div
              key="empty-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center justify-center h-40 text-center px-4"
            >
              <Zap className="h-6 w-6 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground/50">Select a section from the top nav.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Go Pro Card ──────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border/50">
        <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <h4 className="font-bold text-sm text-amber-500">Go Pro</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Unlock advanced virtual booths and 0% commission fees.
          </p>
          <button
            type="button"
            className="w-full text-xs bg-amber-500 text-black py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
