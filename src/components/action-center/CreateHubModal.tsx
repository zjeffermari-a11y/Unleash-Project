import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paintbrush, Image as ImageIcon, PackageSearch, Plus, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function CreateHubModal() {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<'intent' | 'wip-compose'>('intent');
  const [composerText, setComposerText] = React.useState('');
  const navigate = useNavigate();

  const handleRoute = (route: string) => {
    setOpen(false);
    setTimeout(() => navigate(route), 150);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) setTimeout(() => setView('intent'), 300);
  };

  return (
    <>
      {/*
       * IMPORTANT: Do NOT use DialogTrigger + <Button> here.
       * @base-ui/react's DialogTrigger renders its own <button> element.
       * Wrapping shadcn <Button> (which also renders a <button>) inside it
       * creates nested <button> elements — an HTML violation that crashes React.
       * Solution: use a plain <button> as the trigger and control the Dialog via state.
       */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-black text-sm font-semibold px-4 h-9 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" />
        Create
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTitle className="sr-only">Create Content</DialogTitle>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xl p-0 bg-transparent border-none shadow-none overflow-visible"
        >
          <motion.div
            className="w-full bg-background/95 backdrop-blur-2xl border border-border rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              {view === 'intent' ? (
                <motion.div
                  key="intent"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  className="p-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                      What are we unleashing today?
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Select the type of content you want to publish.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* WIP — stays in modal */}
                    <div
                      onClick={() => setView('wip-compose')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setView('wip-compose')}
                      className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-accent/30 hover:bg-accent/60 hover:border-amber-500/50 cursor-pointer transition-all group hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Paintbrush className="text-amber-500 h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Work-in-Progress</h3>
                      <p className="text-xs text-muted-foreground">Share a quick update or sketch to the timeline.</p>
                    </div>

                    {/* Showcase — routes to dedicated dashboard */}
                    <div
                      onClick={() => handleRoute('/create/showcase')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleRoute('/create/showcase')}
                      className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-accent/30 hover:bg-accent/60 hover:border-blue-500/50 cursor-pointer transition-all group hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-blue-500 h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Showcase Piece</h3>
                      <p className="text-xs text-muted-foreground">Publish finished HD artwork to your portfolio.</p>
                    </div>

                    {/* Digital Product — routes to dedicated dashboard */}
                    <div
                      onClick={() => handleRoute('/create/product')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleRoute('/create/product')}
                      className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-accent/30 hover:bg-accent/60 hover:border-green-500/50 cursor-pointer transition-all group hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PackageSearch className="text-green-500 h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Digital Product</h3>
                      <p className="text-xs text-muted-foreground">List a 3D model, brush, or kit for sale.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="wip-compose"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                  className="p-6 flex flex-col min-h-[300px]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setView('intent')}
                      className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-lg font-display font-semibold">Post a Quick Update</h2>
                  </div>

                  <textarea
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder="What are you working on right now? (You can also drag images)"
                    className="flex-1 w-full bg-transparent border-none resize-none outline-none text-base text-foreground placeholder:text-muted-foreground/50 min-h-[150px]"
                    autoFocus
                  />

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <button
                      type="button"
                      className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Attach image"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <Button
                      disabled={!composerText.trim()}
                      onClick={() => { setOpen(false); setComposerText(''); }}
                      className="rounded-full bg-amber-500 text-black hover:bg-amber-600 font-bold px-6 transition-all disabled:opacity-40"
                    >
                      <Send className="mr-2 h-3.5 w-3.5" /> Post
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
