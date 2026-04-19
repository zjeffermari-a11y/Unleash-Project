import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface ShellProps {
  children: ReactNode;
  showSidebar?: boolean;
}

// Derives which top-level section is active from the current URL.
// This is the single source of truth passed down to Sidebar.
function getSection(pathname: string): 'gallery' | 'community' | 'profile' | null {
  if (pathname.startsWith('/gallery') || pathname.startsWith('/create/showcase')) return 'gallery';
  if (pathname.startsWith('/community') || pathname.startsWith('/create/product')) return 'community';
  if (pathname.startsWith('/profile')) return 'profile';
  return null;
}

// Sidebar only makes sense for gallery/community contexts
function hasSidebarContent(section: ReturnType<typeof getSection>): boolean {
  return section === 'gallery' || section === 'community';
}

export function Shell({ children, showSidebar = true }: ShellProps) {
  const location = useLocation();
  const section = getSection(location.pathname);
  const showSidebarPanel = showSidebar && hasSidebarContent(section);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/30 selection:text-foreground">
      <Header activeSection={section} />
      {/* Mobile-only horizontal sub-nav strip (replaces the sidebar on small screens) */}
      {showSidebarPanel && <MobileNav section={section} />}
      <div className="flex-1 flex w-full relative">
        {showSidebarPanel && <Sidebar section={section} />}
        {/* FIX: Removed pt-6 from the main tag below so Hero images sit perfectly flush */}
        <main className="flex-1 flex flex-col pb-20 md:pb-8 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}