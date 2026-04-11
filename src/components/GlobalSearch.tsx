import * as React from 'react';
import { Search, Image, ShoppingBag, LayoutGrid, Users, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalSearch, type SearchResult } from '../hooks/useGlobalSearch';


// ─── Static page shortcuts (always visible when search is empty) ───────────────

interface PageShortcut {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

const PAGE_SHORTCUTS: PageShortcut[] = [
  { id: 'p1', title: 'Discover Gallery', description: 'Browse all artwork', route: '/gallery', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'p2', title: 'Community Hub', description: 'WIP threads, events, workshops', route: '/community', icon: <Users className="h-4 w-4" /> },
  { id: 'p3', title: 'Marketplace', description: 'Buy & sell digital assets', route: '/community/marketplace', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'p4', title: 'Workshops', description: 'Live & recorded sessions', route: '/community/workshops', icon: <BookOpen className="h-4 w-4" /> },
];

// ─── Icon resolver ─────────────────────────────────────────────────────────────

function ResultIcon({ category }: { category: SearchResult['category'] }) {
  if (category === 'Artwork') return <Image className="h-4 w-4 text-blue-400 shrink-0" />;
  if (category === 'Marketplace') return <ShoppingBag className="h-4 w-4 text-green-400 shrink-0" />;
  return <Search className="h-4 w-4 text-muted-foreground shrink-0" />;
}

// ─── Skeleton rows shown during Firestore fetch ───────────────────────────────

function SearchSkeletons() {
  return (
    <div className="px-3 py-2 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-3 w-2/3 rounded" />
            <Skeleton className="h-2.5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();

  // Live Firestore search — debounced at 500ms inside the hook
  const { results, isLoading, hasQuery } = useGlobalSearch(query);

  // Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = React.useCallback(
    (route: string) => {
      setOpen(false);
      setQuery('');
      navigate(route);
    },
    [navigate]
  );

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setQuery('');
  };

  // Group live results by category
  const artworkResults = results.filter((r) => r.category === 'Artwork');
  const marketResults = results.filter((r) => r.category === 'Marketplace');

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-9 inline-flex items-center justify-start gap-2 rounded-full bg-background/50 border border-border text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80 px-3 hover:bg-accent/50 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex truncate">Search artists, products, tags...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/*
       * Composition: Dialog > DialogContent > Command > CommandInput + CommandList
       * This ensures cmdk's CommandInput gets the required Command context.
       */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogContent
          showCloseButton={false}
          className="top-[20%] translate-y-0 sm:max-w-2xl p-0 overflow-hidden bg-popover border-border shadow-2xl rounded-2xl"
        >
          <Command shouldFilter={false} className="rounded-2xl">
            {/* Search input with live loading indicator */}
            <div className="flex items-center border-b border-border px-3">
              <CommandInput
                placeholder="Search artwork, products, artists..."
                value={query}
                onValueChange={setQuery}
                className="flex-1"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0 ml-2" />
              )}
            </div>

            <CommandList className="max-h-[420px]">
              {/* ── Loading skeleton ──────────────────────────────────────── */}
              {isLoading && <SearchSkeletons />}

              {/* ── Empty state (only after debounce completes) ───────────── */}
              {!isLoading && hasQuery && results.length === 0 && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Search className="h-10 w-10 text-muted-foreground/30" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        No results for{' '}
                        <span className="font-semibold text-foreground">"{query}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Try a different title, artist name, or category.
                      </p>
                    </div>
                  </div>
                </CommandEmpty>
              )}

              {/* ── Live Firestore results ────────────────────────────────── */}
              {!isLoading && hasQuery && results.length > 0 && (
                <>
                  {artworkResults.length > 0 && (
                    <CommandGroup heading="Artworks">
                      {artworkResults.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.meta}`}
                          onSelect={() => handleSelect(item.route)}
                          className="flex items-center gap-3 py-2.5 cursor-pointer"
                        >
                          <ResultIcon category={item.category} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{item.meta}</span>
                          </div>
                          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 hidden sm:block shrink-0">
                            Gallery
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {artworkResults.length > 0 && marketResults.length > 0 && <CommandSeparator />}

                  {marketResults.length > 0 && (
                    <CommandGroup heading="Marketplace">
                      {marketResults.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.meta}`}
                          onSelect={() => handleSelect(item.route)}
                          className="flex items-center gap-3 py-2.5 cursor-pointer"
                        >
                          <ResultIcon category={item.category} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{item.meta}</span>
                          </div>
                          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 hidden sm:block shrink-0">
                            Shop
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}

              {/* ── Static page shortcuts (shown when search is empty) ────── */}
              {!hasQuery && (
                <CommandGroup heading="Quick Navigation">
                  {PAGE_SHORTCUTS.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={page.title}
                      onSelect={() => handleSelect(page.route)}
                      className="flex items-center gap-3 py-2.5 cursor-pointer"
                    >
                      <span className="shrink-0 text-muted-foreground">{page.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{page.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{page.description}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
