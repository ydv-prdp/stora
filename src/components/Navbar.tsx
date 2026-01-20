'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
}

const Navbar = ({ variant = 'landing' }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <nav className={`${styles.navbar} ${variant === 'dashboard' ? styles.navDashboard : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" fillOpacity="0.2" />
              <path d="M12 4.41L19 8.3V12C19 16.32 16.03 20.25 12 21.59C7.97 20.25 5 16.32 5 12V8.3L12 4.41ZM12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" />
            </svg>
          </div>
          <span className={styles.logoText}>Stora</span>
        </div>

        <div className={styles.navLinks}>
          <Link href="/#product" className={styles.link}>Product</Link>
          <Link href="/#solutions" className={styles.link}>Solutions</Link>
          <Link href="/#pricing" className={styles.link}>Pricing</Link>
          <Link href="/#support" className={styles.link}>Support</Link>
        </div>

        <div className={styles.authActions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {user ? (
            <div className={styles.dashboardActions}>
              <Link href="/dashboard" className={styles.dashboardPill}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <button className={styles.btnLogoutIcon} onClick={() => logout()} title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          ) : (
            <Link href={user ? "/dashboard" : "/auth"} className={styles.btnPrimary}>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Navbar;

