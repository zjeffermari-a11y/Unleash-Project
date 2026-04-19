import { Link, useNavigate } from 'react-router-dom';
import unleashLogo from '@/src/unleash-logo.svg';
import { useAuth } from '@/src/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { Compass, LogOut, Package, ChevronDown, Menu, MessageSquareText } from 'lucide-react';
import * as React from 'react';
import { GlobalSearch } from '../GlobalSearch';
import { CreateHubModal } from '../action-center/CreateHubModal';
import { CartSheet } from '../action-center/CartSheet';
import { NotificationsPopover } from '../action-center/NotificationsPopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useChats } from '@/src/hooks/useChats';

type Section = 'gallery' | 'community' | 'profile' | null;

interface HeaderProps {
  activeSection: Section;
}

// Top-level sections — the section switcher. Sub-navigation lives in the Sidebar.
const SECTIONS = [
  { label: 'Gallery', value: 'gallery' as Section, route: '/gallery' },
  { label: 'Community', value: 'community' as Section, route: '/community' },
];

export function Header({ activeSection }: HeaderProps) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* ── LEFT: Mobile Menu + Logo + Section Switcher ── */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Mobile Hamburger Menu (Hidden on Desktop) */}
          <div className="md:hidden flex items-center">
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger className="p-2 rounded-lg hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Menu className="h-5 w-5 text-foreground" />
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={12} className="w-48 p-2 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col gap-1">
                  {SECTIONS.map((section) => {
                    const isActive = activeSection === section.value;
                    return (
                      <Link
                        key={section.value}
                        to={section.route}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-background text-foreground shadow-sm border border-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        )}
                      >
                        {section.label}
                      </Link>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src={unleashLogo} alt="Unleash Logo" className="h-10 w-auto group-hover:opacity-80 transition-opacity" />
            <span className="font-display font-bold text-xl tracking-tight hidden sm:inline-block">
              Unleash<span className="text-amber-500">.</span>
            </span>
          </Link>

          {/* Desktop Section switcher (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-accent/40 border border-border p-1 rounded-xl">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.value;
              return (
                <Link
                  key={section.value}
                  to={section.route}
                  className={cn(
                    'relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── CENTER: Global Search ── */}
        <div className="flex-1 max-w-md px-4 hidden md:flex justify-center">
          <GlobalSearch />
        </div>

        {/* ── RIGHT: Action Center + Auth ── */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              <CreateHubModal />
              <CartSheet />
              <InboxButton />
              <NotificationsPopover />
              <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            </>
          )}

          <ThemeToggle />

          {user ? (
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger className="flex items-center h-9 rounded-full pl-2 pr-3 border border-border/50 bg-background/50 hover:bg-accent/50 gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                  alt={user.displayName || 'Avatar'}
                  className="h-6 w-6 rounded-full bg-muted shrink-0"
                />
                <span className="text-xs font-semibold truncate max-w-[80px] hidden sm:block">
                  {user.displayName?.split(' ')[0]}
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform hidden sm:block', profileOpen ? 'rotate-180' : '')} />
              </PopoverTrigger>

              <PopoverContent align="end" side="bottom" sideOffset={8} className="w-60 p-0 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Identity */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                    alt={user.displayName || 'Avatar'}
                    className="h-10 w-10 rounded-full bg-muted shrink-0 border-2 border-amber-500/30"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate(`/profile/${user.uid}`); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors text-left"
                  >
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} alt="" className="h-4 w-4 rounded-full opacity-60" />
                    Profile Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate('/community/marketplace'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors text-left"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Seller Dashboard
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              onClick={login}
              size="sm"
              className="font-semibold px-6 bg-amber-500 hover:bg-amber-600 text-black ml-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              Sign In
            </Button>
          )}
        </div>

      </div>
    </header>
  );
}

// ── Inbox / Messages icon with unread badge ────────────────────────────────
function InboxButton() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats } = useChats();

  const totalUnread = chats.reduce((sum, c) => {
    return sum + (c.unreadCount?.[user?.uid || ''] || 0);
  }, 0);

  return (
    <button
      onClick={() => navigate('/messages')}
      className="relative p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Client Portal"
    >
      <MessageSquareText className="h-5 w-5" />
      {totalUnread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-lg">
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      )}
    </button>
  );
}