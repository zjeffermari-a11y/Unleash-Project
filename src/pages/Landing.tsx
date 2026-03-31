import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Community from '../components/Community';
import Mastery from '../components/Mastery';
import GlobalGallery from '../components/GlobalGallery';
import Marketplace from '../components/Marketplace';
import CTA from '../components/CTA';

export default function Landing() {
  return (
    <div className="bg-black min-h-screen font-sans text-white selection:bg-amber-500/30">
      <Navbar />
      <main>
        <Hero />
        <Community />
        <Mastery />
        <GlobalGallery />
        <Marketplace />
        <CTA />
      </main>
      <footer className="bg-black py-8 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} JMZ Arts & Design. All rights reserved.</p>
      </footer>
    </div>
  );
}
