import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, ShoppingBag, Users } from 'lucide-react';

export default function Community() {
  return (
    <div className="bg-[#050505] min-h-screen font-sans text-white">
      <Navbar />
      
      <main className="pb-24">
        {/* Events Hero */}
        <div className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
            alt="Events Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/40 to-[#050505]" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-amber-500/20">
                <Calendar className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
                Art <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Events</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md mb-10">
                Discover ongoing, upcoming, and past art exhibitions and gatherings. Host your own event and invite the community.
              </p>
              <Link 
                to="/community/events"
                className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105"
              >
                Browse Events
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Marketplace Hero */}
        <div className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?q=80&w=2070&auto=format&fit=crop" 
            alt="Marketplace Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/40 to-[#050505]" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-amber-500/20">
                <ShoppingBag className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Marketplace</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md mb-10">
                Buy and sell physical and digital assets. From paintings and sculptures to digital masterpieces.
              </p>
              <Link 
                to="/community/marketplace"
                className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105"
              >
                Enter Marketplace
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Workshops Hero */}
        <div className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop" 
            alt="Workshops Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/40 to-[#050505]" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-amber-500/20">
                <Users className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-white drop-shadow-2xl uppercase">
                Creative <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Workshops</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md mb-10">
                Learn new skills or share your expertise. Join ongoing, upcoming, and past workshops hosted by the community.
              </p>
              <Link 
                to="/community/workshops"
                className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105"
              >
                Explore Workshops
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
