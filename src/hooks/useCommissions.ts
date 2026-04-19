import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { sendNotification } from './useNotifications';

/**
 * Commission document shape stored in Firestore.
 *
 * Firestore collection: commissions
 *
 * Status flow (V1 — no counter-offers):
 *   pending  →  accepted  →  in_progress  →  delivered  →  completed
 *   pending  →  declined
 *   pending  →  cancelled  (buyer withdraws)
 */
export interface Commission {
  id: string;
  buyerId: string;
  buyerName: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  budget: number;
  deadline: Timestamp | null;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  referenceImages: string[];
  deliverables: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * useCommissions — real-time listener for commissions related to a user.
 *
 * @param userId   - The profile user whose commissions we want
 * @param role     - 'artist' shows commissions sent TO this user;
 *                   'buyer'  shows commissions sent BY this user
 */
export function useCommissions(userId: string, role: 'artist' | 'buyer') {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCommissions([]);
      setLoading(false);
      return;
    }

    const field = role === 'artist' ? 'artistId' : 'buyerId';
    const q = query(
      collection(db, 'commissions'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Commission));
        setCommissions(docs);
        setLoading(false);
      },
      () => setLoading(false), // swallow permission errors
    );

    return () => unsub();
  }, [userId, role]);

  return { commissions, loading };
}

/**
 * useCreateCommission — returns a function to submit a new commission request.
 */
export function useCreateCommission() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (data: {
      artistId: string;
      artistName: string;
      title: string;
      description: string;
      budget: number;
      deadline: Date | null;
      referenceImages: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      setSubmitting(true);
      try {
        await addDoc(collection(db, 'commissions'), {
          buyerId: user.uid,
          buyerName: user.displayName || 'Anonymous',
          artistId: data.artistId,
          artistName: data.artistName,
          title: data.title,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
          status: 'pending',
          referenceImages: data.referenceImages,
          deliverables: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        // Notify the artist about the new commission request
        sendNotification({
          recipientId: data.artistId,
          actorId: user.uid,
          actorName: user.displayName || 'Someone',
          actorPhoto: user.photoURL || '',
          type: 'commission_request',
          title: 'New Commission Request',
          message: `${user.displayName || 'Someone'} sent you a commission request: "${data.title}"`,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [user],
  );

  return { create, submitting };
}

/**
 * useUpdateCommissionStatus — lets artists accept/decline/advance commissions.
 */
export function useUpdateCommissionStatus() {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateStatus = useCallback(
    async (
      commissionId: string,
      newStatus: Commission['status'],
      /** Pass the other party's info so we can notify them */
      notifyTarget?: { recipientId: string; commissionTitle?: string },
    ) => {
      if (!user) throw new Error('Not authenticated');
      setUpdating(true);
      try {
        await updateDoc(doc(db, 'commissions', commissionId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        // Notify the other party about the status change
        if (notifyTarget?.recipientId) {
          const statusLabels: Record<string, string> = {
            accepted: 'accepted',
            declined: 'declined',
            in_progress: 'started working on',
            delivered: 'delivered',
            completed: 'marked as complete',
          };
          const label = statusLabels[newStatus] || newStatus;
          sendNotification({
            recipientId: notifyTarget.recipientId,
            actorId: user.uid,
            actorName: user.displayName || 'Someone',
            actorPhoto: user.photoURL || '',
            type: `commission_${newStatus}` as any,
            title: 'Commission Update',
            message: `${user.displayName || 'Someone'} ${label} your commission${notifyTarget.commissionTitle ? `: "${notifyTarget.commissionTitle}"` : ''}.`,
          });
        }
      } finally {
        setUpdating(false);
      }
    },
    [user],
  );

  return { updateStatus, updating };
}
