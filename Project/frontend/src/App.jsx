import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Layout         from './components/Layout';
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Applications   from './pages/Applications';
import Companies      from './pages/Companies';
import Documents      from './pages/Documents';
import Analytics      from './pages/Analytics';
import Profile        from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers     from './pages/AdminUsers';
import AdminLogin     from './pages/AdminLogin';

/* ── Animated route wrapper ───────────────────────────────────── */
function AnimatedRoutes({ children }) {
  const location     = useLocation();
  const prevPath     = useRef(location.pathname);
  const containerRef = useRef(null);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;
    const el = containerRef.current;
    if (!el) return;
    el.classList.remove('route-enter');
    void el.offsetWidth; // force reflow
    el.classList.add('route-enter');
  }, [location.pathname]);

  return <div ref={containerRef} className="route-enter">{children}</div>;
}

/* ── Route guards ─────────────────────────────────────────────── */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!user)                 return <Navigate to="/login"    replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AnimatedRoutes>
            <Routes>
              {/* Public */}
              <Route path="/"         element={<GuestRoute><Landing /></GuestRoute>} />
              <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              {/* Admin hidden login — accessible only via direct URL, no links in UI */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected user routes */}
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/companies"    element={<Companies />} />
                <Route path="/documents"    element={<Documents />} />
                <Route path="/analytics"    element={<Analytics />} />
                <Route path="/profile"      element={<Profile />} />
              </Route>

              {/* Admin routes — require admin role */}
              <Route element={<AdminRoute><Layout /></AdminRoute>}>
                <Route path="/admin"       element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatedRoutes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
