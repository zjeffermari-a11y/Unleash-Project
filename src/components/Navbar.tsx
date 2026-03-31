import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full w-full max-w-5xl shadow-2xl">
        <Link to="/" className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
          JMZ <span className="text-amber-500 font-sans text-xs tracking-widest uppercase bg-amber-500/10 px-2 py-1 rounded-full">Arts</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/gallery" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            Gallery
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/community" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            Community
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={`/profile/${user.uid}`} className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group">
                Profile
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button onClick={logout} className="px-5 py-2 text-xs font-bold tracking-wider uppercase text-white border border-white/20 rounded-full hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all duration-300">Logout</button>
            </div>
          ) : (
            <button onClick={login} className="px-5 py-2 text-xs font-bold tracking-wider uppercase text-black bg-white rounded-full hover:bg-amber-500 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">Login</button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
