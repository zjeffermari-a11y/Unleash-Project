import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import sculptorImg from '../../sculptor.png';
import sculptorAnim from '../../sculptor-animation.webm';

const UNLEASH_FACTS = [
  "Unleash is the most exclusive network of digital and traditional artists.",
  "Every 3D model uploaded is automatically optimized for extreme web performance!",
  "Did you know? You can host and attend live workshops right here in the community.",
  "Our marketplace is built strictly to protect the authenticity of original works.",
  "Ready to leave your mark? Showcase your portfolio to the world in 3D!",
  "You can chat, trade, and explore virtual galleries with fellow creators."
];

import { useLocation } from 'react-router-dom';

export function FloatingCharacter() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentFact, setCurrentFact] = useState(UNLEASH_FACTS[0]);
  const location = useLocation();

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Pick a new random fact, ensuring it isn't the exact same one twice in a row
    const availableFacts = UNLEASH_FACTS.filter(f => f !== currentFact);
    setCurrentFact(availableFacts[Math.floor(Math.random() * availableFacts.length)]);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: [0, -5, 0],
      transition: {
        opacity: { duration: 0.6, ease: 'easeOut' },
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
      }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.15 },
    }
  };

  // Dynamically position the character so it never blocks page-specific content
  const path = location.pathname;

  // Determine if we should show the character on the current page
  const isLanding = path === '/';
  const isGallery = path.startsWith('/gallery');
  const isCommunity = path.startsWith('/community');

  // Completely hide the character if we are on any other page (like /create or /artwork)
  if (!isLanding && !isGallery && !isCommunity) {
    return null;
  }

  let layoutClass = "fixed bottom-6 left-6 z-50 lg:left-8 cursor-pointer";
  let bubbleAlignClass = "left-2";
  let tailAlignClass = "left-10";

  // Check the current route and alter layout rules!
  if (isGallery || isCommunity) {
    // Both Gallery and Community will park him cleanly on the bottom right
    layoutClass = "fixed bottom-6 right-6 z-50 lg:right-8 cursor-pointer";
    bubbleAlignClass = "right-2";
    tailAlignClass = "right-10 transform -scale-x-100"; // flips the tail visually
  }

  return (
    <motion.div
      className={layoutClass}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      whileTap="tap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-32 lg:w-40 flex items-center justify-center group z-50">

        {/* Dynamic Chat Bubble */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
              className={`absolute bottom-[90%] ${bubbleAlignClass} mb-2 w-56 sm:w-64 p-4 bg-[#111] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-sm text-gray-200 font-medium leading-relaxed tracking-wide select-none z-[100]`}
            >
              {currentFact}
              
              {/* Tooltip Tail */}
              <div className={`absolute top-[98%] ${tailAlignClass} w-4 h-4 bg-[#111] border-r border-b border-white/10 rotate-45 -translate-y-2 pointer-events-none`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The static image permanently stays in flow to hold the exact container dimensions */}
        <img
          src={sculptorImg}
          alt="Character Mascot"
          className={`w-full select-none transition-opacity duration-300 pointer-events-none drop-shadow-2xl group-hover:drop-shadow-[0_10px_20px_rgba(245,158,11,0.2)] ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Native transparent webm video overlay! */}
        <video 
          src={sculptorAnim}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </motion.div>
  );
}
