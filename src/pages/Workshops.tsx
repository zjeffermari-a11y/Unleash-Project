import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import { Users, MapPin, Plus, X, Upload, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Workshops() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, ongoing, past
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  // Host Modal State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('type', '==', 'Workshop'), where('status', '==', filter), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const fetchedWorkshops = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setWorkshops(fetchedWorkshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [filter]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setError('');
      try {
        const resizedDataUrl = await resizeImage(file);
        setImagePreview(resizedDataUrl);
      } catch (err) {
        console.error("Error resizing image:", err);
        setError("Failed to process image.");
      }
    }
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imagePreview) {
      setError('Please select an image for the workshop.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      if (imagePreview.length > 1048000) {
        throw new Error("Image is too large to store. Please try a smaller image.");
      }

      await addDoc(collection(db, 'events'), {
        title,
        description,
        date: new Date(date),
        location,
        hostId: user.uid,
        hostName: user.displayName || 'Anonymous',
        imageUrl: imagePreview,
        type: 'Workshop',
        status: 'upcoming', // Default to upcoming
        createdAt: serverTimestamp(),
      });
      
      setIsHostModalOpen(false);
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setImagePreview('');
      fetchWorkshops();
    } catch (err: any) {
      console.error('Host workshop error:', err);
      setError(err.message || 'Failed to host workshop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen font-sans text-white">
      <Navbar />
      
      <main className="pt-40 pb-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-4">
              CREATIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">WORKSHOPS</span>
            </h1>
            <p className="text-gray-400 font-light max-w-xl">
              Learn new skills or share your expertise with the community.
            </p>
          </motion.div>

          {user && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsHostModalOpen(true)}
              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <Plus className="w-4 h-4" /> Host Workshop
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex justify-center md:justify-start gap-4 mb-12 border-b border-white/10 pb-4">
          {['upcoming', 'ongoing', 'past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-colors ${
                filter === f 
                  ? 'bg-white text-black' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-light">No {filter} workshops found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <motion.div 
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-colors"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={workshop.imageUrl} 
                    alt={workshop.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-amber-500">
                    {workshop.status}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold mb-2 text-white">{workshop.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{workshop.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {workshop.date?.toDate ? workshop.date.toDate().toLocaleDateString() : new Date(workshop.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {workshop.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Hosted by</span>
                      <Link to={`/profile/${workshop.hostId}`} className="text-sm font-bold hover:text-amber-500 transition-colors">
                        {workshop.hostName}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Host Workshop Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsHostModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setIsHostModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-display font-bold mb-8">Host a Workshop</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleHostSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Workshop Image</label>
                <div className="relative h-48 border-2 border-dashed border-white/20 rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <input 
                    type="file" 
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2 group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm">Click or drag to upload (Max 10MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Workshop Title</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                    placeholder="e.g. Digital Art Masterclass"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Date & Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Location (or Virtual Link)</label>
                <input 
                  required
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                  placeholder="e.g. 123 Gallery St, NY or https://zoom.us/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none h-32 resize-none"
                  placeholder="Describe your workshop..."
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Host Workshop'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
