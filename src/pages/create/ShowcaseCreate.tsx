import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Sparkles, Box, FileImage, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ShowcaseCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Digital');
  const [tags, setTags] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary Free Tier limit)
      if (file.size > MAX_SIZE) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }
      setGlbFile(file);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('You must be signed in to publish.');
      return;
    }
    if (!imageFile) {
      toast.error('A thumbnail image is required.');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    setPublishing(true);
    try {
      const uploadToCloudinary = async (file: File, resourceType: 'image' | 'raw' = 'auto' as any) => {
        // SECURITY (F-014): Validate file type before uploading
        const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const ALLOWED_RAW_EXTENSIONS = ['.glb', '.gltf'];
        
        if (resourceType === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Invalid image type. Allowed: JPG, PNG, WEBP, GIF.');
        }
        if (resourceType === 'raw') {
          const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
          if (!ALLOWED_RAW_EXTENSIONS.includes(ext)) {
            throw new Error('Invalid file type. Allowed: .glb, .gltf.');
          }
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unleash_uploads');
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/dmmrnsn6n/${resourceType}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Cloudinary Raw Error:', errData);
          throw new Error(errData?.error?.message || 'Failed to upload file to Cloudinary');
        }
        
        const data = await res.json();

        // SECURITY: Validate returned URL is from Cloudinary
        if (!data.secure_url || !data.secure_url.startsWith('https://res.cloudinary.com/')) {
          throw new Error('Upload returned an invalid URL.');
        }

        return data.secure_url;
      };

      // 1. Upload thumbnail
      const imageUrl = await uploadToCloudinary(imageFile, 'image');

      // 2. Upload GLB if present
      let glbUrl = null;
      if (glbFile) {
        glbUrl = await uploadToCloudinary(glbFile, 'raw');
      }

      // 3. Save to Firestore
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const docRef = await addDoc(collection(db, 'artworks'), {
        title,
        description,
        category,
        tags: tagArray,
        imageUrl,
        ...(glbUrl && { glbUrl }),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || '',
        createdAt: serverTimestamp(),
        viewCount: 0,
        privacy: 'public'
      });

      toast.success('Showcase published successfully!');
      navigate(`/artwork/${docRef.id}`);
    } catch (error: any) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish: ' + error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl font-sans">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Publish Showcase Piece</h1>
          <p className="text-muted-foreground text-lg">Upload your high-fidelity artwork to your professional portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Image Upload Area */}
            <div 
              onClick={() => imageInputRef.current?.click()}
              className="aspect-video rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center group hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden"
            >
              {imageFile ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="bg-black/60 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-md flex items-center gap-2">
                       <FileImage className="w-4 h-4 text-amber-500" /> {imageFile.name}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileImage className="h-8 w-8 text-amber-500" />
                  </div>
                  <p className="font-semibold text-lg">Upload 2D Thumbnail / Image</p>
                  <p className="text-sm text-muted-foreground mt-1">Required: PNG, JPG, WEBP (up to 50MB)</p>
                </>
              )}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* 3D Model Upload Area */}
            <div 
              onClick={() => glbInputRef.current?.click()}
              className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4 ${glbFile ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
            >
              <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center shrink-0">
                <Box className={`h-6 w-6 ${glbFile ? 'text-amber-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{glbFile ? glbFile.name : 'Include 3D Model (Optional)'}</p>
                <p className="text-sm text-muted-foreground mt-1 tracking-tight">{glbFile ? 'Ready to upload' : 'Upload an interactive .glb or .gltf file for physical art.'}</p>
              </div>
              <input type="file" ref={glbInputRef} className="hidden" accept=".glb,.gltf" onChange={handleGlbChange} />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your work a name..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell the story behind this piece..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-colors min-h-[150px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Visibility & Tags
              </h3>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                   <select 
                     value={category}
                     onChange={e => setCategory(e.target.value)}
                     className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                   >
                     <option>Painting</option>
                     <option>Sculpting</option>
                     <option>Digital</option>
                     <option>Photography</option>
                     <option>Other</option>
                   </select>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
                   <input 
                     type="text" 
                     value={tags}
                     onChange={e => setTags(e.target.value)}
                     placeholder="cyberpunk, futuristic, 3d..." 
                     className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors" 
                   />
                   <p className="text-[10px] text-muted-foreground ml-1">Comma separated</p>
                 </div>
              </div>

              <Separator className="bg-border" />

              <Button 
                onClick={handlePublish}
                disabled={publishing || !imageFile || !title}
                className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold h-14 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
              >
                {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Piece'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full ${className}`} />;
}
