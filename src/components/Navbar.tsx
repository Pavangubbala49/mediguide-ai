import { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  User, 
  LayoutDashboard, 
  Key, 
  LogOut, 
  ShieldCheck,
  MessageSquare,
  Stethoscope,
  FileText,
  Activity,
  ShieldAlert,
  Search,
  LogIn
} from 'lucide-react';
import { LOCALIZATION } from '../services/medicalData';
import type { UserSession } from '../services/authSession';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: string;
  setLang: (lang: string) => void;
  theme: string;
  toggleTheme: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  theme,
  toggleTheme,
  userSession,
  onLogout
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = (key: string) => {
    return LOCALIZATION[key]?.[lang] || LOCALIZATION[key]?.['en'] || key;
  };

  // Nav items with lucide icons mapping
  const navItems = [
    { id: 'home', label: t('home'), icon: LayoutDashboard },
    { id: 'chat', label: t('aiChat'), icon: MessageSquare },
    { id: 'symptom_checker', label: t('symptomChecker'), icon: Stethoscope },
    { id: 'medicines', label: t('medicines'), icon: FileText },
    { id: 'hospitals', label: t('hospitals'), icon: Globe },
    { id: 'history', label: t('history'), icon: Activity },
    { id: 'emergency', label: t('emergency'), icon: ShieldAlert },
    { id: 'login', label: t('login'), icon: LogIn }
  ];

  return (
    <>
      {/* Sidebar Navigation - Left Sticky Panel */}
      <aside className="halo-sidebar no-print">
        {/* Brand */}
        <div className="halo-sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('home')}>
          <Shield className="halo-sidebar-brand-glow" size={26} />
          <span>MediGuide <span style={{ color: 'var(--clinic-primary)' }}>AI</span></span>
        </div>

        {/* Sidebar Navigation items */}
        <nav className="halo-sidebar-nav">
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`halo-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={18} style={{ flexShrink: 0 }} />
                <span style={{ marginLeft: '0.75rem', fontWeight: isActive ? 800 : 600 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Top Header - Responsive fixed pane */}
      <header className="halo-header no-print">
        {/* Header Breadcrumb title */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clinical Portal // V2.5
          </span>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {navItems.find(n => n.id === currentTab)?.label || 'Diagnostics'}
          </h2>
        </div>

        {/* Header Actions - Search, notifications, language selectors, profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Diagnostic Search Shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--clinic-border)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
            <Search size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Search portal...</span>
          </div>

          {/* Language Switcher */}
          <div style={styles.selectorWrapper}>
            <Globe size={15} style={styles.actionIcon} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={styles.select}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="hi">HI</option>
            </select>
          </div>

          {/* Theme switch button */}
          <button onClick={toggleTheme} style={styles.iconButton} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} color="#2dd4bf" /> : <Moon size={18} />}
          </button>

          {/* Profile Initials Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: isDropdownOpen ? '1px solid var(--primary)' : '1.5px solid var(--clinic-border)',
                backgroundColor: isDropdownOpen ? 'var(--bg-secondary)' : 'var(--bg-card)',
                transition: 'opacity var(--transition-fast)'
              }} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div style={{ ...styles.avatar, backgroundColor: 'var(--primary)' }}>
                <User size={12} color="#000" />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {userSession?.name ? userSession.name.split(' ')[0] : 'User'}
              </span>
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown-card" style={{ right: 0, top: '48px' }}>
                <div className="profile-dropdown-header">
                  <div className="dropdown-avatar-ring">
                    <div style={{ ...styles.avatar, width: '40px', height: '40px', backgroundColor: 'var(--primary)' }}>
                      <User size={20} color="#000" />
                    </div>
                  </div>
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{userSession?.name || 'User'}</span>
                    <span className="profile-dropdown-email">{userSession?.email || 'user@mediguide.ai'}</span>
                    <span className="profile-dropdown-badge">
                      <ShieldCheck size={12} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--primary)' }}>
                        {userSession?.role ? userSession.role.toUpperCase() : 'USER'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="profile-dropdown-actions">
                  <button 
                    className="dropdown-action-btn"
                    onClick={() => {
                      setCurrentTab('login');
                      setIsDropdownOpen(false);
                    }}
                  >
                    <LogIn size={16} style={{ color: 'var(--primary)' }} />
                    Sign In / Switch Account
                  </button>
                  <div className="security-switch-card" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', border: 'none', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Key size={14} color="var(--text-muted)" />
                      <span>2FA Security</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="dropdown-footer">
                  <span>SESSION: ACTIVE</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={12} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const styles = {
  selectorWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    border: '1px solid var(--clinic-border)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)'
  },
  actionIcon: {
    color: 'var(--text-muted)'
  },
  select: {
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    cursor: 'pointer'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background var(--transition-fast)'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
