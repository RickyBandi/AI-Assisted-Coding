import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, footer, size = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`modal${size ? ' modal-' + size : ''}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
            style={{ color: 'var(--text-3)', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
