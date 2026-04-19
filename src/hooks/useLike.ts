import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { sendNotification } from './useNotifications';

/**
 * useLike — manages like/unlike for a single artwork.
 *
 * Firestore shape (subcollection):
 *   artworks/{artworkId}/likes/{userId}
 *     likedAt: timestamp
 *
 * Uses onSnapshot on the whole likes subcollection to count docs client-side.
 * This avoids RunAggregationQuery (getCountFromServer) which requires special
 * Firestore security rule permissions.
 */
export function useLike(artworkId: string, authorId?: string) {
  const { user } = useAuth();
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  const userLikeRef = user
    ? doc(db, 'artworks', artworkId, 'likes', user.uid)
    : null;

  // Real-time listener on the entire likes subcollection —
  // gives us count + hasLiked in one shot, no aggregation query needed.
  useEffect(() => {
    if (!artworkId) return;
    const likesRef = collection(db, 'artworks', artworkId, 'likes');
    const unsub = onSnapshot(
      query(likesRef),
      (snap) => {
        setLikeCount(snap.size);
        if (user) {
          setHasLiked(snap.docs.some((d) => d.id === user.uid));
        } else {
          setHasLiked(false);
        }
      },
      () => {} // silently swallow permission errors until Firestore rules are updated
    );
    return () => unsub();
  }, [artworkId, user?.uid]);

  const toggle = useCallback(async () => {
    if (!user || !userLikeRef || toggling) return;
    setToggling(true);
    // Optimistic update before the write resolves
    const wasLiked = hasLiked;
    setHasLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    try {
      if (wasLiked) {
        await deleteDoc(userLikeRef);
      } else {
        await setDoc(userLikeRef, { likedAt: serverTimestamp() });
        // Notify the artwork author that someone liked their work
        if (authorId) {
          sendNotification({
            recipientId: authorId,
            actorId: user.uid,
            actorName: user.displayName || 'Someone',
            actorPhoto: user.photoURL || '',
            type: 'like',
            title: 'New Like',
            message: `${user.displayName || 'Someone'} liked your artwork.`,
            targetId: artworkId,
          });
        }
      }
    } catch {
      // Rollback optimistic update on error
      setHasLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setToggling(false);
    }
  }, [user, userLikeRef, hasLiked, toggling, authorId, artworkId]);

  return { hasLiked, likeCount, toggling, toggle };
}
