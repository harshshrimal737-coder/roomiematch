import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/users/my-matches')
      .then(r => setMatches(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💞 Your Matches</h2>
      <p style={styles.sub}>These people liked you back! Start chatting.</p>

      {loading && <div style={styles.center}>Loading...</div>}
      {!loading && matches.length === 0 && (
        <div style={styles.center}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
          <p>No matches yet. Keep exploring!</p>
          <button style={styles.exploreBtn} onClick={() => navigate('/explore')}>
            Explore Roommates
          </button>
        </div>
      )}

      <div style={styles.grid}>
        {matches.map(match => (
          <div key={match._id} style={styles.card}>
            <div style={styles.avatar}>{match.name?.charAt(0).toUpperCase()}</div>
            <div style={styles.info}>
              <div style={styles.name}>{match.name}</div>
              <div style={styles.detail}>{match.college} • {match.city}</div>
              {match.bio && <div style={styles.bio}>{match.bio.slice(0, 60)}...</div>}
            </div>
            <button style={styles.chatBtn} onClick={() => navigate(`/chat/${match._id}`)}>
              💬 Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px 24px', maxWidth: 700, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 28 },
  center: { textAlign: 'center', color: '#64748b', padding: '60px 20px' },
  exploreBtn: { background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 10, color: 'white', padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 16 },
  grid: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  avatar: { width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #e94560, #c62a47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0 },
  info: { flex: 1 },
  name: { fontWeight: 600, color: '#f1f5f9', fontSize: 16, marginBottom: 2 },
  detail: { color: '#818cf8', fontSize: 13, marginBottom: 4 },
  bio: { color: '#64748b', fontSize: 12 },
  chatBtn: { background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 8, color: 'white', padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
};