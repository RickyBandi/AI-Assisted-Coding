import { useEffect, useState, useRef } from 'react';
import { profileAPI, getUploadURL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STAT_ITEMS = [
  { key: 'totalApps',      icon: '📋', label: 'Applications', color: 'var(--accent-light)' },
  { key: 'totalCompanies', icon: '🏢', label: 'Companies',    color: 'var(--blue)'         },
  { key: 'interviews',     icon: '🎯', label: 'Interviews',   color: 'var(--yellow)'       },
  { key: 'offers',         icon: '🏆', label: 'Offers',       color: 'var(--green)'        },
  { key: 'totalDocs',      icon: '📄', label: 'Documents',    color: 'var(--purple)'       },
];

export default function Profile() {
  const { setUser }   = useAuth();
  const toast         = useToast();

  const [profile,   setProfile]  = useState(null);
  const [stats,     setStats]    = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [saving,    setSaving]   = useState(false);
  const [pwSaving,  setPwSaving] = useState(false);
  const [activeTab, setActiveTab]= useState('profile');

  const [form, setForm]     = useState({ name:'', title:'', location:'', bio:'' });
  const [pwForm, setPwForm] = useState({ oldPassword:'', newPassword:'', confirmPassword:'' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    profileAPI.get()
      .then(r => {
        setProfile(r.data.user);
        setStats(r.data.stats);
        setForm({
          name:     r.data.user.name     || '',
          title:    r.data.user.title    || '',
          location: r.data.user.location || '',
          bio:      r.data.user.bio      || '',
        });
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set   = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const r = await profileAPI.update(fd);
      setProfile(r.data.user);
      setUser(u => ({ ...u, name: r.data.user.name, avatar: r.data.user.avatar }));
      setAvatarFile(null);
      toast('Profile updated!');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update', 'error');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault(); setPwSaving(true);
    try {
      await profileAPI.changePassword(pwForm);
      setPwForm({ oldPassword:'', newPassword:'', confirmPassword:'' });
      toast('Password changed!');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally { setPwSaving(false); }
  };

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div><div className="skeleton" style={{ width:120, height:22 }} /></div>
      </div>
      <div className="page-body">
        <div className="grid-2">
          <div className="skeleton" style={{ height: 440 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="skeleton" style={{ height: 200 }} />
            <div className="skeleton" style={{ height: 200 }} />
          </div>
        </div>
      </div>
    </div>
  );

  const avatarSrc = avatarPreview || (profile?.avatar ? getUploadURL(profile.avatar) : null);
  const initials  = profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const TABS = [
    { id: 'profile',  label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'account',  label: 'Account' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ alignItems: 'start' }}>

          {/* Left column — tabbed forms */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {/* Tab bar */}
            <div style={{
              display:'flex', gap:2, marginBottom:16,
              borderBottom:'1px solid var(--border)', paddingBottom:0,
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  background:'none', border:'none', cursor:'pointer',
                  padding:'8px 14px', fontSize:'0.8125rem', fontWeight: activeTab===t.id ? 600 : 500,
                  color: activeTab===t.id ? 'var(--text)' : 'var(--text-3)',
                  borderBottom: activeTab===t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1, transition:'var(--transition)',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Personal information</span></div>
                <div className="card-body">
                  <form onSubmit={handleProfileSave}>
                    {/* Avatar row */}
                    <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24 }}>
                      <div className="profile-avatar-wrap">
                        <div className="profile-avatar">
                          {avatarSrc ? <img src={avatarSrc} alt={profile?.name} /> : initials}
                        </div>
                        <button type="button" className="profile-avatar-btn" onClick={() => avatarRef.current?.click()}>✏</button>
                        <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange} />
                      </div>
                      <div>
                        <div style={{ fontWeight:650, fontSize:'0.9375rem', letterSpacing:'-0.01em', marginBottom:3 }}>{profile?.name}</div>
                        <div style={{ fontSize:'0.775rem', color:'var(--text-3)', marginBottom:10 }}>{profile?.email}</div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => avatarRef.current?.click()}>
                          Change avatar
                        </button>
                        {avatarFile && <span style={{ fontSize:'0.72rem', color:'var(--green)', marginLeft:8 }}>✓ Ready to save</span>}
                      </div>
                    </div>

                    {[
                      { key:'name',     label:'Full name',    ph:'Your name',               type:'text' },
                      { key:'title',    label:'Job title',    ph:'e.g. Software Engineer',  type:'text' },
                      { key:'location', label:'Location',     ph:'e.g. San Francisco, CA',  type:'text' },
                    ].map(f => (
                      <div key={f.key} className="form-group">
                        <label className="form-label">{f.label}</label>
                        <input className="form-control" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={set(f.key)} />
                      </div>
                    ))}

                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea className="form-control" placeholder="A short bio about yourself…" value={form.bio} onChange={set('bio')} style={{ minHeight: 80 }} />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={saving}
                      style={{ justifyContent:'center' }}>
                      {saving ? <><span className="spinner spinner-sm" /> Saving…</> : 'Save changes'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Password tab */}
            {activeTab === 'password' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Change password</span></div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSave}>
                    {[
                      { key:'oldPassword',     label:'Current password',   ph:'Your current password' },
                      { key:'newPassword',     label:'New password',       ph:'Minimum 6 characters'   },
                      { key:'confirmPassword', label:'Confirm new password',ph:'Repeat new password'   },
                    ].map(f => (
                      <div key={f.key} className="form-group">
                        <label className="form-label">{f.label}</label>
                        <input className="form-control" type="password" placeholder={f.ph} value={pwForm[f.key]} onChange={setPw(f.key)} required />
                      </div>
                    ))}
                    <button className="btn btn-primary" type="submit" disabled={pwSaving}
                      style={{ justifyContent:'center' }}>
                      {pwSaving ? <><span className="spinner spinner-sm" /> Saving…</> : 'Update password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Account tab */}
            {activeTab === 'account' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Account info</span></div>
                {[
                  { label:'Email',        value: profile?.email },
                  { label:'Role',         value: profile?.role,
                    render: () => (
                      <span style={{
                        fontSize:'0.72rem', fontWeight:650, padding:'3px 10px',
                        borderRadius:100, letterSpacing:'0.04em', textTransform:'uppercase',
                        background: profile?.role === 'admin' ? 'var(--accent-dim)' : 'var(--bg-4)',
                        color: profile?.role === 'admin' ? 'var(--accent-light)' : 'var(--text-3)',
                      }}>{profile?.role}</span>
                    )
                  },
                  { label:'Member since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—' },
                  { label:'Last login',   value: profile?.lastLogin  ? new Date(profile.lastLogin).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>{row.label}</span>
                    {row.render ? row.render() : <span style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--text)' }}>{row.value}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column — stats */}
          <div>
            <div className="card">
              <div className="card-header"><span className="card-title">Your stats</span></div>
              <div style={{ padding:0 }}>
                {STAT_ITEMS.map((s, i) => (
                  <div key={s.key} style={{
                    display:'flex', alignItems:'center', padding:'14px 20px',
                    borderBottom: i < STAT_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
                    transition:'var(--transition)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <span style={{ fontSize:'1.1rem', marginRight:12, color: s.color }}>{s.icon}</span>
                    <span style={{ flex:1, fontSize:'0.85rem', color:'var(--text-2)' }}>{s.label}</span>
                    <span style={{ fontWeight:750, fontSize:'1.2rem', color:'var(--text)', letterSpacing:'-0.03em' }}>
                      {stats?.[s.key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
