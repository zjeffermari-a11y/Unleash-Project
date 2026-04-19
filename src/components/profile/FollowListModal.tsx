import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowListModal({ isOpen, onClose, userId, type }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'follows'),
          where(type === 'followers' ? 'followingId' : 'followerId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const userIds = snapshot.docs.map(docSnap => 
          type === 'followers' ? docSnap.data().followerId : docSnap.data().followingId
        );

        if (userIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch user profiles
        const userPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
        const userDocs = await Promise.all(userPromises);
        
        const fetchedUsers = userDocs
          .filter(d => d.exists())
          .map(d => ({ id: d.id, ...d.data() }));

        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching follow list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full shadow-2xl relative max-h-[80vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-display font-bold text-foreground mb-4 capitalize">
          {type}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
             <div className="flex justify-center items-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
             </div>
          ) : users.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">No {type} yet.</p>
          ) : (
            users.map(user => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground truncate">{user.displayName}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
