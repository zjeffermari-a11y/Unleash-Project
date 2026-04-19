import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useChats, useMessages } from '../hooks/useChats';
import { Send, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialChatId = searchParams.get('chat');
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId);
  
  const { chats, loading: chatsLoading, sendMessage, markAsRead } = useChats();
  const { messages, loading: messagesLoading } = useMessages(activeChatId);

  const [textInput, setTextInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, { displayName: string; photoURL: string }>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark chat as read when opening
  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId);
    }
  }, [activeChatId, messages]);

  // Fetch missing participant's user info
  useEffect(() => {
    if (!user || !chats.length) return;
    
    const fetchUsers = async () => {
      const neededIds = new Set<string>();
      chats.forEach(chat => {
        chat.participants.forEach(pId => {
          if (pId !== user.uid && !userCache[pId]) {
            neededIds.add(pId);
          }
        });
      });

      if (neededIds.size === 0) return;

      const newCache = { ...userCache };
      for (const pId of Array.from(neededIds)) {
        try {
          const userDoc = await getDoc(doc(db, 'users', pId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            newCache[pId] = { displayName: data.displayName || 'Unknown User', photoURL: data.photoURL || '' };
          } else {
            newCache[pId] = { displayName: 'Unknown User', photoURL: '' };
          }
        } catch (e) {
          console.error('Failed to fetch user', pId, e);
        }
      }
      setUserCache(newCache);
    };

    fetchUsers();
  }, [chats, user, userCache]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeChatId) return;
    try {
      await sendMessage(activeChatId, textInput.trim());
      setTextInput('');
    } catch (e: any) {
      toast.error('Failed to send message: ' + e.message);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeChatId) return;
    const file = e.target.files[0];
    
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 10MB');
      return;
    }

    // SECURITY (F-014/F-015): Validate file type
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Allowed: JPG, PNG, WEBP, GIF.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unleash_uploads');
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/dmmrnsn6n/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Cloudinary upload failed');
      const data = await res.json();

      // SECURITY: Validate returned URL is from Cloudinary
      if (!data.secure_url || !data.secure_url.startsWith('https://res.cloudinary.com/')) {
        throw new Error('Upload returned an invalid URL.');
      }
      
      await sendMessage(activeChatId, '', data.secure_url);
    } catch (error: any) {
      toast.error('Failed to send image: ' + error.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <h2 className="text-xl text-muted-foreground">Please sign in to access messages.</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] mt-[80px]">
      {/* ── Left Sidebar: Chat List ────────────────────────────────────────── */}
      <div className={`w-full md:w-80 border-r border-border bg-background flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-display font-bold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">Manage your communications.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full p-4 space-y-2">
          {chatsLoading ? (
            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : chats.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground mt-10">No active conversations yet.</p>
          ) : (
            chats.map(chat => {
              const otherId = chat.participants.find(id => id !== user.uid)!;
              const otherUser = userCache[otherId];
              const isActive = activeChatId === chat.id;
              const unread = chat.unreadCount?.[user.uid] || 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isActive ? 'bg-amber-500/10 border border-amber-500/50' : 'bg-transparent border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 shrink-0">
                    {otherUser?.photoURL ? (
                      <img src={otherUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-foreground truncate">{otherUser?.displayName || 'Loading...'}</p>
                      {unread > 0 && <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>}
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {chat.lastMessage || 'New Conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Active Chat ────────────────────────────────────────── */}
      <div className={`flex-1 bg-card flex flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {!activeChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-amber-500/50" />
            </div>
            <h2 className="text-xl font-bold font-display text-white mb-2">Select a Conversation</h2>
            <p className="text-sm">Choose a chat from your client portal to begin messaging securely.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background flex items-center gap-4">
              <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {chats.find(c => c.id === activeChatId) && (() => {
                const chat = chats.find(c => c.id === activeChatId)!;
                const otherId = chat.participants.find(id => id !== user.uid)!;
                const otherUser = userCache[otherId];
                return (
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 shrink-0">
                      {otherUser?.photoURL ? (
                        <img src={otherUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{otherUser?.displayName || 'Loading...'}</h3>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.uid;
                const showAvatar = !isMe && (i === 0 || messages[i-1].senderId !== msg.senderId);
                const otherUser = userCache[msg.senderId];

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start_ gap-2'} items-end w-full max-w-full`}>
                    {!isMe && (
                       <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto ml-1 mr-2 opacity-90">
                         {showAvatar && otherUser?.photoURL ? (
                           <img src={otherUser.photoURL} className="w-full h-full object-cover" />
                         ) : showAvatar ? (
                           <div className="w-full h-full bg-white/10" />
                         ) : null}
                       </div>
                    )}
                    
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-amber-500 text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none border border-white/5'}`}>
                        {msg.imageUrl && (
                          <div className="mb-2 max-w-[300px] overflow-hidden rounded-xl">
                            {/* Fetch with cloudinary transform to save bandwidth */}
                            <a href={msg.imageUrl} target="_blank" rel="noreferrer">
                               <img src={msg.imageUrl.replace('/upload/', '/upload/w_400,c_scale/')} alt="Uploaded attachment" className="w-full object-cover" loading="lazy" />
                            </a>
                          </div>
                        )}
                        {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                        {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto w-full">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-3 text-muted-foreground hover:text-amber-500 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  hidden 
                />
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || uploadingImage}
                  className="p-3 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
