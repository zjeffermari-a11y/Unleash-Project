import * as React from 'react';
import {
  Bell,
  Heart,
  UserPlus,
  Palette,
  CheckCircle,
  XCircle,
  PlayCircle,
  PackageCheck,
  Sparkles,
  BellOff,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/src/AuthContext';
import { useNotifications, type NotificationType } from '@/src/hooks/useNotifications';

// ── Icon / colour mapping per notification type ──────────────────────────────
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; iconBg: string }
> = {
  like: {
    icon: <Heart className="h-4 w-4 text-pink-500" />,
    iconBg: 'bg-pink-500/20 border-pink-500/30',
  },
  follow: {
    icon: <UserPlus className="h-4 w-4 text-blue-500" />,
    iconBg: 'bg-blue-500/20 border-blue-500/30',
  },
  commission_request: {
    icon: <Palette className="h-4 w-4 text-amber-500" />,
    iconBg: 'bg-amber-500/20 border-amber-500/30',
  },
  commission_accepted: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
  },
  commission_declined: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    iconBg: 'bg-red-500/20 border-red-500/30',
  },
  commission_in_progress: {
    icon: <PlayCircle className="h-4 w-4 text-blue-500" />,
    iconBg: 'bg-blue-500/20 border-blue-500/30',
  },
  commission_delivered: {
    icon: <PackageCheck className="h-4 w-4 text-purple-500" />,
    iconBg: 'bg-purple-500/20 border-purple-500/30',
  },
  commission_completed: {
    icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
  },
};

function getDefaultConfig() {
  return {
    icon: <Bell className="h-4 w-4 text-muted-foreground" />,
    iconBg: 'bg-muted border-border',
  };
}

/** Human-friendly relative timestamp */
function timeAgo(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts || typeof ts.toDate !== 'function') return '';
  const diff = Date.now() - ts.toDate().getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return ts.toDate().toLocaleDateString();
}

export function NotificationsPopover() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.uid);

  return (
    <Popover>
      <PopoverTrigger
        data-slot="notifications-trigger"
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse pointer-events-none" />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 border-border bg-popover backdrop-blur-2xl mt-2 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between">
          <h4 className="font-semibold text-sm tracking-tight">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 text-xs text-amber-500 font-bold">({unreadCount})</span>
            )}
          </h4>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-amber-500 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <Separator className="bg-border" />

        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <BellOff className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
              <p className="text-xs text-muted-foreground/60">
                Interactions like follows, likes, and commissions will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? getDefaultConfig();
              return (
                <React.Fragment key={n.id}>
                  {i > 0 && <Separator className="bg-border/50" />}
                  <NotifItem
                    icon={cfg.icon}
                    iconBg={cfg.iconBg}
                    isUnread={!n.read}
                    text={
                      <>
                        <span className="font-bold text-foreground">{n.actorName}</span>{' '}
                        {n.message.replace(n.actorName, '').replace(/^\s+/, '')}
                      </>
                    }
                    time={timeAgo(n.createdAt)}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                    }}
                  />
                </React.Fragment>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 bg-accent/50 text-center border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground">
              Showing latest {notifications.length} notifications
            </span>
          </div>
        )}
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
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  time: string;
  isUnread?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex gap-3 relative"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
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
