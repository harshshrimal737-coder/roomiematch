import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

let socket;

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Connect socket
    socket = io(import.meta.env.VITE_API_URL, { path: '/socket.io' });
    socket.emit('join', user._id);

    socket.on('receiveMessage', (msg) => {
      if (msg.senderId === userId) {
        setMessages(prev => [...prev, { ...msg, sender: userId, content: msg.content, createdAt: msg.createdAt }]);
      }
    });

    return () => socket.disconnect();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, userRes] = await Promise.all([
          api.get(`/api/messages/${userId}`),
          api.get(`/api/users/explore`).then(r => r.data.find(u => u._id === userId)),
        ]);
        setMessages(msgRes.data);
        // Try to get the user info
        const { data: allUsers } = await api.get('/api/users/explore');
        setOtherUser(allUsers.find(u => u._id === userId));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');

    const newMsg = { sender: user._id, receiver: userId, content, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);

    socket.emit('sendMessage', { senderId: user._id, receiverId: userId, content });

    try {
      await api.post('/api/messages', { receiverId: userId, content });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatHeader}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div style={styles.avatar}>{otherUser?.name?.charAt(0) || '?'}</div>
        <div>
          <div style={styles.userName}>{otherUser?.name || 'User'}</div>
          <div style={styles.userSub}>{otherUser?.college || otherUser?.city || ''}</div>
        </div>
      </div>

      <div style={styles.messages}>
        {loading && <div style={styles.center}>Loading messages...</div>}
        {!loading && messages.length === 0 && (
          <div style={styles.center}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p>Say hello to {otherUser?.name || 'your potential roommate'}!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender === user._id || msg.sender?._id === user._id;
          return (
            <div key={i} style={{ ...styles.msgWrap, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.bubble, background: isMine ? 'linear-gradient(135deg, #e94560, #c62a47)' : '#16213e', color: 'white', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                {msg.content}
                <div style={styles.time}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button style={styles.sendBtn} onClick={sendMessage}>Send ➤</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f1a' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', background: '#16213e', borderBottom: '1px solid #0f3460' },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', padding: '4px 8px' },
  avatar: { width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #e94560, #c62a47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white' },
  userName: { fontWeight: 600, color: '#f1f5f9', fontSize: 15 },
  userSub: { color: '#64748b', fontSize: 12 },
  messages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 },
  center: { textAlign: 'center', color: '#64748b', margin: 'auto', padding: 20 },
  msgWrap: { display: 'flex' },
  bubble: { maxWidth: '70%', padding: '10px 16px', fontSize: 14, lineHeight: 1.5 },
  time: { fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' },
  inputRow: { display: 'flex', gap: 10, padding: '16px 24px', background: '#16213e', borderTop: '1px solid #0f3460' },
  input: { flex: 1, background: '#0f0f1a', border: '1px solid #0f3460', borderRadius: 10, color: '#e2e8f0', padding: '12px 16px', fontSize: 14, outline: 'none' },
  sendBtn: { background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 10, color: 'white', padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};