import * as React from 'react';
import { Bell, Heart, MessageSquare, Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export function NotificationsPopover() {
  const hasUnread = true;

  return (
    <Popover>
      {/*
       * PopoverTrigger from base-ui renders its own <button>.
       * Check if it supports render prop like DialogClose does.
       * If it still causes nesting, use controlled state like CartSheet.
       * For now, put the icon markup directly as children of PopoverTrigger
       * without wrapping it in a <Button> component.
       */}
      <PopoverTrigger
        data-slot="notifications-trigger"
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse pointer-events-none" />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 border-border bg-popover backdrop-blur-2xl mt-2 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between">
          <h4 className="font-semibold text-sm tracking-tight">Notifications</h4>
          <button
            type="button"
            className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-amber-500 transition-colors"
          >
            Mark all read
          </button>
        </div>
        <Separator className="bg-border" />

        <div className="max-h-[320px] overflow-y-auto">
          <NotifItem
            icon={<Heart className="h-4 w-4 text-pink-500" />}
            iconBg="bg-pink-500/20 border-pink-500/30"
            isUnread
            text={<><span className="font-bold text-foreground">Alex Morgan</span> loved your WIP "Cyberpunk Alleyway"</>}
            time="2m ago"
          />
          <Separator className="bg-border/50" />
          <NotifItem
            icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
            iconBg="bg-blue-500/20 border-blue-500/30"
            text={<><span className="font-bold text-foreground">Elena Rob</span> commented: "The lighting here is phenomenal!"</>}
            time="1h ago"
          />
          <Separator className="bg-border/50" />
          <NotifItem
            icon={<Star className="h-4 w-4 text-amber-500" />}
            iconBg="bg-amber-500/20 border-amber-500/30"
            text={<><span className="font-bold text-foreground">StudioX</span> purchased your "Neon City 3D Kitbash"</>}
            time="3h ago"
          />
        </div>

        <div className="p-3 bg-accent/50 text-center border-t border-border">
          <button
            type="button"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View all past activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotifItem({
  icon,
  iconBg,
  text,
  time,
  isUnread = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  time: string;
  isUnread?: boolean;
}) {
  return (
    <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex gap-3 relative">
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-md" />
      )}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{text}</p>
        <span className="text-xs text-muted-foreground block mt-1">{time}</span>
      </div>
    </div>
  );
}
