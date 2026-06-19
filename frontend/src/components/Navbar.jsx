import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { path: '/explore', label: '🔍 Explore' },
    { path: '/matches', label: '💞 Matches' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.logo} onClick={() => navigate('/explore')}>🏠 RoomieMatch</div>
        <div style={styles.links}>
          {links.map(l => (
            <button
              key={l.path}
              style={{ ...styles.link, ...(location.pathname === l.path ? styles.active : {}) }}
              onClick={() => navigate(l.path)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div style={styles.right}>
          <span style={styles.userName}>Hi, {user.name?.split(' ')[0]}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#16213e', borderBottom: '1px solid #0f3460', position: 'sticky', top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 },
  logo: { fontSize: 18, fontWeight: 800, color: '#e94560', cursor: 'pointer', whiteSpace: 'nowrap' },
  links: { display: 'flex', gap: 4, flex: 1, justifyContent: 'center' },
  link: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' },
  active: { color: '#e94560', background: 'rgba(233,69,96,0.1)' },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  userName: { color: '#64748b', fontSize: 13 },
  logoutBtn: { background: 'none', border: '1px solid #0f3460', color: '#64748b', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
};