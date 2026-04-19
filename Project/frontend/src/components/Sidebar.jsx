import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../hooks/useTheme';
import { getUploadURL } from '../services/api';

const NAV = [
  { to: '/dashboard',    icon: <IconGrid />,      label: 'Dashboard'    },
  { to: '/applications', icon: <IconClipboard />, label: 'Applications' },
  { to: '/companies',    icon: <IconBuilding />,  label: 'Companies'    },
  { to: '/documents',    icon: <IconFile />,      label: 'Documents'    },
  { to: '/analytics',   icon: <IconChart />,     label: 'Analytics'    },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout }       = useAuth();
  const toast                  = useToast();
  const navigate               = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast('Signed out successfully');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const avatarSrc = user?.avatar ? getUploadURL(user.avatar) : null;

  return (
    <nav className={`sidebar${open ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">J</div>
        <span className="logo-text">JobSpace</span>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label" style={{ marginTop: 12 }}>Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon"><IconShield /></span>
              Admin Panel
            </NavLink>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="theme-btn" onClick={toggleTheme}>
          <span style={{ fontSize: '0.9rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <NavLink to="/profile" className="user-chip" onClick={onClose}>
          <div className="user-avatar">
            {avatarSrc ? <img src={avatarSrc} alt={user?.name} /> : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', flexShrink: 0 }}>›</span>
        </NavLink>

        <button className="signout-btn" onClick={handleLogout}>
          <span style={{ fontSize: '0.85rem' }}>↩</span>
          Sign out
        </button>
      </div>
    </nav>
  );
}

/* ── SVG Icon set ─────────────────────────────────────────────────────────── */
function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1.5"/>
      <rect x="5.5" y="1" width="5" height="2.5" rx="1"/><line x1="5" y1="7" x2="11" y2="7"/><line x1="5" y1="10" x2="9" y2="10"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="12" rx="1"/>
      <path d="M9 7h3a1 1 0 0 1 1 1v7H9"/><line x1="5" y1="6" x2="5" y2="6.01"/><line x1="5" y1="9" x2="5" y2="9.01"/>
      <line x1="5" y1="12" x2="5" y2="12.01"/>
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"/>
      <polyline points="9 2 9 6 13 6"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="12" x2="8" y2="12"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 11 5 7 8 10 12 5 15 8"/>
      <line x1="1" y1="14" x2="15" y2="14"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 4.5v4c0 3 2.5 5.5 5 6.5 2.5-1 5-3.5 5-6.5v-4L8 2z"/>
    </svg>
  );
}
