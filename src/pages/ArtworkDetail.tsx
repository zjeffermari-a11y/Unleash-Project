import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, collection, query, where, orderBy, getDocs, increment, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useLike } from '../hooks/useLike';
import { useFollow } from '../hooks/useFollow';
import { useComments } from '../hooks/useComments';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  ArrowLeft,
  Send,
  UserPlus,
  UserCheck,
  Eye,
  Loader2,
  Calendar,
  Tag,
} from 'lucide-react';

export default function ArtworkDetail() {
  const { artworkId } = useParams<{ artworkId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alsoBy, setAlsoBy] = useState<any[]>([]);
  const [marketItem, setMarketItem] = useState<any>(null);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);

  // View-count guard:
  // - useRef stops React StrictMode from firing the effect twice per mount
  // - sessionStorage stops refresh spam (cleared when the tab closes, so
  //   returning users in a new session are counted correctly)
  const hasCountedView = useRef(false);

  const { hasLiked, likeCount, toggling: likeToggling, toggle: toggleLike } = useLike(artworkId!);
  const { isFollowing, followerCount, toggling: followToggling, toggle: toggleFollow } = useFollow(artwork?.authorId || '');
  const { comments, loading: commentsLoading, submitting, addComment } = useComments(artworkId!);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  // Fetch artwork doc + guard view count
  useEffect(() => {
    if (!artworkId) return;

    // ── View-count guards run SYNCHRONOUSLY before any async work ──────────
    // This is critical: if guards were inside .then(), two concurrent promises
    // (from StrictMode double-fire) could both pass before either sets the flag.
    //
    // Guard 1 — useRef:         blocks double-fire within ONE component instance
    // Guard 2 — sessionStorage: blocks refresh spam in the same browser session
    //                           (sessionStorage persists across refreshes but
    //                            clears when the tab is closed — correct behavior)
    const sessionKey = `viewed_${artworkId}`;
    const shouldCount = !hasCountedView.current && !sessionStorage.getItem(sessionKey);
    if (shouldCount) {
      // Mark BOTH guards immediately, before the async Firestore call
      hasCountedView.current = true;
      sessionStorage.setItem(sessionKey, '1');
    }

    setLoading(true);
    getDoc(doc(db, 'artworks', artworkId))
      .then((snap) => {
        if (snap.exists()) {
          setArtwork({ id: snap.id, ...snap.data() });
          // Only increment if the synchronous guard above cleared it
          if (shouldCount) {
            updateDoc(doc(db, 'artworks', artworkId), { viewCount: increment(1) }).catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }, [artworkId]);

  // Fetch "also by this artist" artworks (exclude current)
  useEffect(() => {
    if (!artwork?.authorId) return;
    const q = query(
      collection(db, 'artworks'),
      where('authorId', '==', artwork.authorId),
      where('privacy', '==', 'public'),
      orderBy('createdAt', 'desc')
    );
    getDocs(q).then((snap) => {
      const others = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a: any) => a.id !== artworkId)
        .slice(0, 4);
      setAlsoBy(others);
    });
  }, [artwork?.authorId, artworkId]);

  // Check if this artwork is listed on marketplace
  useEffect(() => {
    if (!artworkId) return;
    const q = query(
      collection(db, 'marketItems'),
      where('artworkId', '==', artworkId),
      where('status', '==', 'available')
    );
    getDocs(q).then((snap) => {
      if (!snap.empty) setMarketItem({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
  }, [artworkId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleAddToCart = () => {
    if (!marketItem) return;
    const inCart = cartItems.some((c) => c.id === marketItem.id);
    if (inCart) { toast.info(`"${marketItem.title}" is already in your cart.`); return; }
    addItem({
      id: marketItem.id,
      title: marketItem.title,
      seller: marketItem.sellerName,
      sellerId: marketItem.sellerId,
      price: marketItem.price,
      imageUrl: artwork.imageUrl,
      category: marketItem.category,
      type: marketItem.type,
    });
    toast.success(`"${marketItem.title}" added to cart!`);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to comment.'); return; }
    await addComment(commentInput);
    setCommentInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground text-xl">Artwork not found.</p>
        <button onClick={() => navigate(-1)} className="text-amber-500 font-bold underline">
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = user?.uid === artwork.authorId;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium truncate text-foreground">{artwork.title}</span>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">

          {/* ── Left: Full Artwork Image ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full object-contain max-h-[75vh]"
              />
              {/* Floating action bar */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLike}
                  disabled={likeToggling}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold backdrop-blur-md transition-colors ${hasLiked
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-black/50 text-white hover:bg-red-500/80'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComments((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {comments.length}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{artwork.viewCount ?? 0} views</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{likeCount} likes</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{comments.length} comments</span>
              {artwork.category && (
                <span className="flex items-center gap-1.5 ml-auto">
                  <Tag className="w-4 h-4" />
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                    {artwork.category}
                  </span>
                </span>
              )}
            </div>

            {/* Comments Section (collapsible) */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-card border border-border rounded-3xl p-6">
                    <h3 className="text-lg font-display font-bold mb-6 text-foreground">
                      Comments <span className="text-muted-foreground font-normal text-base">({comments.length})</span>
                    </h3>

                    {/* Add comment input */}
                    {user ? (
                      <form onSubmit={handleSendComment} className="flex items-center gap-3 mb-6">
                        <img
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                          alt={user.displayName || ''}
                          className="w-9 h-9 rounded-full border border-border shrink-0"
                        />
                        <input
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Add a comment…"
                          className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="submit"
                          disabled={submitting || !commentInput.trim()}
                          className="p-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </form>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-6">
                        <Link to="/" className="text-amber-500 font-bold hover:underline">Sign in</Link> to comment.
                      </p>
                    )}

                    {/* Comment list */}
                    {commentsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">Be the first to comment.</p>
                    ) : (
                      <div className="space-y-5">
                        {comments.map((c) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                          >
                            <img
                              src={c.authorPhoto}
                              alt={c.authorName}
                              className="w-8 h-8 rounded-full border border-border shrink-0 mt-0.5"
                            />
                            <div className="flex-1 bg-background rounded-2xl px-4 py-3 border border-border/60">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  to={`/profile/${c.authorId}`}
                                  className="text-sm font-bold text-foreground hover:text-amber-500 transition-colors"
                                >
                                  {c.authorName}
                                </Link>
                                {c.createdAt?.toDate && (
                                  <span className="text-xs text-muted-foreground">
                                    · {c.createdAt.toDate().toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/90 leading-relaxed">{c.body}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right: Info Panel ─────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            {/* Title & Meta */}
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 leading-tight">
                {artwork.title}
              </h1>
              {artwork.createdAt?.toDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {artwork.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Artist Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">Artist</p>
              <div className="flex items-center gap-4 mb-5">
                <Link to={`/profile/${artwork.authorId}`}>
                  <img
                    src={artwork.authorPhoto || `https://ui-avatars.com/api/?name=${artwork.authorName}&background=random`}
                    alt={artwork.authorName}
                    className="w-14 h-14 rounded-full border-2 border-border hover:border-amber-500 transition-colors"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${artwork.authorId}`}
                    className="font-display font-bold text-foreground hover:text-amber-500 transition-colors block truncate"
                  >
                    {artwork.authorName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{followerCount} followers</p>
                </div>
              </div>

              {!isOwner && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleFollow}
                  disabled={followToggling || !user}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${isFollowing
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
              )}
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">About this piece</p>
                <p className="text-foreground/90 leading-relaxed text-sm">{artwork.description}</p>
              </div>
            )}

            {/* Tags */}
            {artwork.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Buy / Cart Section */}
            {marketItem && (
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-3">Available for Purchase</p>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-display font-bold text-foreground">${marketItem.price}</span>
                  <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold uppercase tracking-wider">
                    {marketItem.type}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${cartItems.some((c) => c.id === marketItem.id)
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-default'
                    : 'bg-amber-500 text-black hover:bg-amber-600'
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartItems.some((c) => c.id === marketItem.id) ? 'In Cart ✓' : 'Add to Cart'}
                </motion.button>
              </div>
            )}

            {/* Also By This Artist */}
            {alsoBy.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Also by {artwork.authorName}</p>
                  <Link
                    to={`/profile/${artwork.authorId}`}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {alsoBy.map((a: any) => (
                    <Link key={a.id} to={`/artwork/${a.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="aspect-square rounded-xl overflow-hidden bg-card border border-border"
                      >
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
