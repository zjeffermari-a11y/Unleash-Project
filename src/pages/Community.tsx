import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, ShoppingBag, Wrench, ArrowRight, Users, Zap, Loader2 } from 'lucide-react';

export default function Community() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    events: { upcoming: 0, online: 0 },
    market: { items: 0 },
    workshops: { upcoming: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch Events count
        const eventsQ = query(collection(db, 'events'), where('type', '==', 'Event'), where('status', '==', 'upcoming'));
        const eventsSnap = await getCountFromServer(eventsQ);
        
        // Fetch Marketplace count
        const marketQ = query(collection(db, 'marketItems'), where('status', '==', 'available'));
        const marketSnap = await getCountFromServer(marketQ);

        // Fetch Workshops count
        const workshopsQ = query(collection(db, 'events'), where('type', '==', 'Workshop'), where('status', '==', 'upcoming'));
        const workshopsSnap = await getCountFromServer(workshopsQ);

        setStats({
          events: { upcoming: eventsSnap.data().count, online: Math.floor(eventsSnap.data().count * 0.3) }, // Mocking 'online' as 30% of upcoming
          market: { items: marketSnap.data().count },
          workshops: { upcoming: workshopsSnap.data().count }
        });
      } catch (err) {
        console.error("Error fetching community stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const SECTIONS = [
    {
      label: 'Events',
      description: 'Art exhibitions, live gatherings, and online meetups',
      route: '/community/events',
      icon: Calendar,
      iconBg: 'bg-purple-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      stats: [
        { value: stats.events.upcoming, label: 'upcoming' },
        { value: stats.events.online, label: 'online' },
      ],
      cta: 'Browse Events',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
      border: 'hover:border-purple-500/40',
    },
    {
      label: 'Marketplace',
      description: 'Buy and sell original artworks, prints, and commissions',
      route: '/community/marketplace',
      icon: ShoppingBag,
      iconBg: 'bg-green-500/20 border-green-500/30',
      iconColor: 'text-green-400',
      stats: [
        { value: stats.market.items, label: 'listings' },
        { value: 'Free', label: 'to list' },
      ],
      cta: 'Browse Marketplace',
      gradient: 'from-green-500/10 via-transparent to-transparent',
      border: 'hover:border-green-500/40',
    },
    {
      label: 'Workshops',
      description: 'Learn from top artists with live and recorded sessions',
      route: '/community/workshops',
      icon: Wrench,
      iconBg: 'bg-amber-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
      stats: [
        { value: stats.workshops.upcoming, label: 'upcoming' },
        { value: 'Free', label: 'included' },
      ],
      cta: 'Browse Workshops',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
      border: 'hover:border-amber-500/40',
    },
  ];

  return (
    <div className="flex-1 px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          <Users className="h-3.5 w-3.5" />
          <span>Community</span>
          <span className="text-border">—</span>
          <span>Overview</span>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
          Community — Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
          Everything creative, all in one place. Explore sections below to connect, trade, and grow.
        </p>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.3, ease: 'easeOut' }}
              onClick={() => navigate(section.route)}
              className={`group relative flex flex-col justify-between rounded-2xl border border-border bg-card/50 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${section.border}`}
            >
              {/* Card gradient tint */}
              <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10 p-6">
                {/* Icon */}
                <div className={`h-12 w-12 rounded-xl border ${section.iconBg} flex items-center justify-center mb-5`}>
                  <Icon className={`h-6 w-6 ${section.iconColor}`} />
                </div>

                {/* Title + description */}
                <h3 className="text-base font-display font-bold mb-1.5 text-foreground">{section.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4">
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/30" />
                      <span className="text-[10px] text-muted-foreground/30 uppercase font-bold tracking-tighter">Syncing...</span>
                    </div>
                  ) : (
                    section.stats.map((stat, i) => (
                      <span key={i} className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</span> {stat.label}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* CTA footer */}
              <div className="relative z-10 px-6 pb-5">
                <button
                  type="button"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-bold transition-all duration-200 group-hover:border-current group-hover:gap-3 ${section.iconColor}`}
                  tabIndex={-1}
                >
                  {section.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom quick stats bar */}
      <div className="mt-8 flex items-center gap-6 p-4 rounded-2xl border border-border bg-accent/30">
        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
        <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
          <span><span className="font-bold text-foreground">1M+</span> global artists</span>
          <span className="text-border">·</span>
          <span><span className="font-bold text-foreground">24/7</span> live events</span>
          <span className="text-border">·</span>
          <span><span className="font-bold text-foreground">0%</span> commission on Pro</span>
          <span className="text-border">·</span>
          <span><span className="font-bold text-foreground">150+</span> countries represented</span>
        </div>
      </div>
    </div>
  );
}