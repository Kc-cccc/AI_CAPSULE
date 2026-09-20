import { useEffect, useRef, useState } from 'react';
import Brand from '../../shared/ui/Brand.jsx';
import { LogoutIcon } from '../../shared/ui/Icons.jsx';

export default function AppShell({ user, title, children, onLogout }) {
  const initials = (user?.login || 'GU').slice(0, 2).toUpperCase();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') setAccountOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountOpen]);

  function logout() {
    setAccountOpen(false);
    onLogout();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar__section-label">Workspace</div>
        <div className="sidebar__active">Prompt library</div>
        <div className="sidebar__footer">
          <div className="account-menu" ref={accountRef}>
            {accountOpen && (
              <div className="account-menu__popover" id="account-actions" role="menu">
                <button className="sidebar__logout" type="button" role="menuitem" onClick={logout}><LogoutIcon />Sign out</button>
              </div>
            )}
            <button
              className="profile"
              type="button"
              aria-expanded={accountOpen}
              aria-controls="account-actions"
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
            >
              {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{initials}</span>}
              <span className="profile__copy"><strong>{user?.login || 'GitHub user'}</strong><small>GitHub account</small></span>
            </button>
          </div>
        </div>
      </aside>

      <section className="app-area">
        <header className="app-bar">
          <span>{title}</span>
        </header>
        {children}
      </section>
    </main>
  );
}
