import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setStats(r.data.stats))
      .catch(() => toast('Failed to load admin dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon:'👥', value: stats?.totalUsers     || 0, label:'Registered Users',    color:'var(--accent-light)', bg:'var(--accent-dim)' },
    { icon:'📋', value: stats?.totalApps      || 0, label:'Total Applications',  color:'var(--blue)',         bg:'var(--blue-bg)' },
    { icon:'🏢', value: stats?.totalCompanies || 0, label:'Companies Tracked',   color:'var(--green)',        bg:'var(--green-bg)' },
    { icon:'📄', value: stats?.totalDocs      || 0, label:'Documents Uploaded',  color:'var(--yellow)',       bg:'var(--yellow-bg)' },
  ];

  if (loading) return (
    <div className="page-enter">
      <div className="page-header"><div><div className="skeleton" style={{ width:200, height:22 }} /></div></div>
      <div className="page-body">
        <div className="stats-grid">{[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:110 }} />)}</div>
        <div className="skeleton" style={{ height:120, marginTop:16 }} />
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview</p>
        </div>
        <Link to="/admin/users" className="btn btn-primary btn-sm">Manage users →</Link>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {cards.map(c => (
            <div key={c.label} className="stat-card">
              <div style={{ width:36, height:36, borderRadius:9, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', marginBottom:12 }}>
                {c.icon}
              </div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="card">
          <div className="card-header"><span className="card-title">Admin actions</span></div>
          <div className="card-body" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Link to="/admin/users" className="btn btn-secondary">
              <span>👥</span> Manage users
            </Link>
          </div>
        </div>

        {/* Warning banner */}
        <div style={{
          marginTop:16, padding:'14px 18px', borderRadius:'var(--radius)',
          background:'rgba(245,197,66,0.08)', border:'1px solid rgba(245,197,66,0.2)',
          display:'flex', alignItems:'flex-start', gap:12,
        }}>
          <span style={{ fontSize:'1rem', flexShrink:0, marginTop:1 }}>⚠️</span>
          <div>
            <div style={{ fontSize:'0.825rem', fontWeight:650, color:'var(--yellow)', marginBottom:3 }}>Admin zone</div>
            <div style={{ fontSize:'0.775rem', color:'var(--text-3)', lineHeight:1.5 }}>
              Actions here affect all users and their data. Deleting a user permanently removes all their applications, companies, and documents.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
