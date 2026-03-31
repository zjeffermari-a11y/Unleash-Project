import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ShoppingCart, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

function TiltCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative aspect-[4/5] max-w-md mx-auto rounded-3xl glass-panel p-2 cursor-pointer z-10"
    >
      <div 
        className="w-full h-full rounded-2xl overflow-hidden relative shadow-2xl"
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
      >
        <img 
          src="/crimson-gaze.jpg" 
          onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=800&auto=format&fit=crop'}
          alt="Crimson Gaze" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div 
          className="absolute bottom-6 left-6 right-6 flex justify-between items-end"
          style={{ transform: "translateZ(40px)" }}
        >
          <div>
            <p className="text-white font-display font-bold text-2xl mb-1 drop-shadow-lg">Crimson Gaze</p>
            <p className="text-gray-300 text-sm drop-shadow-md">by Aria Vance</p>
          </div>
          <div className="text-right">
            <p className="text-red-500 font-mono font-bold text-xl drop-shadow-lg">4.2 ETH</p>
            <p className="text-gray-400 text-xs uppercase tracking-widest drop-shadow-md">Current Bid</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Marketplace() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleSell = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    } else {
      login();
    }
  };

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-10 pointer-events-none mix-blend-overlay" />
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[150px] translate-y-1/4 translate-x-1/4" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 relative"
            style={{ perspective: "1000px" }}
          >
            <TiltCard />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 lg:-right-12 glass-panel p-6 rounded-2xl flex items-center gap-4 shadow-2xl z-20"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-white font-bold font-display">Verified</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Authentic Original</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-8">
              Collect <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500">
                Masterpieces.
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Discover exclusive pieces, invest in emerging talent, and build your digital and physical collection in our curated marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-gray-200 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Explore Market
              </motion.button>
              
              <button 
                onClick={handleSell}
                className="group flex items-center gap-2 text-sm text-gray-400 font-bold tracking-widest uppercase hover:text-white transition-colors"
              >
                Sell Your Art
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-12">
              <div>
                <p className="text-3xl font-display font-bold text-white mb-2">10k+</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Artworks</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white mb-2">5k+</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Artists</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white mb-2">$2M+</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Volume</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
