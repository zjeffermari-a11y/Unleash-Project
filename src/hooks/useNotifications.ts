import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Supported notification types — each maps to a specific icon/color in the UI.
 */
export type NotificationType =
  | 'like'
  | 'follow'
  | 'commission_request'
  | 'commission_accepted'
  | 'commission_declined'
  | 'commission_in_progress'
  | 'commission_delivered'
  | 'commission_completed';

/**
 * Notification document shape stored in Firestore.
 *
 * Collection: notifications
 */
export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorPhoto: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Optional deep-link target (e.g. artwork id, profile id) */
  targetId?: string;
  read: boolean;
  createdAt: Timestamp;
}

// ─── Listener Hook ───────────────────────────────────────────────────────────

/**
 * useNotifications — real-time listener for a user's notification inbox.
 *
 * @param userId  The authenticated user's UID
 * @returns       notifications list, unreadCount, and mutation helpers
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(docs);
        setLoading(false);
      },
      () => setLoading(false), // swallow permission errors
    );

    return () => unsub();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  }, [notifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

// ─── Dispatch Helper ─────────────────────────────────────────────────────────

/**
 * sendNotification — fire-and-forget helper used by action hooks.
 *
 * Writes a document to the `notifications` collection.
 * Silently catches errors so the primary action (like/follow/commission)
 * is never blocked by a notification failure.
 */
export async function sendNotification(payload: {
  recipientId: string;
  actorId: string;
  actorName: string;
  actorPhoto: string;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string;
}) {
  // Never notify yourself
  if (payload.recipientId === payload.actorId) return;

  try {
    await addDoc(collection(db, 'notifications'), {
      ...payload,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Notification dispatch is best-effort — never block the caller
  }
}
