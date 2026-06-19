import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState([]);
  const [matchAlert, setMatchAlert] = useState(null);
  const [cityFilter, setCityFilter] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async (city = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users/explore${city ? `?city=${city}` : ''}`);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLike = async (userId) => {
    try {
      const { data } = await axios.post(`/api/users/like/${userId}`);
      setLikedIds(prev => [...prev, userId]);
      if (data.isMatch) {
        const matchedUser = users.find(u => u._id === userId);
        setMatchAlert(matchedUser?.name || 'Someone');
        setTimeout(() => setMatchAlert(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scoreColor = (s) => s >= 80 ? '#4ade80' : s >= 60 ? '#facc15' : '#f87171';

  return (
    <div style={styles.container}>
      {matchAlert && (
        <div style={styles.matchBanner}>
          🎉 It's a Match with {matchAlert}! Go to Matches to chat!
        </div>
      )}

      <div style={styles.filterRow}>
        <input
          style={styles.filterInput}
          placeholder="🔍 Filter by city..."
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers(cityFilter)}
        />
        <button style={styles.filterBtn} onClick={() => fetchUsers(cityFilter)}>Search</button>
        <button style={styles.filterBtn} onClick={() => { setCityFilter(''); fetchUsers(''); }}>Clear</button>
      </div>

      {loading ? (
        <div style={styles.center}>Loading roommates...</div>
      ) : users.length === 0 ? (
        <div style={styles.center}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <p>No roommates found in this city yet.</p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>Try a different city or clear the filter.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {users.map(user => (
            <div key={user._id} style={styles.card}>
              <div style={styles.avatarWrap}>
                <div style={styles.avatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.compatibilityScore > 0 && (
                  <div style={{ ...styles.scoreBadge, background: scoreColor(user.compatibilityScore) }}>
                    {user.compatibilityScore}%
                  </div>
                )}
              </div>

              <h3 style={styles.name}>{user.name}, {user.age}</h3>
              <p style={styles.college}>{user.college || 'Student'}</p>
              <p style={styles.city}>📍 {user.city}</p>
              {user.bio && <p style={styles.bio}>{user.bio.slice(0, 80)}{user.bio.length > 80 ? '...' : ''}</p>}

              <div style={styles.tags}>
                {user.questionnaire?.sleepTime && <span style={styles.tag}>🌙 {user.questionnaire.sleepTime}</span>}
                {user.questionnaire?.personality && <span style={styles.tag}>🧠 {user.questionnaire.personality}</span>}
                {user.questionnaire?.budget && <span style={styles.tag}>💰 {user.questionnaire.budget}</span>}
              </div>

              <div style={styles.btnRow}>
                <button
                  style={{ ...styles.likeBtn, opacity: likedIds.includes(user._id) ? 0.5 : 1 }}
                  onClick={() => !likedIds.includes(user._id) && handleLike(user._id)}
                  disabled={likedIds.includes(user._id)}
                >
                  {likedIds.includes(user._id) ? '✓ Liked' : '❤️ Like'}
                </button>
                <button style={styles.chatBtn} onClick={() => navigate(`/chat/${user._id}`)}>
                  💬 Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
  matchBanner: { position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #e94560, #c62a47)', color: 'white', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 16, zIndex: 100, boxShadow: '0 8px 32px rgba(233,69,96,0.4)' },
  filterRow: { display: 'flex', gap: 10, marginBottom: 28, alignItems: 'center' },
  filterInput: { flex: 1, background: '#16213e', border: '1px solid #0f3460', borderRadius: 10, color: '#e2e8f0', padding: '10px 16px', fontSize: 14, outline: 'none', maxWidth: 300 },
  filterBtn: { background: '#16213e', border: '1px solid #0f3460', color: '#94a3b8', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13 },
  center: { textAlign: 'center', color: '#64748b', padding: '80px 20px', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 8 },
  avatarWrap: { position: 'relative', width: 64, marginBottom: 4 },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #e94560, #c62a47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white' },
  scoreBadge: { position: 'absolute', bottom: -4, right: -8, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#0f0f1a' },
  name: { fontSize: 17, fontWeight: 700, color: '#f1f5f9' },
  college: { color: '#818cf8', fontSize: 13 },
  city: { color: '#64748b', fontSize: 13 },
  bio: { color: '#94a3b8', fontSize: 13, lineHeight: 1.5 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { background: '#0f0f1a', border: '1px solid #0f3460', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#94a3b8' },
  btnRow: { display: 'flex', gap: 8, marginTop: 8 },
  likeBtn: { flex: 1, background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 8, color: 'white', padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  chatBtn: { flex: 1, background: '#0f0f1a', border: '1px solid #0f3460', borderRadius: 8, color: '#94a3b8', padding: '9px', fontSize: 13, cursor: 'pointer' },
};