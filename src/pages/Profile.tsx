import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, doc, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useFollow } from '../hooks/useFollow';
import { useLike } from '../hooks/useLike';
import { useCommissions, useUpdateCommissionStatus, type Commission } from '../hooks/useCommissions';

import UploadModal from '../components/UploadModal';
import EditProfileModal from '../components/EditProfileModal';
import CommissionRequestModal from '../components/CommissionRequestModal';
import CreatorAnalytics from '../components/profile/CreatorAnalytics';
import FollowListModal from '../components/profile/FollowListModal';
import { Plus, Lock, Globe, MapPin, Link as LinkIcon, Trash2, Edit2, Heart, UserPlus, UserCheck, Palette, Clock, CheckCircle, XCircle, ChevronDown, BarChart2, MessageSquareText } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [activeTab, setActiveTab] = useState<'works' | 'commissions' | 'analytics'>('works');
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser?.uid === userId;

  const fetchArtworks = async () => {
    if (!userId) return;
    try {
      const artworksRef = collection(db, 'artworks');
      let q;
      if (isOwner) {
        q = query(artworksRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
      } else {
        q = query(artworksRef, where('authorId', '==', userId), where('privacy', '==', 'public'), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const fetchedArtworks = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setArtworks(fetchedArtworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const confirmDelete = async () => {
    if (!artworkToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'artworks', artworkToDelete));
      setArtworks(artworks.filter(art => art.id !== artworkToDelete));
      setArtworkToDelete(null);
    } catch (error) {
      console.error('Error deleting artwork:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    
    // Listen to user profile changes in real-time
    const unsubscribeUser = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setProfileUser(docSnap.data());
      } else {
        setProfileUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    });

    fetchArtworks();

    return () => unsubscribeUser();
  }, [userId, isOwner]);

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">

      
      <main className="pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : profileUser ? (
          <>
            {/* Cover Image */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
              <img 
                src={profileUser.coverURL || `https://picsum.photos/seed/${userId}/1920/1080`} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-6 relative -mt-32 z-10">
              {/* Profile Header */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16"
              >
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-background shadow-2xl bg-muted">
                  <img 
                    src={profileUser.photoURL || `https://ui-avatars.com/api/?name=${profileUser.displayName}&background=random`} 
                    alt={profileUser.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left pb-4">
                  <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-2">
                    {profileUser.displayName}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Global</span>
                    <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> portfolio.com</span>
                    <ProfileFollowCounts userId={userId!} onOpenList={(type) => setFollowModalType(type)} />
                  </div>
                  <p className="text-muted-foreground max-w-2xl text-lg font-light leading-relaxed">
                    {profileUser.bio || "Digital artist exploring the intersection of technology and human emotion. Based everywhere."}
                  </p>
                </div>

                <div className="pb-4 flex flex-col gap-3">
                  {isOwner ? (
                    <>
                      <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="group relative px-6 py-3 bg-foreground text-background font-bold rounded-full text-sm tracking-widest uppercase overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-500">
                          <Plus className="w-4 h-4" /> Upload
                        </span>
                      </button>
                      <button 
                        onClick={() => setIsEditProfileModalOpen(true)}
                        className="px-6 py-3 bg-muted border border-border text-foreground font-bold rounded-full text-sm tracking-widest uppercase hover:bg-accent transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <ProfileFollowButton userId={userId!} />
                      {currentUser && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setIsCommissionModalOpen(true)}
                            className="px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                          >
                            <Palette className="w-4 h-4" /> Request Commission
                          </motion.button>
                          <MessageArtistButton artistId={userId!} />
                        </>
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* Tabs — only owners see the Commissions tab */}
              {isOwner ? (
                <div className="mb-12 flex items-center gap-0 border-b border-border">
                  <button
                    onClick={() => setActiveTab('works')}
                    className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
                      activeTab === 'works'
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Selected Works
                    <span className="text-muted-foreground text-xs font-sans font-normal ml-1.5">({artworks.length})</span>
                    {activeTab === 'works' && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('commissions')}
                    className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
                      activeTab === 'commissions'
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Palette className="w-4 h-4 inline -mt-0.5 mr-1.5" />
                    Commissions
                    {activeTab === 'commissions' && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
                      activeTab === 'analytics'
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 inline -mt-0.5 mr-1.5" />
                    Analytics
                    {activeTab === 'analytics' && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="mb-12 flex items-center justify-between border-b border-border pb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground">Selected Works <span className="text-muted-foreground text-lg font-sans font-normal ml-2">({artworks.length})</span></h2>
                </div>
              )}

              {/* Tab Content */}
              {(activeTab === 'works' || !isOwner) && (
                <>
                  {artworks.length === 0 ? (
                    <div className="text-center py-32 glass-panel rounded-3xl">
                      <p className="text-muted-foreground text-lg font-light">No artworks found in this collection.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                      {artworks.map((art, index) => (
                        <Link
                          key={art.id}
                          to={`/artwork/${art.id}`}
                          className={`group relative rounded-3xl overflow-hidden bg-card border border-border block ${index % 4 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full h-full"
                          >
                            <img 
                              src={art.imageUrl} 
                              alt={art.title} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            
                            {isOwner && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setArtworkToDelete(art.id);
                                }}
                                className="absolute top-4 right-4 p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-lg hover:scale-110"
                                title="Delete Artwork"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 pointer-events-none">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold tracking-widest uppercase text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                                  {art.category}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isOwner && (
                                    <span className="text-gray-400 bg-black/50 p-2 rounded-full backdrop-blur-md">
                                      {art.privacy === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                    </span>
                                  )}
                                  <ProfileLikeButton artworkId={art.id} authorId={art.authorId} />
                                </div>
                              </div>
                              <h3 className="text-3xl font-display font-bold text-white mb-2">{art.title}</h3>
                              {art.description && (
                                <p className="text-sm text-gray-300 line-clamp-2 font-light">{art.description}</p>
                              )}
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Analytics Dashboard — owner only */}
              {activeTab === 'analytics' && isOwner && (
                <CreatorAnalytics userId={userId!} />
              )}

              {/* Commissions Dashboard — owner only */}
              {activeTab === 'commissions' && isOwner && (
                <CommissionsDashboard userId={userId!} />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-32">
            <h1 className="text-4xl font-display font-bold text-muted-foreground">Profile not found</h1>
          </div>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={fetchArtworks}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        userProfile={profileUser}
      />

      <CommissionRequestModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        artistId={userId!}
        artistName={profileUser?.displayName || 'Artist'}
      />

      {/* Delete Confirmation Modal */}
      {artworkToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border p-8 rounded-3xl max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">Delete Artwork</h3>
            <p className="text-muted-foreground mb-8 font-light">Are you sure you want to delete this artwork? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setArtworkToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {followModalType && (
          <FollowListModal 
            isOpen={followModalType !== null}
            onClose={() => setFollowModalType(null)}
            userId={userId!}
            type={followModalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function ProfileFollowCounts({ userId, onOpenList }: { userId: string, onOpenList: (type: 'followers' | 'following') => void }) {
  const { followerCount, followingCount } = useFollow(userId);
  return (
    <>
      <button onClick={() => onOpenList('followers')} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
        <span className="font-bold text-foreground">{followerCount}</span>
        <span>followers</span>
      </button>
      <span className="text-muted-foreground/40">·</span>
      <button onClick={() => onOpenList('following')} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
        <span className="font-bold text-foreground">{followingCount}</span>
        <span>following</span>
      </button>
    </>
  );
}

function ProfileFollowButton({ userId }: { userId: string }) {
  const { isFollowing, toggling, toggle } = useFollow(userId);
  const { user } = useAuth();
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={toggle}
      disabled={toggling || !user}
      className={`px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${
        isFollowing
          ? 'bg-muted border border-border text-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500'
          : 'bg-amber-500 text-black hover:bg-amber-600'
      }`}
    >
      {isFollowing ? (
        <><UserCheck className="w-4 h-4" /> Following</>
      ) : (
        <><UserPlus className="w-4 h-4" /> {user ? 'Follow' : 'Sign in to Follow'}</>
      )}
    </motion.button>
  );
}

function ProfileLikeButton({ artworkId, authorId }: { artworkId: string; authorId?: string }) {
  const { hasLiked, likeCount, toggling, toggle } = useLike(artworkId, authorId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={toggling}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-colors pointer-events-auto ${
        hasLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-red-500/70'
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
      {likeCount}
    </button>
  );
}

// ── Commissions Dashboard ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: 'Pending',     color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  accepted:    { label: 'Accepted',    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  declined:    { label: 'Declined',    color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <Palette className="w-3.5 h-3.5" /> },
  delivered:   { label: 'Delivered',   color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  completed:   { label: 'Completed',   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:   { label: 'Cancelled',   color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: <XCircle className="w-3.5 h-3.5" /> },
};

function CommissionsDashboard({ userId }: { userId: string }) {
  const { commissions, loading } = useCommissions(userId, 'artist');
  const { updateStatus, updating } = useUpdateCommissionStatus();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? commissions
    : commissions.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'pending', 'accepted', 'in_progress', 'delivered', 'completed', 'declined', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border transition-colors ${
              filter === s
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-3xl">
          <Palette className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-light">
            {commissions.length === 0
              ? 'No commission requests yet. They\'ll appear here when a buyer inquires.'
              : 'No commissions match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((c) => (
              <CommissionCard key={c.id} commission={c} updateStatus={updateStatus} updating={updating} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function CommissionCard({
  commission: c,
  updateStatus,
  updating,
}: {
  commission: Commission;
  updateStatus: (id: string, status: Commission['status']) => Promise<void>;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-panel rounded-2xl overflow-hidden border border-border"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-lg font-display font-bold text-foreground truncate">{c.title}</h4>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-light">
            From <span className="font-medium text-foreground">{c.buyerName}</span>
            {' · '}
            <span className="text-amber-500 font-bold">${c.budget.toLocaleString()}</span>
            {c.deadline && (
              <> · Due {c.deadline.toDate().toLocaleDateString()}</>
            )}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground font-light whitespace-pre-wrap mb-6 leading-relaxed">
                {c.description}
              </p>

              {/* Action buttons — only show relevant transitions */}
              <div className="flex flex-wrap gap-3">
                {c.status === 'pending' && (
                  <>
                    <button
                      disabled={updating}
                      onClick={() => updateStatus(c.id, 'accepted', { recipientId: c.buyerId, commissionTitle: c.title })}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => updateStatus(c.id, 'declined', { recipientId: c.buyerId, commissionTitle: c.title })}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </>
                )}
                {c.status === 'accepted' && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(c.id, 'in_progress', { recipientId: c.buyerId, commissionTitle: c.title })}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Start Work
                  </button>
                )}
                {c.status === 'in_progress' && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(c.id, 'delivered', { recipientId: c.buyerId, commissionTitle: c.title })}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    Mark Delivered
                  </button>
                )}
                {c.status === 'delivered' && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(c.id, 'completed', { recipientId: c.buyerId, commissionTitle: c.title })}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                )}

                {/* Message Client — available on active commissions */}
                {['pending', 'accepted', 'in_progress', 'delivered'].includes(c.status) && (
                  <MessageClientButton buyerId={c.buyerId} commissionId={c.id} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Messaging Sub-Components ──────────────────────────────────────────────

function MessageArtistButton({ artistId }: { artistId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleClick = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Inline chat creation logic to avoid hook-in-event-handler issues
      const { collection, query, where, getDocs, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      // Check for existing chat
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const snapshot = await getDocs(q);
      let chatId: string | null = null;

      snapshot.forEach(d => {
        const data = d.data();
        if (data.participants.includes(artistId)) {
          chatId = d.id;
        }
      });

      if (!chatId) {
        const newRef = doc(collection(db, 'chats'));
        await setDoc(newRef, {
          participants: [user.uid, artistId],
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: { [user.uid]: 0, [artistId]: 0 }
        });
        chatId = newRef.id;
      }

      navigate(`/messages?chat=${chatId}`);
    } catch (err) {
      console.error('Failed to init chat:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <><MessageSquareText className="w-4 h-4" /> Message</>
      )}
    </motion.button>
  );
}

function MessageClientButton({ buyerId, commissionId }: { buyerId: string; commissionId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleClick = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { collection, query, where, getDocs, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const snapshot = await getDocs(q);
      let chatId: string | null = null;

      snapshot.forEach(d => {
        const data = d.data();
        if (data.participants.includes(buyerId)) {
          chatId = d.id;
        }
      });

      if (!chatId) {
        const newRef = doc(collection(db, 'chats'));
        await setDoc(newRef, {
          participants: [user.uid, buyerId],
          commissionId,
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: { [user.uid]: 0, [buyerId]: 0 }
        });
        chatId = newRef.id;
      }

      navigate(`/messages?chat=${chatId}`);
    } catch (err) {
      console.error('Failed to init chat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <><MessageSquareText className="w-3.5 h-3.5" /> Message Client</>
      )}
    </button>
  );
}
