import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    title: 'Basic Info',
    fields: [
      { key: 'age', label: 'Your Age', type: 'number', placeholder: '20' },
      { key: 'college', label: 'College / University', type: 'text', placeholder: 'IIT Delhi' },
      { key: 'city', label: 'City', type: 'text', placeholder: 'Delhi' },
      { key: 'bio', label: 'Short Bio', type: 'textarea', placeholder: 'Tell potential roommates about yourself...' },
    ]
  },
  {
    title: 'Lifestyle',
    fields: [
      { key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'] },
      { key: 'sleepTime', label: 'Sleep Time', type: 'select', options: ['early', 'late', 'flexible'], qKey: true },
      { key: 'wakeTime', label: 'Wake Time', type: 'select', options: ['early', 'late', 'flexible'], qKey: true },
      { key: 'personality', label: 'Personality', type: 'select', options: ['introvert', 'extrovert', 'ambivert'], qKey: true },
    ]
  },
  {
    title: 'House Rules',
    fields: [
      { key: 'cleanliness', label: 'Cleanliness (1=relaxed, 5=very clean)', type: 'select', options: ['1', '2', '3', '4', '5'], qKey: true },
      { key: 'noiseTolerance', label: 'Noise Tolerance', type: 'select', options: ['quiet', 'moderate', 'loud'], qKey: true },
      { key: 'guestsPolicy', label: 'Guests Policy', type: 'select', options: ['never', 'sometimes', 'often'], qKey: true },
      { key: 'smokingPolicy', label: 'Smoking', type: 'select', options: ['no', 'outside', 'yes'], qKey: true },
      { key: 'petsPolicy', label: 'Pets', type: 'select', options: ['no', 'yes'], qKey: true },
      { key: 'budget', label: 'Monthly Budget', type: 'select', options: ['low', 'medium', 'high'], qKey: true },
    ]
  }
];

export default function Setup() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const currentStep = steps[step];

  const setValue = (key, value, isQ) => {
    if (isQ) {
      setData(prev => ({ ...prev, questionnaire: { ...(prev.questionnaire || {}), [key]: value } }));
    } else {
      setData(prev => ({ ...prev, [key]: value }));
    }
  };

  const getValue = (key, isQ) => {
    if (isQ) return data.questionnaire?.[key] || '';
    return data[key] || '';
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const { data: updated } = await api.put('/api/users/profile', data);
        updateUser(updated);
        navigate('/explore');
      } catch (e) {
        alert(e.response?.data?.error || 'Error saving profile');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏠 RoomieMatch</div>
          <div style={styles.stepInfo}>Step {step + 1} of {steps.length}</div>
        </div>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progress, width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        <h2 style={styles.title}>{currentStep.title}</h2>

        {currentStep.fields.map(field => (
          <div key={field.key} style={styles.fieldWrap}>
            <label style={styles.label}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                style={styles.input}
                value={getValue(field.key, field.qKey)}
                onChange={e => setValue(field.key, field.key === 'cleanliness' ? Number(e.target.value) : e.target.value, field.qKey)}
              >
                <option value="">Select...</option>
                {field.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                placeholder={field.placeholder}
                value={getValue(field.key, field.qKey)}
                onChange={e => setValue(field.key, e.target.value, field.qKey)}
              />
            ) : (
              <input
                style={styles.input}
                type={field.type}
                placeholder={field.placeholder}
                value={getValue(field.key, field.qKey)}
                onChange={e => setValue(field.key, e.target.value, field.qKey)}
              />
            )}
          </div>
        ))}

        <div style={styles.btnRow}>
          {step > 0 && (
            <button style={styles.backBtn} onClick={() => setStep(step - 1)}>← Back</button>
          )}
          <button style={styles.nextBtn} onClick={handleNext} disabled={loading}>
            {loading ? 'Saving...' : step === steps.length - 1 ? 'Find Roommates 🚀' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', padding: 20 },
  card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 20, padding: '40px', width: '100%', maxWidth: 500 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 22, fontWeight: 800, color: '#e94560' },
  stepInfo: { color: '#64748b', fontSize: 13 },
  progressBar: { background: '#0f0f1a', borderRadius: 10, height: 6, marginBottom: 28, overflow: 'hidden' },
  progress: { background: 'linear-gradient(90deg, #e94560, #c62a47)', height: '100%', borderRadius: 10, transition: 'width 0.3s' },
  title: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { width: '100%', background: '#0f0f1a', border: '1px solid #0f3460', borderRadius: 10, color: '#e2e8f0', padding: '11px 14px', fontSize: 14, outline: 'none' },
  btnRow: { display: 'flex', gap: 12, marginTop: 28 },
  backBtn: { background: '#0f0f1a', border: '1px solid #0f3460', color: '#94a3b8', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontSize: 14 },
  nextBtn: { flex: 1, background: 'linear-gradient(135deg, #e94560, #c62a47)', border: 'none', borderRadius: 10, color: 'white', padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};