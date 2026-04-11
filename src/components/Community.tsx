import { motion, useInView, animate } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

function Counter({ from, to }: { from: number, to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(from, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = Math.floor(value).toLocaleString();
          }
        }
      });
      return () => controls.stop();
    }
  }, [inView, from, to]);

  return <span ref={ref}>{from.toLocaleString()}</span>;
}

export default function Community() {
  return (
    <section id="community" className="py-32 bg-background relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-10 pointer-events-none mix-blend-overlay" />
      
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-sm md:text-base font-bold text-amber-500 mb-6 tracking-[0.2em] uppercase">
            The Global Network
          </h2>
          <div className="text-7xl md:text-[12rem] font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-foreground/20 dark:from-white dark:via-white dark:to-white/20 leading-none mb-4 tracking-tighter">
            <Counter from={0} to={1000000} />
          </div>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground dark:text-white tracking-tight">
            Creators Worldwide.
          </h3>
        </motion.div>

        <div className="mt-32 relative max-w-6xl mx-auto h-[500px] md:h-[700px]">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            whileHover={{ scale: 1.05, zIndex: 40, rotate: -2 }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 0.3 }, rotate: { duration: 0.3 } }}
            className="absolute top-0 left-0 w-[40%] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl z-20 glass-panel p-2 cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600&auto=format&fit=crop" alt="Classical Statue" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            whileHover={{ scale: 1.05, zIndex: 40, rotate: 2 }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }, scale: { duration: 0.3 }, rotate: { duration: 0.3 } }}
            className="absolute top-1/4 right-0 w-[45%] aspect-square rounded-3xl overflow-hidden shadow-2xl z-10 glass-panel p-2 cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop" alt="Vibrant Painting" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -15, 0] }}
            whileHover={{ scale: 1.05, zIndex: 40, rotate: -1 }}
            transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }, scale: { duration: 0.3 }, rotate: { duration: 0.3 } }}
            className="absolute bottom-0 left-1/4 w-[55%] aspect-video rounded-3xl overflow-hidden shadow-2xl z-30 glass-panel p-2 cursor-pointer"
          >
            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" alt="Digital Art" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
