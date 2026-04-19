import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { sendNotification } from './useNotifications';

/**
 * useFollow — manages follow/unfollow between the current user and a target artist.
 *
 * Firestore shape:
 *   follows/{followerId}_{followingId}
 *     followerId:  string
 *     followingId: string
 *     createdAt:   timestamp
 *
 * Uses onSnapshot queries instead of getCountFromServer to avoid
 * RunAggregationQuery permission requirements.
 */
export function useFollow(targetUserId: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const followDocId = user && targetUserId ? `${user.uid}_${targetUserId}` : null;
  const followDocRef = followDocId ? doc(db, 'follows', followDocId) : null;

  // Real-time listener on this specific follow relationship
  useEffect(() => {
    if (!followDocRef) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      followDocRef,
      (snap) => {
        setIsFollowing(snap.exists());
        setLoading(false);
      },
      () => setLoading(false) // swallow permission errors
    );
    return () => unsub();
  }, [followDocId]);

  // Follower count for targetUserId (how many people follow them)
  useEffect(() => {
    if (!targetUserId) return;
    const q = query(collection(db, 'follows'), where('followingId', '==', targetUserId));
    const unsub = onSnapshot(
      q,
      (snap) => setFollowerCount(snap.size),
      () => {} // swallow permission errors
    );
    return () => unsub();
  }, [targetUserId]);

  // Following count for targetUserId (how many people they follow)
  useEffect(() => {
    if (!targetUserId) return;
    const q = query(collection(db, 'follows'), where('followerId', '==', targetUserId));
    const unsub = onSnapshot(
      q,
      (snap) => setFollowingCount(snap.size),
      () => {} // swallow permission errors
    );
    return () => unsub();
  }, [targetUserId]);

  const toggle = useCallback(async () => {
    if (!user || !followDocRef || toggling) return;
    setToggling(true);
    try {
      if (isFollowing) {
        await deleteDoc(followDocRef);
      } else {
        await setDoc(followDocRef, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp(),
        });
        // Notify the artist that someone followed them
        sendNotification({
          recipientId: targetUserId,
          actorId: user.uid,
          actorName: user.displayName || 'Someone',
          actorPhoto: user.photoURL || '',
          type: 'follow',
          title: 'New Follower',
          message: `${user.displayName || 'Someone'} started following you.`,
        });
      }
    } finally {
      setToggling(false);
    }
  }, [user, followDocRef, isFollowing, toggling, targetUserId]);

  return { isFollowing, followerCount, followingCount, loading, toggling, toggle };
}
