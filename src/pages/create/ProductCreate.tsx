import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Sparkles, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCreate() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">List Digital Product</h1>
          <p className="text-muted-foreground text-lg">Monetize your creative assets and reach global buyers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
             <div className="p-8 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:border-green-500/50 transition-all cursor-pointer">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-semibold text-lg">Upload Asset Package</p>
              <p className="text-sm text-muted-foreground mt-1">Supports ZIP, RAR, 7Z (up to 2GB)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ultra Realistic Stone Textures..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-6 py-4 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">License Type</label>
                  <select className="w-full h-[58px] bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-green-500 transition-all">
                    <option>Standard Commercial</option>
                    <option>Personal Use Only</option>
                    <option>Extended Studio</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 border border-white/10 rounded-3xl space-y-6 bg-background/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" /> Seller Checklist
              </h3>
              
              <ul className="space-y-3">
                 <li className="text-xs text-muted-foreground flex gap-2">
                    <div className="h-4 w-4 rounded bg-green-500/20 flex items-center justify-center shrink-0">✓</div>
                    High-res preview images included
                 </li>
                 <li className="text-xs text-muted-foreground flex gap-2">
                    <div className="h-4 w-4 rounded bg-green-500/20 flex items-center justify-center shrink-0">✓</div>
                    Documentation/Readme file
                 </li>
                 <li className="text-xs text-muted-foreground flex gap-2">
                    <div className="h-4 w-4 rounded bg-green-500/20 flex items-center justify-center shrink-0">✓</div>
                    Correct file hierarchy inside ZIP
                 </li>
              </ul>

              <Separator className="bg-white/5" />

              <Button className="w-full rounded-full bg-green-500 hover:bg-green-600 text-black font-bold h-12 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                List Product
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
