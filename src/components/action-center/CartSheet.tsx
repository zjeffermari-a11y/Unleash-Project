import * as React from 'react';
import { ShoppingBag, ChevronRight, X, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../AuthContext';
import { toast } from 'sonner';

export function CartSheet() {
  const [open, setOpen] = React.useState(false);
  const [checkingOut, setCheckingOut] = React.useState(false);

  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const checkout = useCartStore((s) => s.checkout);
  const itemCount = useCartStore((s) => s.itemCount)();
  const total = useCartStore((s) => s.total)();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to checkout.');
      return;
    }
    setCheckingOut(true);
    try {
      const orderId = await checkout(user);
      toast.success(`Order placed! (#${orderId.slice(0, 8)})`);
      setOpen(false);
    } catch (err: any) {
      console.error('[CartSheet] Checkout failed:', err);
      toast.error(err.message ?? 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      {/*
       * Plain button trigger — avoids nested <button> crash caused by
       * SheetTrigger (base-ui renders its own <button>) + Button component.
       */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-amber-500 text-[10px] text-black border-none pointer-events-none font-bold">
            {itemCount > 9 ? '9+' : itemCount}
          </Badge>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border p-0 flex flex-col bg-background/95 backdrop-blur-2xl"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-xl font-display tracking-tight flex items-center justify-between">
              Your Cart
              <span className="text-sm font-sans font-normal text-muted-foreground bg-accent px-2.5 py-1 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </SheetTitle>
          </SheetHeader>
          <Separator className="bg-border" />

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse the Marketplace and hit "Buy" to add items.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    image={item.imageUrl}
                    title={item.title}
                    seller={item.seller}
                    price={item.price}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>

              {/* Checkout Footer */}
              <div className="p-6 bg-accent/50 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold tracking-tight">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Checkout securely <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CartItem({
  image,
  title,
  seller,
  price,
  onRemove,
}: {
  image: string;
  title: string;
  seller: string;
  price: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="h-20 w-20 rounded-xl bg-accent border border-border overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">by {seller}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-sm text-amber-500">${price.toFixed(2)}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
            aria-label={`Remove ${title} from cart`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
