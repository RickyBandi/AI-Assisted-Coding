import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, getUploadURL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast        = useToast();

  const [users,       setUsers]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => { setUsers(r.data.users || []); setStats(r.data.stats); })
      .catch(() => toast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast(`Role updated to ${role}`);
    } catch { toast('Failed to update role', 'error'); }
  };

  const handleDelete = async () => {
    const { id, name } = deleteModal;
    setDeleteModal(null);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast(`"${name}" and all their data deleted`);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const filtered = users.filter(u =>
    !search.trim() ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-enter">
      <div className="page-header"><div><div className="skeleton" style={{ width:180, height:22 }} /></div></div>
      <div className="page-body">
        <div className="stats-grid">{[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:90 }} />)}</div>
        <div className="skeleton" style={{ height:400, marginTop:16 }} />
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Admin</Link>
      </div>

      <div className="page-body">
        {/* Stats */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom:20 }}>
            {[
              { icon:'👥', v: stats.totalUsers,     label:'Users'         },
              { icon:'📋', v: stats.totalApps,      label:'Applications'  },
              { icon:'🏢', v: stats.totalCompanies, label:'Companies'     },
              { icon:'📄', v: stats.totalDocs,      label:'Documents'     },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value">{s.v}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* User table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All users</span>
            {/* Search */}
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', fontSize:11, opacity:.4, pointerEvents:'none' }}>⌕</span>
              <input
                style={{
                  padding:'6px 10px 6px 26px', background:'var(--bg-3)',
                  border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
                  color:'var(--text)', fontSize:12.5, outline:'none', width:180,
                }}
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last login</th>
                  <th style={{ width:80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontSize:'0.8rem' }}>No users found</td></tr>
                ) : filtered.map(u => {
                  const isSelf   = u._id === me?.id;
                  const initials = u.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
                  const avatarSrc= u.avatar ? getUploadURL(u.avatar) : null;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="user-avatar" style={{ width:30, height:30, fontSize:'0.7rem', flexShrink:0 }}>
                            {avatarSrc ? <img src={avatarSrc} alt={u.name} /> : initials}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.8375rem', color:'var(--text)' }}>{u.name}</div>
                            {isSelf && (
                              <span style={{ fontSize:'0.65rem', fontWeight:650, color:'var(--accent-light)', background:'var(--accent-dim)', padding:'1px 7px', borderRadius:100, letterSpacing:'0.04em' }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color:'var(--text-2)', fontSize:'0.8rem' }}>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          style={{
                            background:'var(--bg-3)', border:'1px solid var(--border)',
                            borderRadius:'var(--radius-xs)', padding:'5px 9px',
                            color: u.role==='admin' ? 'var(--accent-light)' : 'var(--text-3)',
                            fontSize:'0.775rem', cursor: isSelf ? 'not-allowed' : 'pointer',
                            fontWeight: u.role==='admin' ? 650 : 500, outline:'none',
                          }}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ color:'var(--text-3)', fontSize:'0.775rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </td>
                      <td style={{ color:'var(--text-3)', fontSize:'0.775rem' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Never'}
                      </td>
                      <td>
                        {!isSelf && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteModal({ id: u._id, name: u.name })}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete user"
        size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger"    onClick={handleDelete}>Delete permanently</button>
        </>}
      >
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem', lineHeight:1.6 }}>
          Delete <strong style={{ color:'var(--text)' }}>{deleteModal?.name}</strong>?
        </p>
        <div style={{
          marginTop:12, padding:'11px 14px', borderRadius:'var(--radius-sm)',
          background:'var(--red-bg)', border:'1px solid rgba(241,108,117,0.2)',
          fontSize:'0.78rem', color:'var(--red)', lineHeight:1.5,
        }}>
          ⚠ This permanently deletes their account and <strong>all</strong> their applications, companies, and documents.
        </div>
      </Modal>
    </div>
  );
}
