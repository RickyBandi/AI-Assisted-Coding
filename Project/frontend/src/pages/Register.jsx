import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      toast('Welcome to JobSpace! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const fields = [
    { key:'name',            label:'Full name',       type:'text',     ph:'Your name',          autoFocus: true },
    { key:'email',           label:'Email address',   type:'email',    ph:'you@example.com' },
    { key:'password',        label:'Password',        type:'password', ph:'Min. 6 characters' },
    { key:'confirmPassword', label:'Confirm password',type:'password', ph:'Repeat password' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">J</div>
          <span style={{ fontWeight:750, fontSize:'0.9375rem', letterSpacing:'-0.02em' }}>JobSpace</span>
        </div>
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subtext">Start organizing your job search for free</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-control" type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={set(f.key)} required autoFocus={f.autoFocus} />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width:'100%', padding:'10px', marginTop:6, justifyContent:'center', fontSize:'0.875rem' }}>
            {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
