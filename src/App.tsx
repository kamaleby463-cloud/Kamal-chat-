import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider } from './lib/firebase';
import { cn } from './lib/utils';
import { 
  Lock, 
  Mail, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Search, 
  Send, 
  Mic, 
  Video, 
  Phone, 
  User as UserIcon,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  Check,
  X,
  Sparkles,
  MessageSquare,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { geminiService } from './lib/gemini';
import Peer from 'peerjs';

// --- Types ---
interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  bio?: string;
  createdAt: any;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: any;
}

interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
}

// --- Components ---

const MasterKeyScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Kamalww2') {
      onUnlock();
    } else {
      setError('كلمة السر غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/10 rounded-full">
            <Lock className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">بوابة الحماية</h1>
        <p className="text-neutral-400 text-center mb-8">يرجى إدخال مفتاح الدخول للمتابعة</p>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
          >
            دخول
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLogin ? 'دخول' : 'تسجيل'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral-900 text-neutral-500">أو</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-neutral-100 text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          متابعة باستخدام جوجل
        </button>

        <p className="text-neutral-400 text-center mt-6 text-sm">
          {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-500 hover:underline font-medium"
          >
            {isLogin ? 'سجل الآن' : 'سجل دخولك'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete }: { user: FirebaseUser, onComplete: () => void }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email: user.email,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio,
        createdAt: serverTimestamp()
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-2">إكمال الملف الشخصي</h2>
        <p className="text-neutral-400 text-center mb-8">أخبر أصدقاءك من أنت</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                className="w-24 h-24 rounded-full border-4 border-emerald-500/20"
                alt="Avatar"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">الاسم المستعار</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-400">نبذة قصيرة</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ChatApp = ({ userProfile }: { userProfile: UserProfile }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [peerId, setPeerId] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize PeerJS
  useEffect(() => {
    const peer = new Peer(userProfile.uid);
    peerRef.current = peer;
    
    peer.on('open', (id) => setPeerId(id));
    
    peer.on('call', (call) => {
      if (window.confirm('مكالمة واردة، هل تريد الرد؟')) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
          setIsCalling(true);
        });
      }
    });

    return () => peer.destroy();
  }, [userProfile.uid]);

  // Fetch Friends
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users', userProfile.uid, 'friends'), async (snapshot) => {
      const friendList: Friend[] = [];
      for (const d of snapshot.docs) {
        const friendDoc = await getDoc(doc(db, 'users', d.id));
        if (friendDoc.exists()) {
          friendList.push(friendDoc.data() as Friend);
        }
      }
      setFriends(friendList);
    });
    return unsub;
  }, [userProfile.uid]);

  // Fetch Messages
  useEffect(() => {
    if (!selectedFriend) return;
    
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [userProfile.uid, selectedFriend.uid]),
      where('receiverId', 'in', [userProfile.uid, selectedFriend.uid]),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return unsub;
  }, [selectedFriend, userProfile.uid]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const q = query(
      collection(db, 'users'),
      where('displayName', '>=', searchQuery),
      where('displayName', '<=', searchQuery + '\uf8ff'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    setSearchResults(snapshot.docs.map(d => d.data() as Friend).filter(u => u.uid !== userProfile.uid));
    setIsSearching(false);
  };

  const addFriend = async (friend: Friend) => {
    await setDoc(doc(db, 'users', userProfile.uid, 'friends', friend.uid), { addedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', friend.uid, 'friends', userProfile.uid), { addedAt: serverTimestamp() });
    setSearchQuery('');
    setSearchResults([]);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    const msg = newMessage;
    setNewMessage('');
    setAiSuggestions([]);

    await addDoc(collection(db, 'messages'), {
      senderId: userProfile.uid,
      receiverId: selectedFriend.uid,
      text: msg,
      createdAt: serverTimestamp()
    });
  };

  const startCall = () => {
    if (!selectedFriend) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const call = peerRef.current?.call(selectedFriend.uid, stream);
      call?.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });
      setIsCalling(true);
    });
  };

  const getAiSuggestions = async (msg: string) => {
    const suggestions = await geminiService.suggestReply(msg);
    setAiSuggestions(suggestions);
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 border-l border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={userProfile.photoURL} className="w-10 h-10 rounded-full border border-emerald-500/20" alt="Me" />
            <span className="font-semibold">{userProfile.displayName}</span>
          </div>
          <button onClick={() => signOut(auth)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="بحث عن أصدقاء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-500 uppercase px-2">نتائج البحث</p>
              {searchResults.map(u => (
                <div key={u.uid} className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={u.photoURL} className="w-10 h-10 rounded-full" alt={u.displayName} />
                    <span className="text-sm font-medium">{u.displayName}</span>
                  </div>
                  <button onClick={() => addFriend(u)} className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-500 uppercase px-2">المحادثات</p>
            {friends.map(f => (
              <button
                key={f.uid}
                onClick={() => setSelectedFriend(f)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  selectedFriend?.uid === f.uid ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "hover:bg-neutral-800"
                )}
              >
                <img src={f.photoURL} className="w-12 h-12 rounded-full" alt={f.displayName} />
                <div className="text-right">
                  <p className="font-semibold text-sm">{f.displayName}</p>
                  <p className="text-xs opacity-60">انقر لبدء الدردشة</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-500 font-medium">Developed by Kamal</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-950 relative">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedFriend.photoURL} className="w-10 h-10 rounded-full" alt={selectedFriend.displayName} />
                <div>
                  <h3 className="font-bold">{selectedFriend.displayName}</h3>
                  <p className="text-xs text-emerald-500">متصل الآن</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={startCall} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                  <Phone className="w-5 h-5" />
                </button>
                <button onClick={startCall} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    msg.senderId === userProfile.uid ? "ml-auto items-start" : "mr-auto items-end"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm shadow-sm",
                      msg.senderId === userProfile.uid 
                        ? "bg-emerald-600 text-white rounded-tl-none" 
                        : "bg-neutral-800 text-neutral-200 rounded-tr-none"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1">
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                  </span>
                  {msg.senderId !== userProfile.uid && messages[messages.length - 1].id === msg.id && (
                    <button 
                      onClick={() => getAiSuggestions(msg.text)}
                      className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400"
                    >
                      <Sparkles className="w-3 h-3" />
                      اقتراح رد ذكي
                    </button>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* AI Suggestions */}
            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar"
                >
                  {aiSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setNewMessage(s); setAiSuggestions([]); }}
                      className="whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                  <button onClick={() => setAiSuggestions([])} className="p-1.5 text-neutral-500"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-neutral-900/50 border-t border-neutral-800">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <button type="button" className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                  <Plus className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button type="button" className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                  <Mic className="w-6 h-6" />
                </button>
                <button
                  type="submit"
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">مرحباً بك في Kamal Chat</h2>
            <p className="text-neutral-400 max-w-sm">اختر صديقاً من القائمة الجانبية لبدء المحادثة أو ابحث عن أصدقاء جدد</p>
            
            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <Users className="w-6 h-6 text-emerald-500 mb-2" />
                <h4 className="font-bold text-sm">تواصل فوري</h4>
                <p className="text-xs text-neutral-500">محادثات سريعة وآمنة</p>
              </div>
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                <Video className="w-6 h-6 text-emerald-500 mb-2" />
                <h4 className="font-bold text-sm">مكالمات فيديو</h4>
                <p className="text-xs text-neutral-500">جودة عالية واستقرار</p>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <p className="text-xs text-neutral-600 font-medium">Developed by Kamal</p>
            </div>
          </div>
        )}

        {/* Video Call Overlay */}
        <AnimatePresence>
          {isCalling && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black flex flex-col"
            >
              <div className="flex-1 relative">
                <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 w-48 h-32 border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xl">
                  <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-8 bg-neutral-900 flex justify-center gap-6">
                <button className="p-4 bg-neutral-800 rounded-full hover:bg-neutral-700">
                  <Mic className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => {
                    setIsCalling(false);
                    if (localVideoRef.current?.srcObject) {
                      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                    }
                  }}
                  className="p-4 bg-red-600 rounded-full hover:bg-red-500"
                >
                  <X className="w-6 h-6" />
                </button>
                <button className="p-4 bg-neutral-800 rounded-full hover:bg-neutral-700">
                  <Video className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (!isUnlocked) {
    return <MasterKeyScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!userProfile) {
    return <ProfileSetup user={user} onComplete={() => window.location.reload()} />;
  }

  return <ChatApp userProfile={userProfile} />;
}
