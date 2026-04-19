import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  commissionId?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: Record<string, number>;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all chats for the current user
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatData);
      setLoading(false);
    }, (err) => {
      console.warn('useChats: snapshot listener error —', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Find or create a chat between current user and another user
  const findOrCreateChat = async (otherUserId: string, commissionId?: string) => {
    if (!user) return null;

    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const snapshot = await getDocs(q);
    
    let existingChat = null;
    snapshot.forEach(doc => {
      const data = doc.data() as Chat;
      if (data.participants.includes(otherUserId)) {
        // If an existing context matches
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) return (existingChat as Chat).id;

    // Create new chat
    const newChatRef = doc(collection(db, 'chats'));
    await setDoc(newChatRef, {
      participants: [user.uid, otherUserId],
      ...(commissionId && { commissionId }),
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: {
        [user.uid]: 0,
        [otherUserId]: 0
      }
    });

    return newChatRef.id;
  };

  const sendMessage = async (chatId: string, text: string, imageUrl?: string) => {
    if (!user) return;

    // SECURITY (F-015): Validate imageUrl is from our Cloudinary account
    const sanitizedImageUrl = imageUrl && imageUrl.startsWith('https://res.cloudinary.com/')
      ? imageUrl
      : undefined;
    
    // Add to subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text,
      ...(sanitizedImageUrl && { imageUrl: sanitizedImageUrl }),
      createdAt: serverTimestamp()
    });

    // Update parent chat document
    const chatRef = doc(db, 'chats', chatId);
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const otherUserId = chat.participants.find(id => id !== user.uid) || '';
    const currentUnread = chat.unreadCount?.[otherUserId] || 0;

    await updateDoc(chatRef, {
      lastMessage: imageUrl ? 'Sent an image' : text,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${otherUserId}`]: currentUnread + 1
    });
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${user.uid}`]: 0
    });
  };

  return {
    chats,
    loading,
    findOrCreateChat,
    sendMessage,
    markAsRead
  };
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.warn('useMessages: snapshot listener error —', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading };
}
