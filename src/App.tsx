import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import { AuthProvider } from './AuthContext';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import Community from './pages/Community';
import Events from './pages/Events';
import Marketplace from './pages/Marketplace';
import Workshops from './pages/Workshops';
import ShowcaseCreate from './pages/create/ShowcaseCreate';
import ProductCreate from './pages/create/ProductCreate';
import ArtworkDetail from './pages/ArtworkDetail';
import { useThemeStore } from './store/useThemeStore';
import { Shell } from './components/layout/Shell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Shell showSidebar={false}><Landing /></Shell>} />
            <Route path="/profile/:userId" element={<Shell><Profile /></Shell>} />
            <Route path="/gallery" element={<Shell><Gallery /></Shell>} />
            <Route path="/community" element={<Shell><Community /></Shell>} />
            <Route path="/community/events" element={<Shell><Events /></Shell>} />
            <Route path="/community/marketplace" element={<Shell><Marketplace /></Shell>} />
            <Route path="/community/workshops" element={<Shell><Workshops /></Shell>} />
            
            {/* Create Pillar Routes */}
            <Route path="/create/showcase" element={<Shell><ShowcaseCreate /></Shell>} />
            <Route path="/create/product" element={<Shell><ProductCreate /></Shell>} />
            {/* Fallback for /create if people try it directly */}
            <Route path="/create" element={<Shell><Landing /></Shell>} />

            {/* Artwork Detail */}
            <Route path="/artwork/:artworkId" element={<Shell showSidebar={false}><ArtworkDetail /></Shell>} />
          </Routes>
        </Router>
        {/* Toast notification provider — must be inside AuthProvider but outside Router */}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
