import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Eye, Heart, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { useCommissions } from '../../hooks/useCommissions';
import { useFollow } from '../../hooks/useFollow';

interface CreatorAnalyticsProps {
  userId: string;
}

// ── Mock Data Generator ───────────────────────────────────────────────────
// We generate realistic 30-day viewing trends since we aren't tracking
// actual daily page hits in the DB yet.
const generateMockTimeline = () => {
  const data = [];
  const now = new Date();
  let baseViews = 150;
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Add random noise and an upward trend
    baseViews = Math.max(50, baseViews + (Math.random() * 40 - 15));
    
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(baseViews),
      engagement: Math.floor(baseViews * (0.1 + Math.random() * 0.15)), // 10-25% engagement rate
    });
  }
  return data;
};

const audienceData = [
  { name: 'Character Design', value: 85 },
  { name: 'Environment Art', value: 65 },
  { name: 'Concept Art', value: 45 },
  { name: 'Portraits', value: 30 },
  { name: 'Animation', value: 20 },
];

// ── Custom Tooltip for Recharts ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CreatorAnalytics({ userId }: CreatorAnalyticsProps) {
  const timelineData = useMemo(() => generateMockTimeline(), []);
  
  // Real Data Fetching
  const { commissions } = useCommissions(userId, 'artist');
  const { followerCount } = useFollow(userId);

  // Derived real metrics
  const totalEarned = commissions
    .filter(c => c.status === 'completed' || c.status === 'delivered')
    .reduce((sum, c) => sum + (c.budget || 0), 0);

  const activeCommissions = commissions
    .filter(c => c.status === 'in_progress' || c.status === 'accepted').length;

  const totalViews = timelineData.reduce((sum, day) => sum + day.views, 0);

  // Bento Box Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="gap-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
    >
      {/* ── Top Level Stats (The "Bento" Metrics) ────────────────────────── */}
      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
            <Eye className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> +12%
          </span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Profile Views (30d)</p>
          <h3 className="text-3xl font-display font-bold">{totalViews.toLocaleString()}</h3>
        </div>
      </motion.div>

      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl w-fit">
            <Heart className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> Real Data
          </span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Total Followers</p>
          <h3 className="text-3xl font-display font-bold">{followerCount.toLocaleString()}</h3>
        </div>
      </motion.div>

      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Active Commissions</p>
          <h3 className="text-3xl font-display font-bold">{activeCommissions}</h3>
        </div>
      </motion.div>

      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          {totalEarned > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              Real Data
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Total Earned</p>
          <h3 className="text-3xl font-display font-bold">${totalEarned.toLocaleString()}</h3>
        </div>
      </motion.div>

      {/* ── Main Area Chart (Profile Views) ──────────────────────────────── */}
      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border md:col-span-3 lg:col-span-3 h-[400px] flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-display font-bold text-foreground">Audience Engagement</h3>
          <p className="text-sm text-muted-foreground">Profile views & interactions over the last 30 days.</p>
        </div>
        
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="views" 
                name="Views"
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                name="Engagements"
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorEngage)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Side Bar Chart (Top Tags/Demographics) ─────────────────────── */}
      <motion.div variants={itemVars} className="glass-panel p-6 rounded-3xl border border-border h-[400px] flex flex-col md:col-span-3 lg:col-span-1">
        <div className="mb-6">
          <h3 className="text-lg font-display font-bold text-foreground">Top Resonating Styles</h3>
          <p className="text-sm text-muted-foreground">What your audience likes most.</p>
        </div>
        
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={audienceData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              <Bar dataKey="value" name="Interest Score" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
