import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    } else {
      login();
    }
  };

  return (
    <section id="login" className="py-40 bg-background relative flex items-center justify-center overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] z-10 pointer-events-none mix-blend-overlay" />

      <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop"
          alt="Neon Digital Gallery"
          className="w-full h-full object-cover blur-[8px] opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[1000px] h-[500px] bg-amber-900/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-6xl md:text-8xl font-display font-bold text-foreground dark:text-white mb-8 leading-[1.1] tracking-tight">
            Ready to Leave <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 italic pr-4">
              Your Mark?
            </span>
          </h2>

          <p className="text-xl text-muted-foreground dark:text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join the most exclusive network of digital and traditional artists. Showcase your portfolio to the world.
          </p>

          <motion.button
            onClick={handleAction}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center px-12 py-6 bg-white text-black font-bold rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow duration-300"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-3 text-sm tracking-[0.2em] uppercase">
              {user ? 'Go to Profile' : 'Join the Gallery'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
