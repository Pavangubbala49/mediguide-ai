import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Activity, 
  Database, 
  Users, 
  ClipboardList, 
  Save,
  Lock,
  Key,
  CheckCircle,
  Server,
  UserCheck
} from 'lucide-react';
import { 
  getDiseases, 
  saveDiseases, 
  SYMPTOMS, 
  saveAdminProfile,
  type Disease,
  type AdminProfile
} from '../services/medicalData';

interface AdminPanelProps {
  activeTab: 'db_diseases' | 'activity' | 'profile';
  setActiveTab: (tab: 'db_diseases' | 'activity' | 'profile') => void;
  adminProfile: AdminProfile;
  setAdminProfile: (profile: AdminProfile) => void;
}

export default function AdminPanel({
  activeTab,
  setActiveTab,
  adminProfile,
  setAdminProfile
}: AdminPanelProps) {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  
  // Form State for New Disease
  const [newId, setNewId] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameEs, setNewNameEs] = useState('');
  const [newNameHi, setNewNameHi] = useState('');
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [newSpecialist, setNewSpecialist] = useState('General Physician');
  const [newCausesEn, setNewCausesEn] = useState('');
  const [newStepsEn, setNewStepsEn] = useState('');

  // Admin Profile Substates
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [cpuUsage, setCpuUsage] = useState<number[]>([23, 27, 31, 28, 35, 42, 38, 41, 36, 44, 39, 45, 52, 47, 42]);
  const [apiLatency, setApiLatency] = useState<number[]>([15, 18, 22, 19, 21, 24, 28, 26, 23, 20, 18, 22, 25, 29, 21]);
  
  // Profile Edits
  const [editName, setEditName] = useState(adminProfile.name);
  const [editEmail, setEditEmail] = useState(adminProfile.email);
  const [editPhone, setEditPhone] = useState(adminProfile.phone);
  const [editDept, setEditDept] = useState(adminProfile.department);
  const [editBio, setEditBio] = useState(adminProfile.bio);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Security Simulator
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState('Weak');
  const [showQrCode, setShowQrCode] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // System Lockdown Simulator
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [lockdownTimer, setLockdownTimer] = useState(10);
  const [lockdownPin, setLockdownPin] = useState('');
  const [lockdownStatus, setLockdownStatus] = useState('ACTIVE CONSOLIDATION...');

  useEffect(() => {
    setDiseases(getDiseases());
  }, []);

  // Sync edits when active profile loads
  useEffect(() => {
    setEditName(adminProfile.name);
    setEditEmail(adminProfile.email);
    setEditPhone(adminProfile.phone);
    setEditDept(adminProfile.department);
    setEditBio(adminProfile.bio);
  }, [adminProfile]);

  // Session Uptime counter
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Performance monitoring fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const next = [...prev.slice(1)];
        const nextVal = Math.max(10, Math.min(95, Math.floor(prev[prev.length - 1] + (Math.random() * 20 - 10))));
        next.push(nextVal);
        return next;
      });
      setApiLatency(prev => {
        const next = [...prev.slice(1)];
        const nextVal = Math.max(5, Math.min(80, Math.floor(prev[prev.length - 1] + (Math.random() * 12 - 6))));
        next.push(nextVal);
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Lockdown active countdown
  useEffect(() => {
    let interval: any;
    if (isLockdownActive) {
      setLockdownTimer(10);
      setLockdownStatus('ACTIVE CONSOLIDATION...');
      interval = setInterval(() => {
        setLockdownTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setLockdownStatus('ENDPOINT LOCKDOWN COMPLETE. CLINICAL NODE ISOLATED.');
            return 0;
          }
          if (prev === 8) setLockdownStatus('SHUTTING DOWN PORT ACCESS...');
          if (prev === 5) setLockdownStatus('ENCRYPTING LOCAL DB SNAPSHOT...');
          if (prev === 2) setLockdownStatus('SEALING STORAGE ENCLAVES...');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockdownActive]);

  const handleSymptomSelectToggle = (symId: string) => {
    if (newSymptoms.includes(symId)) {
      setNewSymptoms(newSymptoms.filter(id => id !== symId));
    } else {
      setNewSymptoms([...newSymptoms, symId]);
    }
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newNameEn || newSymptoms.length === 0) {
      alert('Please fill out Disease ID, Name, and select at least one Symptom.');
      return;
    }

    if (diseases.some(d => d.id === newId)) {
      alert('A disease with this ID already exists.');
      return;
    }

    const newDisease: Disease = {
      id: newId,
      name: { en: newNameEn, es: newNameEs || newNameEn, hi: newNameHi || newNameEn },
      symptoms: newSymptoms,
      severity: newSeverity,
      specialist: newSpecialist,
      possibleCauses: {
        en: newCausesEn.split('\n').filter(x => x.trim() !== ''),
        es: [newCausesEn],
        hi: [newCausesEn]
      },
      nextSteps: {
        en: newStepsEn.split('\n').filter(x => x.trim() !== ''),
        es: [newStepsEn],
        hi: [newStepsEn]
      }
    };

    const updated = [...diseases, newDisease];
    setDiseases(updated);
    saveDiseases(updated);
    
    setNewId('');
    setNewNameEn('');
    setNewNameEs('');
    setNewNameHi('');
    setNewSymptoms([]);
    setNewSeverity('low');
    setNewCausesEn('');
    setNewStepsEn('');
    alert('Disease added to system database successfully! Test it in the Symptom Checker.');
  };

  const handleDeleteDisease = (id: string) => {
    if (window.confirm(`Are you sure you want to delete disease "${id}"? This updates the diagnostic engine.`)) {
      const updated = diseases.filter(d => d.id !== id);
      setDiseases(updated);
      saveDiseases(updated);
    }
  };

  const resetDefaultDb = () => {
    if (window.confirm('Reset disease database to factory default values?')) {
      localStorage.removeItem('mediguide_diseases');
      setDiseases(getDiseases());
    }
  };

  const checkPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 5) score++;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    
    setPasswordStrength(score);
    if (score === 0) setPasswordLabel('Very Weak');
    else if (score === 1) setPasswordLabel('Weak');
    else if (score === 2) setPasswordLabel('Fair');
    else if (score === 3) setPasswordLabel('Strong');
    else if (score === 4) setPasswordLabel('Excellent');
  };

  const formatUptime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stats = [
    { title: 'Total Evaluated Diagnoses', value: '42,911', icon: <ClipboardList size={22} color={adminProfile.accentColor} />, color: adminProfile.accentColor + '20' },
    { title: 'Active Disease Definitions', value: diseases.length, icon: <Database size={22} color="var(--secondary)" />, color: 'var(--secondary-light)' },
    { title: 'Specialist Mappings', value: '8 Fields', icon: <Activity size={22} color="var(--accent)" />, color: 'var(--accent-light)' },
    { title: 'Registered Patient Accounts', value: '12,482', icon: <Users size={22} color="var(--success)" />, color: 'var(--success-light)' }
  ];

  const recentActivities = [
    { event: 'Symptom Checker Evaluation completed', detail: 'Patient Age: 28, Result: Common Cold (78%)', user: 'Guest #492', time: 'Just now' },
    { event: 'AI Chat Query analyzed', detail: 'Symptom trigger check: "Chest pain and breathing difficulty"', user: 'Guest #481', time: '4 minutes ago' },
    { event: 'Medical Report PDF Upload Scan', detail: 'File: "lipid_panel_results.pdf", Risk Level: Medium', user: 'John Doe', time: '18 minutes ago' },
    { event: 'Medicine Information Search', detail: 'Queried: "Paracetamol", Category: Analgesic', user: 'Guest #470', time: '42 minutes ago' },
    { event: 'New Specialist Appt Scheduled', detail: 'Specialist: Cardiologist, Method: Virtual Consultation', user: 'John Doe', time: '1 hour ago' }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={28} color={adminProfile.accentColor} />
          <h2>MediGuide Admin Panel</h2>
        </div>
        <span 
          style={{
            ...styles.roleBadge,
            color: adminProfile.accentColor,
            borderColor: adminProfile.accentColor,
            backgroundColor: adminProfile.accentColor + '15'
          }}
        >
          {adminProfile.role}
        </span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4" style={styles.statsRow}>
        {stats.map((st, idx) => (
          <div key={idx} className="glass-card" style={styles.statCard}>
            <div style={{ ...styles.statIconContainer, backgroundColor: st.color }}>
              {st.icon}
            </div>
            <div>
              <h4 style={styles.statVal}>{st.value}</h4>
              <p style={styles.statLabel}>{st.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Subtabs */}
      <div style={styles.subTabs}>
        <button
          onClick={() => setActiveTab('db_diseases')}
          style={{
            ...styles.subTabBtn,
            color: activeTab === 'db_diseases' ? adminProfile.accentColor : 'var(--text-muted)',
            borderBottomColor: activeTab === 'db_diseases' ? adminProfile.accentColor : 'transparent'
          }}
        >
          Manage Symptoms & Diseases
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            ...styles.subTabBtn,
            color: activeTab === 'activity' ? adminProfile.accentColor : 'var(--text-muted)',
            borderBottomColor: activeTab === 'activity' ? adminProfile.accentColor : 'transparent'
          }}
        >
          Live Patient Activity
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            ...styles.subTabBtn,
            color: activeTab === 'profile' ? adminProfile.accentColor : 'var(--text-muted)',
            borderBottomColor: activeTab === 'profile' ? adminProfile.accentColor : 'transparent'
          }}
        >
          Admin Profile Settings
        </button>
      </div>

      {/* TAB 1: Manage Diseases */}
      {activeTab === 'db_diseases' && (
        <div className="grid grid-cols-3" style={styles.dbLayout}>
          {/* List of existing diseases */}
          <div className="glass-card" style={styles.listCard}>
            <div style={styles.listHeader}>
              <h3 style={{ margin: 0 }}>System Diseases ({diseases.length})</h3>
              <button className="btn btn-outline" onClick={resetDefaultDb} style={styles.resetBtn}>
                Reset Defaults
              </button>
            </div>

            <div style={styles.diseasesList}>
              {diseases.map(d => (
                <div key={d.id} style={styles.diseaseItemRow}>
                  <div>
                    <strong style={{ fontSize: '0.92rem' }}>{d.name.en}</strong>
                    <span style={styles.diseaseIdLabel}>ID: {d.id} | Specialist: {d.specialist}</span>
                    <span style={{ 
                      ...styles.severityBadge, 
                      color: d.severity === 'high' ? 'var(--danger)' : d.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      Severity: {d.severity.toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteDisease(d.id)}
                    style={styles.deleteBtn}
                    title="Delete Disease"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Disease Form */}
          <div className="glass-card" style={styles.formCard}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Add Custom Disease Mapping</h3>
            <form onSubmit={handleAddDisease} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Unique Disease ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. food_allergy"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Name (English)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Food Allergy"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Symptom Triggers (Select all matching)</label>
                <div style={styles.symptomsSelectorGrid}>
                  {SYMPTOMS.map(sym => {
                    const isChecked = newSymptoms.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => handleSymptomSelectToggle(sym.id)}
                        style={{
                          ...styles.selectorTag,
                          backgroundColor: isChecked ? adminProfile.accentColor + '20' : 'var(--bg-secondary)',
                          color: isChecked ? adminProfile.accentColor : 'var(--text-main)',
                          borderColor: isChecked ? adminProfile.accentColor : 'var(--border-color)'
                        }}
                      >
                        {sym.name.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  className="form-control"
                  value={newSeverity}
                  onChange={(e: any) => setNewSeverity(e.target.value)}
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Severity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recommended Specialist</label>
                <select
                  className="form-control"
                  value={newSpecialist}
                  onChange={(e) => setNewSpecialist(e.target.value)}
                >
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Pulmonologist">Pulmonologist</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Causes (One per line)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Exposure to peanut dust\nConsuming shellfish ingredients"
                  value={newCausesEn}
                  onChange={(e) => setNewCausesEn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Action Plan (One per line)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Take antihistamines immediately\nCarry an Epipen injector"
                  value={newStepsEn}
                  onChange={(e) => setNewStepsEn(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '0.5rem', backgroundColor: adminProfile.accentColor }}
              >
                <Save size={16} /> Save to System Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: User Activity */}
      {activeTab === 'activity' && (
        <div className="glass-card" style={styles.activityCard}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Live System Audits</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Event Activity</th>
                  <th style={styles.th}>Details Summary</th>
                  <th style={styles.th}>Initiated By</th>
                  <th style={styles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((act, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>
                      <span className="pulse-indicator" style={{ marginRight: '0.5rem', backgroundColor: adminProfile.accentColor }}></span>
                      <strong>{act.event}</strong>
                    </td>
                    <td style={styles.td}>{act.detail}</td>
                    <td style={styles.td}>{act.user}</td>
                    <td style={styles.td}>{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Admin Profile Settings */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          
          {/* Step 1: Admin Identity & Workstation Theme */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: adminProfile.accentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                1
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} style={{ color: adminProfile.accentColor }} />
                Administrator Identity & Theme
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Dynamic Accent-Glow Avatar */}
              <div 
                className="dropdown-avatar-ring" 
                style={{ 
                  padding: '4px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${adminProfile.accentColor}, var(--secondary))`, 
                  boxShadow: `0 0 20px ${adminProfile.accentColor}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: adminProfile.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.15)'
                }}>
                  <UserCheck size={44} color="#ffffff" />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{adminProfile.name}</h3>
                <p style={{ fontSize: '0.88rem', margin: '0 0 0.75rem 0', color: 'var(--text-muted)' }}>{adminProfile.email}</p>
                
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="profile-dropdown-badge" style={{ margin: 0, '--admin-accent': adminProfile.accentColor, '--admin-accent-light': adminProfile.accentColor + '20' } as React.CSSProperties}>
                    <ShieldCheck size={12} style={{ color: adminProfile.accentColor }} />
                    <span style={{ color: adminProfile.accentColor }}>{adminProfile.role}</span>
                  </span>
                  <span className="profile-dropdown-badge" style={{ margin: 0, '--admin-accent': 'var(--text-main)', '--admin-accent-light': 'var(--bg-secondary)' } as React.CSSProperties}>
                    <Activity size={12} color="var(--text-muted)" style={{ marginRight: '0.2rem' }} />
                    <span style={{ color: 'var(--text-main)' }}>Uptime: {formatUptime(uptimeSeconds)}</span>
                  </span>
                </div>
              </div>

              {/* Admin Server Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', minWidth: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Node Identifier:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>US-EAST-MED-DB0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Access Level:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Lock size={10} /> LEVEL-5 ROOT
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Host Secure IP:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>192.168.42.100</span>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Accent Theme Switcher */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Workspace Theme Color Accent</h4>
              <p style={{ fontSize: '0.75rem', margin: '0 0 0.75rem 0', color: 'var(--text-muted)' }}>Adjust the active theme highlight color across your administrative workspace:</p>
              <div className="accent-selector-grid">
                {[
                  { name: 'Teal (Default)', hex: '#0f766e' },
                  { name: 'Cyan (Pulse)', hex: '#06b6d4' },
                  { name: 'Violet (Cyber)', hex: '#8b5cf6' },
                  { name: 'Crimson (Alert)', hex: '#ef4444' },
                  { name: 'Amber (Warning)', hex: '#f59e0b' }
                ].map(item => (
                  <button
                    key={item.hex}
                    className={`accent-color-btn ${adminProfile.accentColor === item.hex ? 'active' : ''}`}
                    style={{ backgroundColor: item.hex }}
                    onClick={() => {
                      const updated = { ...adminProfile, accentColor: item.hex };
                      setAdminProfile(updated);
                      saveAdminProfile(updated);
                    }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Credentials Form */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: adminProfile.accentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                2
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} style={{ color: adminProfile.accentColor }} />
                Administrative Credentials
              </h3>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = {
                ...adminProfile,
                name: editName,
                email: editEmail,
                phone: editPhone,
                department: editDept,
                bio: editBio
              };
              setAdminProfile(updated);
              saveAdminProfile(updated);
              setShowSaveToast(true);
              setTimeout(() => setShowSaveToast(false), 3000);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Line</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Administrative Department</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Administrator Profile Bio</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                {showSaveToast ? (
                  <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Profile details saved successfully!
                  </span>
                ) : <span />}
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem', backgroundColor: adminProfile.accentColor }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Step 3: Real-Time Diagnostics */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: adminProfile.accentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                3
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={18} style={{ color: adminProfile.accentColor }} />
                Real-Time Node Diagnostics
              </h3>
            </div>
            
            <p style={{ fontSize: '0.78rem', margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>
              Active server compute workload mapping for clinical inference nodes. Redundancy backup lines: 100% operational.
            </p>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              {/* CPU usage chart */}
              <div className="performance-chart-box">
                <div className="chart-header">
                  <span className="chart-title">CPU Compute Workload</span>
                  <span className="chart-value" style={{ color: adminProfile.accentColor }}>{cpuUsage[cpuUsage.length - 1]}%</span>
                </div>
                <div className="chart-visual-wrapper">
                  {cpuUsage.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`chart-bar-column ${idx === cpuUsage.length - 1 ? 'active' : ''}`}
                      style={{ 
                        height: `${val}%`, 
                        backgroundColor: idx === cpuUsage.length - 1 ? adminProfile.accentColor : adminProfile.accentColor + '25'
                      }}
                      title={`Compute: ${val}%`}
                    />
                  ))}
                </div>
              </div>

              {/* API latency chart */}
              <div className="performance-chart-box">
                <div className="chart-header">
                  <span className="chart-title">REST API Inference Latency</span>
                  <span className="chart-value" style={{ color: adminProfile.accentColor }}>{apiLatency[apiLatency.length - 1]} ms</span>
                </div>
                <div className="chart-visual-wrapper">
                  {apiLatency.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`chart-bar-column ${idx === apiLatency.length - 1 ? 'active' : ''}`}
                      style={{ 
                        height: `${(val / 80) * 100}%`, 
                        backgroundColor: idx === apiLatency.length - 1 ? adminProfile.accentColor : adminProfile.accentColor + '25'
                      }}
                      title={`Latency: ${val}ms`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Security & Access Simulator */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: adminProfile.accentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                4
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} style={{ color: adminProfile.accentColor }} />
                Workspace Security & Operations
              </h3>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
              {/* Security switches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Security Preferences</h4>
                
                {/* MFA Switch */}
                <div className="security-switch-card">
                  <div className="security-switch-info">
                    <span className="security-switch-title">2FA Authentication</span>
                    <span className="security-switch-desc">Enforce OTP code verification</span>
                  </div>
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={adminProfile.mfaEnabled}
                      onChange={(e) => {
                        const updated = { ...adminProfile, mfaEnabled: e.target.checked };
                        setAdminProfile(updated);
                        saveAdminProfile(updated);
                        if (!e.target.checked) setShowQrCode(false);
                      }} 
                    />
                    <span className="switch-slider" style={{ backgroundColor: adminProfile.mfaEnabled ? adminProfile.accentColor : undefined }} />
                  </label>
                </div>

                {/* Auto Lock Switch */}
                <div className="security-switch-card">
                  <div className="security-switch-info">
                    <span className="security-switch-title">Session Auto-Lock</span>
                    <span className="security-switch-desc">Lock account after 15m inactivity</span>
                  </div>
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={adminProfile.autoLockEnabled}
                      onChange={(e) => {
                        const updated = { ...adminProfile, autoLockEnabled: e.target.checked };
                        setAdminProfile(updated);
                        saveAdminProfile(updated);
                      }} 
                    />
                    <span className="switch-slider" style={{ backgroundColor: adminProfile.autoLockEnabled ? adminProfile.accentColor : undefined }} />
                  </label>
                </div>

                {/* Hardware Token */}
                <div className="security-switch-card">
                  <div className="security-switch-info">
                    <span className="security-switch-title">Hardware Token</span>
                    <span className="security-switch-desc">Require physical Security Key</span>
                  </div>
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={adminProfile.tokenVerificationEnabled}
                      onChange={(e) => {
                        const updated = { ...adminProfile, tokenVerificationEnabled: e.target.checked };
                        setAdminProfile(updated);
                        saveAdminProfile(updated);
                      }} 
                    />
                    <span className="switch-slider" style={{ backgroundColor: adminProfile.tokenVerificationEnabled ? adminProfile.accentColor : undefined }} />
                  </label>
                </div>

                {/* Audit logs */}
                <div className="security-switch-card">
                  <div className="security-switch-info">
                    <span className="security-switch-title">Audit Log Trail</span>
                    <span className="security-switch-desc">Log database override requests</span>
                  </div>
                  <label className="switch-control">
                    <input 
                      type="checkbox" 
                      checked={adminProfile.auditTrailEnabled}
                      onChange={(e) => {
                        const updated = { ...adminProfile, auditTrailEnabled: e.target.checked };
                        setAdminProfile(updated);
                        saveAdminProfile(updated);
                      }} 
                    />
                    <span className="switch-slider" style={{ backgroundColor: adminProfile.auditTrailEnabled ? adminProfile.accentColor : undefined }} />
                  </label>
                </div>
              </div>

              {/* Password Strength and MFA Simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {adminProfile.mfaEnabled && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem', backgroundColor: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>Simulator: Register MFA Device</span>
                    {!showQrCode ? (
                      <button 
                        className="btn btn-outline" 
                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => setShowQrCode(true)}
                      >
                        Generate QR Access Token
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px' }}>
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} style={{ backgroundColor: (i * 7 + 3) % 2 === 0 ? '#000' : '#fff' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan QR in Google Authenticator</span>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8rem', textAlign: 'center', width: '100px' }}
                          placeholder="000000"
                          maxLength={6}
                          value={mfaCode}
                          onChange={(e) => {
                            setMfaCode(e.target.value);
                            if (e.target.value.length === 6) {
                              alert('MFA Simulator Handshake Complete! Security key synchronized.');
                              setShowQrCode(false);
                              setMfaCode('');
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Password Simulator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Reset Security Credentials</h4>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="password" 
                      placeholder="Current Access Password" 
                      className="form-control"
                      style={{ height: '36px', padding: '0 0.75rem', fontSize: '0.8rem' }}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="password" 
                      placeholder="New Root Password" 
                      className="form-control"
                      style={{ height: '36px', padding: '0 0.75rem', fontSize: '0.8rem' }}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                    />
                  </div>
                  {newPassword.length > 0 && (
                    <div className="password-strength-container">
                      <div className="password-strength-bar-bg">
                        <div 
                          className="password-strength-bar" 
                          style={{ 
                            width: `${(passwordStrength / 4) * 100}%`,
                            backgroundColor: passwordStrength === 0 ? '#ef4444' : passwordStrength === 1 ? '#f97316' : passwordStrength === 2 ? '#eab308' : passwordStrength === 3 ? '#3b82f6' : '#10b981'
                          }} 
                        />
                      </div>
                      <span 
                        className="password-strength-label"
                        style={{
                          color: passwordStrength === 0 ? '#ef4444' : passwordStrength === 1 ? '#f97316' : passwordStrength === 2 ? '#eab308' : passwordStrength === 3 ? '#3b82f6' : '#10b981'
                        }}
                      >
                        Strength: {passwordLabel}
                      </span>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: '100%', marginTop: '0.25rem' }}
                    onClick={() => {
                      if (!currentPassword || !newPassword) {
                        alert('Please enter your current password and a new password.');
                        return;
                      }
                      alert('Simulation: Password updated successfully and encryption hashes updated.');
                      setCurrentPassword('');
                      setNewPassword('');
                    }}
                  >
                    Update Root Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: System Containment */}
          <div className="glass-card" style={{ borderLeft: '3px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                5
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <Lock size={18} />
                Node Lockdown Containment Measures
              </h3>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-muted)' }}>
                  Active intrusion response protocols. Initiating a lockdown will instantly isolate clinical database enclaves, encrypt session directories, and sever external REST communication tunnels for guest accounts. Use with extreme caution.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
                onClick={() => {
                  setIsLockdownActive(true);
                }}
              >
                <Lock size={16} />
                Initiate Secure Lockdown
              </button>
            </div>
          </div>

        </div>
      )}      {/* LOCKDOWN SIMULATOR FULL SCREEN MODAL */}
      {isLockdownActive && (
        <div className="lockdown-overlay">
          <div className="lockdown-container">
            <span className="lockdown-badge">CRITICAL OVERRIDE ACTIVE</span>
            <h2 style={{ color: '#ef4444', margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 900 }}>SYSTEM BLOCK LOCKDOWN</h2>
            
            {lockdownTimer > 0 ? (
              <>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Clinical database seals will close in:
                </p>
                <div className="lockdown-timer">{lockdownTimer}</div>
                <div style={{ color: '#f87171', fontWeight: 700, fontFamily: 'monospace', minHeight: '1.2rem', fontSize: '0.85rem' }}>
                  {lockdownStatus}
                </div>
                
                <div style={{ width: '100%', marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>
                    ENTER BYPASS CODE (PIN: 9999) TO ABORT LOCKDOWN
                  </label>
                  <input
                    type="password"
                    placeholder="Enter 4-Digit Deactivation Key"
                    className="lockdown-input"
                    maxLength={4}
                    value={lockdownPin}
                    onChange={(e) => {
                      setLockdownPin(e.target.value);
                      if (e.target.value === '9999') {
                        setIsLockdownActive(false);
                        setLockdownPin('');
                        alert('Lockdown aborted! Secure channels stand by.');
                      }
                    }}
                  />
                </div>
                
                <button
                  className="btn btn-outline"
                  style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', width: '100%', padding: '0.5rem' }}
                  onClick={() => {
                    setIsLockdownActive(false);
                    setLockdownPin('');
                  }}
                >
                  Dismiss Emergency Protocol
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', margin: '1rem 0' }}>🔒</div>
                <h3 style={{ color: '#f87171', margin: 0 }}>NODE ISOLATION COMPLETE</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.5rem 0' }}>
                  All network routes severed. Data enclaves encrypted.
                </p>
                <button
                  className="btn btn-danger"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Reboot Clinical Node (Reload App)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  roleBadge: {
    fontSize: '0.8rem',
    fontWeight: 800,
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent'
  },
  statsRow: {
    width: '100%'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem'
  },
  statIconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statVal: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--text-main)'
  },
  statLabel: {
    margin: 0,
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  subTabs: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
    overflowX: 'auto' as const
  },
  subTabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.5rem 0.25rem',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    whiteSpace: 'nowrap' as const
  },
  dbLayout: {
    alignItems: 'stretch'
  },
  listCard: {
    gridColumn: 'span 1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    maxHeight: '650px',
    overflowY: 'auto' as const
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resetBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem'
  },
  diseasesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  diseaseItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)'
  },
  diseaseIdLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem'
  },
  severityBadge: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 800,
    marginTop: '0.2rem'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: 'var(--radius-sm)'
  },
  formCard: {
    gridColumn: 'span 2',
    padding: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  symptomsSelectorGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
    maxHeight: '120px',
    overflowY: 'auto' as const,
    border: '1px solid var(--border-color)',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)'
  },
  selectorTag: {
    border: '1px solid transparent',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  activityCard: {
    padding: '1.5rem'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const
  },
  thRow: {
    borderBottom: '2px solid var(--border-color)'
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-muted)'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background var(--transition-fast)'
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.88rem',
    color: 'var(--text-main)'
  }
};
