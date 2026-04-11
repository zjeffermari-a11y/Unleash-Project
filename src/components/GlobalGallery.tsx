import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function GlobalGallery() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/gallery', { state: { search } });
  };

  return (
    <section id="gallery" className="py-32 bg-background relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-10 pointer-events-none mix-blend-overlay" />
      
      <div className="absolute inset-0 opacity-20 mix-blend-luminosity">
        <img src="https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1920&auto=format&fit=crop" alt="Gallery Exhibition" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-display font-bold text-foreground dark:text-white mb-16 tracking-tight leading-[1.1]"
        >
          A GLOBAL STAGE FOR <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 italic pr-4">
            EVERY MEDIUM
          </span>
        </motion.h2>

        <form onSubmit={handleSearch}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto glass-panel p-2 rounded-full flex items-center shadow-2xl"
          >
            <Search className="w-6 h-6 text-gray-400 ml-4" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search galleries, artists, mediums..." 
              className="w-full bg-transparent border-none outline-none text-foreground dark:text-white px-4 py-3 placeholder-muted-foreground dark:placeholder-gray-400"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Explore
            </motion.button>
          </motion.div>
        </form>

        <div className="mt-24 flex justify-center items-center gap-12 md:gap-32">
          <Link to="/gallery">
            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <MapPin className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-foreground dark:text-white font-medium tracking-widest uppercase text-sm group-hover:text-amber-400 transition-colors duration-300">Local</span>
            </motion.div>
          </Link>

          <div className="hidden md:block w-32 h-[1px] border-t-2 border-dashed border-white/20" />

          <Link to="/gallery">
            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center gap-4 cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/50 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <Globe className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-foreground dark:text-white font-medium tracking-widest uppercase text-sm group-hover:text-red-400 transition-colors duration-300">Global</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
