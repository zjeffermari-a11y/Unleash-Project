import { motion } from 'motion/react';
import { Sparkles, Palette, Box } from 'lucide-react';

export default function Mastery() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-10 pointer-events-none mix-blend-overlay" />
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-gray-300">Elevate Your Craft</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-8">
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500">
                Technique.
              </span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-12 max-w-xl font-light leading-relaxed">
              Join exclusive masterclasses, refine your skills with industry leaders, and host your own virtual exhibitions to a global audience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(245,158,11,0.15)" }} className="p-8 rounded-3xl glass-panel group hover:bg-white/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Palette className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="text-white font-display font-bold text-xl mb-2 group-hover:text-amber-400 transition-colors duration-300">Painting</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Master traditional oils, acrylics, and cutting-edge digital painting techniques.</p>
              </motion.div>
              
              <motion.div whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(239,68,68,0.15)" }} className="p-8 rounded-3xl glass-panel group hover:bg-white/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
                  <Box className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-white font-display font-bold text-xl mb-2 group-hover:text-red-400 transition-colors duration-300">Sculpting</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Explore 3D modeling, physical sculpting, and mixed-media installations.</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 grid grid-cols-2 gap-6"
          >
            <div className="space-y-6 lg:mt-20">
              <motion.div whileHover={{ scale: 1.02, rotate: -1 }} transition={{ duration: 0.4 }} className="rounded-3xl overflow-hidden glass-panel p-2 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop" alt="Artist Palette" className="w-full h-full rounded-2xl object-cover aspect-[3/4]" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, rotate: 1 }} transition={{ duration: 0.4 }} className="rounded-3xl overflow-hidden glass-panel p-2 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=600&auto=format&fit=crop" alt="Sculpture Detail" className="w-full h-full rounded-2xl object-cover aspect-square" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02, rotate: 1 }} transition={{ duration: 0.4 }} className="rounded-3xl overflow-hidden glass-panel p-2 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=600&auto=format&fit=crop" alt="Art Studio" className="w-full h-full rounded-2xl object-cover aspect-square" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, rotate: -1 }} transition={{ duration: 0.4 }} className="rounded-3xl overflow-hidden glass-panel p-2 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=600&auto=format&fit=crop" alt="Abstract Painting" className="w-full h-full rounded-2xl object-cover aspect-[3/4]" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
