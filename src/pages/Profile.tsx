import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, doc, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import EditProfileModal from '../components/EditProfileModal';
import { Plus, Lock, Globe, MapPin, Link as LinkIcon, Instagram, Twitter, Trash2, Edit2 } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
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
    <div className="bg-[#050505] min-h-screen font-sans text-white">
      <Navbar />
      
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-6 relative -mt-32 z-10">
              {/* Profile Header */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16"
              >
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-[#050505] shadow-2xl bg-zinc-900">
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
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 mb-6">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Global</span>
                    <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> portfolio.com</span>
                  </div>
                  <p className="text-gray-300 max-w-2xl text-lg font-light leading-relaxed">
                    {profileUser.bio || "Digital artist exploring the intersection of technology and human emotion. Based everywhere."}
                  </p>
                </div>

                {isOwner && (
                  <div className="pb-4 flex flex-col gap-3">
                    <button 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="group relative px-6 py-3 bg-white text-black font-bold rounded-full text-sm tracking-widest uppercase overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                      <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-500">
                        <Plus className="w-4 h-4" /> Upload
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-full text-sm tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Portfolio Grid */}
              <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
                <h2 className="text-2xl font-display font-bold">Selected Works <span className="text-gray-500 text-lg font-sans font-normal ml-2">({artworks.length})</span></h2>
              </div>

              {artworks.length === 0 ? (
                <div className="text-center py-32 glass-panel rounded-3xl">
                  <p className="text-gray-500 text-lg font-light">No artworks found in this collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                  {artworks.map((art, index) => (
                    <motion.div 
                      key={art.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 ${index % 4 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
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
                          {isOwner && (
                            <span className="text-gray-400 bg-black/50 p-2 rounded-full backdrop-blur-md">
                              {art.privacy === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            </span>
                          )}
                        </div>
                        <h3 className="text-3xl font-display font-bold text-white mb-2">{art.title}</h3>
                        {art.description && (
                          <p className="text-sm text-gray-300 line-clamp-2 font-light">{art.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-32">
            <h1 className="text-4xl font-display font-bold text-gray-400">Profile not found</h1>
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

      {/* Delete Confirmation Modal */}
      {artworkToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Delete Artwork</h3>
            <p className="text-gray-400 mb-8 font-light">Are you sure you want to delete this artwork? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setArtworkToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
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
    </div>
  );
}
