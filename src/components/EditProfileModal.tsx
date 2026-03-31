import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, User } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

export default function EditProfileModal({ isOpen, onClose, userProfile }: EditProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile && isOpen) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setPhotoPreview(userProfile.photoURL || '');
      setCoverPreview(userProfile.coverURL || '');
      setError('');
    }
  }, [userProfile, isOpen]);

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      
      setError('');
      try {
        const maxWidth = type === 'photo' ? 400 : 1920;
        const maxHeight = type === 'photo' ? 400 : 1080;
        const resizedDataUrl = await resizeImage(file, maxWidth, maxHeight);
        
        if (type === 'photo') {
          setPhotoPreview(resizedDataUrl);
        } else {
          setCoverPreview(resizedDataUrl);
        }
      } catch (err) {
        console.error("Error resizing image:", err);
        setError("Failed to process image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      if (photoPreview.length > 1048000 || coverPreview.length > 1048000) {
        throw new Error("One of the images is too large to store. Please try a smaller image.");
      }

      const updates: any = {
        displayName,
        bio,
      };

      if (photoPreview) updates.photoURL = photoPreview;
      if (coverPreview) updates.coverURL = coverPreview;

      await updateDoc(doc(db, 'users', user.uid), updates);
      
      onClose();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl glass-panel rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Edit Profile</h2>
                <p className="text-sm text-gray-400 font-light">Customize how you appear to others.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Cover Photo */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Cover Photo</label>
                <div 
                  className="relative h-32 border-2 border-dashed border-white/20 rounded-2xl text-center hover:border-amber-500/50 transition-colors cursor-pointer overflow-hidden group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={coverInputRef}
                    onChange={(e) => handleImageChange(e, 'cover')}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {coverPreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Change Cover
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      <p className="text-xs text-gray-500">Click to upload cover photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Profile Picture</label>
                <div className="flex items-center gap-6">
                  <div 
                    className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors cursor-pointer overflow-hidden group flex-shrink-0"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={photoInputRef}
                      onChange={(e) => handleImageChange(e, 'photo')}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {photoPreview ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-white/5">
                        <User className="w-8 h-8 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 font-light">
                    <p>Recommended size: 400x400px.</p>
                    <p>Max file size: 10MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Display Name</label>
                <input 
                  required
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors h-28 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
