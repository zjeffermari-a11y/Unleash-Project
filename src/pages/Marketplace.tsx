import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingBag, Plus, X, Upload, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Sell Modal State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Painting');
  const [type, setType] = useState('Physical');
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const itemsRef = collection(db, 'marketItems');
      const q = query(itemsRef, where('status', '==', 'available'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imagePreview) {
      setError('Please select an image for the item.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      if (imagePreview.length > 1048000) {
        throw new Error("Image is too large to store. Please try a smaller image.");
      }

      await addDoc(collection(db, 'marketItems'), {
        title,
        description,
        price: Number(price),
        category,
        type,
        sellerId: user.uid,
        sellerName: user.displayName || 'Anonymous',
        imageUrl: imagePreview,
        status: 'available',
        createdAt: serverTimestamp(),
      });
      
      setIsSellModalOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Painting');
      setType('Physical');
      setImagePreview('');
      fetchItems();
    } catch (err: any) {
      console.error('Sell item error:', err);
      setError(err.message || 'Failed to list item');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => 
    categoryFilter === 'All' || item.category === categoryFilter
  );

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
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">MARKETPLACE</span>
            </h1>
            <p className="text-gray-400 font-light max-w-xl">
              Buy and sell physical and digital art from creators worldwide.
            </p>
          </motion.div>

          {user && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsSellModalOpen(true)}
              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full text-sm tracking-widest uppercase hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <Plus className="w-4 h-4" /> Sell Artwork
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full mb-12 border-b border-white/10 pb-4 no-scrollbar">
          {['All', 'Painting', 'Sculpting', 'Digital', 'Photography', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                  ? 'bg-white text-black' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Marketplace Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-light">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-colors flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                    {item.type}
                  </div>
                  <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ${item.price}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Seller</span>
                      <Link to={`/profile/${item.sellerId}`} className="text-sm font-bold hover:text-amber-500 transition-colors">
                        {item.sellerName}
                      </Link>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black rounded-full text-xs font-bold tracking-widest uppercase transition-colors">
                      Buy
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Sell Item Modal */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSellModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setIsSellModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-display font-bold mb-8">Sell Artwork</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSellSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Artwork Image</label>
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
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Title</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                    placeholder="e.g. Sunset Boulevard"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Price (USD)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                    placeholder="e.g. 150.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none appearance-none"
                  >
                    {['Painting', 'Sculpting', 'Digital', 'Photography', 'Other'].map(cat => (
                      <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none appearance-none"
                  >
                    <option value="Physical" className="bg-zinc-900">Physical Asset</option>
                    <option value="Digital" className="bg-zinc-900">Digital Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none h-32 resize-none"
                  placeholder="Describe your artwork..."
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
                  'List Item for Sale'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
