import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Please fill all fields');
    if (!isLogin && !form.name) return setError('Name is required');

    setLoading(true);
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(url, form);
      login(data);
      navigate(data.isProfileComplete ? '/explore' : '/setup');
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏠 RoomieMatch</div>
        <h2 style={styles.title}>{isLogin ? 'Welcome back!' : 'Find your roommate'}</h2>
        <p style={styles.sub}>{isLogin ? 'Login to continue' : 'Create your free account'}</p>

        {error && <div style={styles.error}>{error}</div>}

        {!isLogin && (
          <input
            style={styles.input}
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
        </button>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)' },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420 },
  logo: { fontSize: 28, fontWeight: 800, color: '#e94560', marginBottom: 24, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 },
  sub: { color: '#64748b', fontSize: 14, marginBottom: 28 },
  input: { width: '100%', background: '#0f0f1a', border: '1px solid #0f3460', borderRadius: 10, color: '#e2e8f0', padding: '12px 16px', fontSize: 14, marginBottom: 14, outline: 'none', display: 'block' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 10, color: 'white', padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  error: { background: '#450a0a', border: '1px solid #f87171', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 },
  toggle: { textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 20 },
  link: { color: '#e94560', cursor: 'pointer', fontWeight: 600 },
};