import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import { Search, MapPin, Globe, Filter, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Gallery() {
  const location = useLocation();
  const initialSearch = location.state?.search || '';
  
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
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
    <div className="bg-[#050505] min-h-screen font-sans text-white">
      <Navbar />
      
      <main className="pb-24">
        {/* Hero Section */}
        <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden mb-16">
          <img 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop" 
            alt="Gallery Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#050505]" />
          
          <div className="relative z-10 container mx-auto px-6 text-center mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-white drop-shadow-2xl">
                GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">GALLERY</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                Explore the finest works from our community of over 1,000,000 artists worldwide. Discover inspiration in every pixel and brushstroke.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 glass-panel p-4 rounded-full">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar">
            {['All', 'Painting', 'Sculpting', 'Digital', 'Photography', 'Other'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                  categoryFilter === cat 
                    ? 'bg-white text-black shadow-lg shadow-white/20' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search artworks or artists..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-gray-500"
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
            <p className="text-gray-500 text-lg font-light">No artworks found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[400px]">
              {visibleArtworks.map((art, index) => {
                const isLastElement = index === visibleArtworks.length - 1;
                return (
                  <motion.div 
                    ref={isLastElement ? lastArtworkElementRef : null}
                    key={art.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10, boxShadow: "0 20px 40px -15px rgba(245,158,11,0.2)" }}
                    transition={{ delay: (index % 12) * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1], y: { duration: 0.3 }, boxShadow: { duration: 0.3 } }}
                    className={`group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer ${index % 5 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                  >
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-3 bg-amber-500/10 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
                        {art.category}
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white mb-2">{art.title}</h3>
                      <Link to={`/profile/${art.authorId}`} className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-3 mt-2 bg-black/40 p-2 rounded-full backdrop-blur-md w-fit">
                        <img 
                          src={art.authorPhoto || `https://ui-avatars.com/api/?name=${art.authorName}&background=random`} 
                          alt={art.authorName} 
                          className="w-8 h-8 rounded-full border border-white/20"
                        />
                        <span className="pr-2 font-medium">{art.authorName}</span>
                      </Link>
                    </div>
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
