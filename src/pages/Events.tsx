import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

import { Calendar, MapPin, Plus, X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('type', '==', 'Event'), where('status', '==', filter), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
      setError('Please select an image for the event.');
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
        type: 'Event',
        status: 'upcoming',
        createdAt: serverTimestamp(),
      });

      setIsHostModalOpen(false);
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setImagePreview('');
      fetchEvents();
    } catch (err: any) {
      console.error('Host event error:', err);
      setError(err.message || 'Failed to host event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Semantic root — bg-background and text-foreground adapt to light/dark automatically
    <div className="bg-background min-h-screen font-sans text-foreground relative">

      {/* Background image layer — intentionally decorative, always subtle */}
      <div className="absolute inset-0 opacity-30 dark:opacity-40 pointer-events-none z-0">
        <img
          src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Art Event Background"
          className="w-full h-full object-cover grayscale"
          referrerPolicy="no-referrer"
        />
        {/* Gradient fades into the themed background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      </div>

      <main className="pt-40 pb-24 container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-4">
              ART <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">EVENTS</span>
            </h1>
            <p className="text-muted-foreground font-light max-w-xl drop-shadow-md">
              Discover and join art events happening around the globe or virtually.
            </p>
          </motion.div>

          {user && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsHostModalOpen(true)}
              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <Plus className="w-4 h-4" /> Host Event
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex justify-center md:justify-start gap-4 mb-12 border-b border-border pb-4">
          {['upcoming', 'ongoing', 'past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-colors ${filter === f
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-card rounded-3xl backdrop-blur-sm border border-border">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-light">No {filter} events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card backdrop-blur-sm border border-border rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-colors shadow-lg"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Badge on photo — intentionally stays dark for contrast on image */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-amber-500">
                    {event.status}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold mb-2 text-foreground">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {event.date?.toDate ? event.date.toDate().toLocaleDateString() : new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Hosted by</span>
                      <Link to={`/profile/${event.hostId}`} className="text-sm font-bold hover:text-amber-500 transition-colors">
                        {event.hostName}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Host Event Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsHostModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsHostModalOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-display font-bold mb-8 text-foreground">Host an Event</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleHostSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Event Image</label>
                <div className="relative h-48 border-2 border-dashed border-border rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Upload className="w-8 h-8 mb-2 group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm">Click or drag to upload (Max 10MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Event Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none placeholder:text-muted-foreground"
                    placeholder="e.g. Modern Art Exhibition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Location (or Virtual Link)</label>
                <input
                  required
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none placeholder:text-muted-foreground"
                  placeholder="e.g. 123 Gallery St, NY or https://zoom.us/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none h-32 resize-none placeholder:text-muted-foreground"
                  placeholder="Describe your event..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Host Event'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}