import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Loader2, Heart } from 'lucide-react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useLike } from '../hooks/useLike';

export default function Gallery() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Filter driven by sidebar via URL — no local filter state needed
  const categoryFilter = searchParams.get('filter') || 'All';
  const initialSearch = location.state?.search || '';

  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [visibleCount, setVisibleCount] = useState(12);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const artworksRef = collection(db, 'artworks');
      const q = query(artworksRef, where('privacy', '==', 'public'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedArtworks = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setArtworks(fetchedArtworks);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [categoryFilter, searchQuery]);

  const filteredArtworks = artworks.filter(art => {
    const matchesCategory = categoryFilter === 'All' || art.category === categoryFilter;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleArtworks = filteredArtworks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArtworks.length;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastArtworkElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleCount(prev => prev + 12);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen font-sans">

      <main className="pb-24">
        {/* Hero Section — gradient uses semantic bg-background so it adapts to light/dark */}
        <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden mb-16">
          <img
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"
            alt="Gallery Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          {/* Semantic gradient — adapts automatically to light/dark mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />

          <div className="relative z-10 container mx-auto px-6 text-center mt-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-foreground drop-shadow-2xl">
                GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">GALLERY</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                Explore the finest works from our community of over 1,000,000 artists worldwide. Discover inspiration in every pixel and brushstroke.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Search bar — filter pills moved to Sidebar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {categoryFilter !== 'All' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtering:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
                  {categoryFilter}
                </span>
              </div>
            )}
            <div className="relative w-full max-w-md ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-full pl-11 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl">
            <p className="text-muted-foreground text-lg font-light">No artworks found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[400px]">
              {visibleArtworks.map((art, index) => {
                const isLastElement = index === visibleArtworks.length - 1;
                return (
                  <motion.div
                    key={art.id}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(245,158,11,0.25)' }}
                    transition={{ y: { duration: 0.3 }, boxShadow: { duration: 0.3 } }}
                    className={`group relative rounded-3xl overflow-hidden bg-black border border-border cursor-pointer block ${index % 5 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                  >
                    <Link
                      to={`/artwork/${art.id}`}
                      ref={isLastElement ? (lastArtworkElementRef as any) : null}
                      className="block w-full h-full"
                      style={{ display: 'block' }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index % 12) * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full"
                      >
                        <GalleryCard art={art} />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  );
}

// ── GalleryCard sub-component ─────────────────────────────────────────────
// FIX 1: Author pill uses useNavigate + <button> instead of <Link> to avoid
//         the invalid nested <a> inside the card's <Link> wrapper.
// FIX 2: Overlay is now a solid dark veil (opacity-60 always + opacity-100
//         on hover) so the entire card is covered — not just the bottom.
function GalleryCard({ art }: { art: any }) {
  const { hasLiked, likeCount, toggling, toggle } = useLike(art.id);
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full">
      <img
        src={art.imageUrl}
        alt={art.title}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* Single unified overlay: solid black at bottom, fades to transparent at top.
           Using multiple via stops ensures the bottom edge is FULLY opaque. */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)' }}
      />

      {/* Content — pinned to bottom, fades in on hover (no translate to avoid clipping) */}
      <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 flex flex-col">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2 bg-amber-500/15 px-3 py-1.5 rounded-full w-fit backdrop-blur-md border border-amber-500/20">
          {art.category}
        </span>
        <h3 className="text-xl font-display font-bold text-white mb-3 line-clamp-1 drop-shadow-md">{art.title}</h3>
        <div className="flex items-center justify-between">
          {/* Author pill — useNavigate avoids nested <a> hydration error */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/profile/${art.authorId}`); }}
            className="text-sm text-gray-200 hover:text-white transition-colors flex items-center gap-2 bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-md w-fit border border-white/10"
          >
            <img
              src={art.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(art.authorName)}&background=random`}
              alt={art.authorName}
              className="w-5 h-5 rounded-full border border-white/20"
            />
            <span className="font-medium">{art.authorName}</span>
          </button>

          {/* Like button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-200 border ${
              hasLiked
                ? 'bg-red-500 border-red-400 text-white scale-105'
                : 'bg-black/50 border-white/10 text-white hover:bg-red-500/70 hover:border-red-400/50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${hasLiked ? 'fill-current scale-110' : ''}`} />
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}
