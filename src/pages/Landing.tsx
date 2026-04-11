import Hero from '../components/Hero';
import Community from '../components/Community';
import Mastery from '../components/Mastery';
import GlobalGallery from '../components/GlobalGallery';
import Marketplace from '../components/Marketplace';
import CTA from '../components/CTA';

export default function Landing() {
  return (
    <div className="bg-background min-h-screen font-sans text-foreground selection:bg-amber-500/30">
      <main>
        <Hero />
        <Community />
        <Mastery />
        <GlobalGallery />
        <Marketplace />
        <CTA />
      </main>
      <footer className="bg-background py-8 border-t border-border text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} JMZ Arts & Design. All rights reserved.</p>
      </footer>
    </div>
  );
}
