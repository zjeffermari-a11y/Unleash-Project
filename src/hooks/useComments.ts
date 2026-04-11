import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  body: string;
  createdAt: any;
}

/**
 * useComments — real-time comment feed for an artwork.
 *
 * Firestore shape:
 *   artworks/{artworkId}/comments/{commentId}
 *     authorId, authorName, authorPhoto, body, createdAt
 */
export function useComments(artworkId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!artworkId) return;
    const q = query(
      collection(db, 'artworks', artworkId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) }))
      );
      setLoading(false);
    });
    return () => unsub();
  }, [artworkId]);

  const addComment = useCallback(
    async (body: string) => {
      if (!user || !body.trim() || submitting) return;
      setSubmitting(true);
      try {
        await addDoc(collection(db, 'artworks', artworkId, 'comments'), {
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          authorPhoto:
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${user.displayName}&background=random`,
          body: body.trim(),
          createdAt: serverTimestamp(),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [user, artworkId, submitting]
  );

  return { comments, loading, submitting, addComment };
}
