import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShowcaseCreate() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
      </Button>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Publish Showcase Piece</h1>
          <p className="text-muted-foreground text-lg">Upload your high-fidelity artwork to your professional portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:border-amber-500/50 transition-all cursor-pointer">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-amber-500" />
              </div>
              <p className="font-semibold text-lg">Drag and drop your masterpiece</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, WEBP (up to 50MB)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="Give your work a name..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Description</label>
                <textarea 
                  placeholder="Tell the story behind this piece..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all min-h-[150px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 border border-white/10 rounded-3xl space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Visibility & Tags
              </h3>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                   <select className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none">
                     <option>3D Modeling</option>
                     <option>UI/UX Design</option>
                     <option>2D Illustration</option>
                     <option>Code Snippet</option>
                   </select>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
                   <input type="text" placeholder="cyberpunk, futuristic..." className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" />
                 </div>
              </div>

              <Separator className="bg-white/5" />

              <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                Publish Piece
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
