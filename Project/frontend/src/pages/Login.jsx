import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const { login } = useAuth();
  const toast     = useToast();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">J</div>
          <span style={{ fontWeight:750, fontSize:'0.9375rem', letterSpacing:'-0.02em' }}>JobSpace</span>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtext">Sign in to your workspace to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', fontSize:'0.85rem', padding:4, cursor:'pointer' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width:'100%', padding:'10px', marginTop:6, justifyContent:'center', fontSize:'0.875rem' }}>
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
