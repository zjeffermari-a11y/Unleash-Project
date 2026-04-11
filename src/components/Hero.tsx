import { motion, useScroll, useTransform } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import Hero3D from './Hero3D';

export default function Hero() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleStartCreating = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    } else {
      login();
    }
  };

  return (
    <section 
      ref={containerRef} 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background"
      style={{ perspective: '1000px' }}
    >
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-20 pointer-events-none mix-blend-overlay" />
      
      {/* Animated Gradient Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-amber-600/20 to-orange-900/20 blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-red-900/20 to-amber-900/20 blur-[150px] mix-blend-screen"
        />
      </div>

      {/* Three.js 3D Background */}
      <motion.div style={{ opacity }} className="absolute inset-0 z-[1] pointer-events-none">
        <Hero3D />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground dark:text-gray-300">The New Standard for Artists</span>
        </motion.div>

        <div className="overflow-hidden mb-4">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] md:text-[8vw] leading-[0.85] font-display font-bold tracking-tighter text-foreground dark:text-white"
          >
            CLAIM YOUR
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] md:text-[8vw] leading-[0.85] font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"
          >
            SPOTLIGHT
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground dark:text-gray-400 mb-12 max-w-2xl mx-auto font-light"
        >
          Showcase your work. Build your name. Connect with a globally creative community redefining digital and physical art.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button 
            onClick={handleStartCreating}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
              Start Creating <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <motion.button 
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-foreground dark:text-white font-bold rounded-full text-sm tracking-widest uppercase border border-foreground/20 dark:border-white/20 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-300"
          >
            Explore Gallery
          </motion.button>
        </motion.div>
      </div>

    </section>
  );
}
