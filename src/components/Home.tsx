import { useState, useEffect } from 'react';
import { 
  ArrowRight, Activity, Calendar, Clock, Phone, MapPin, MessageSquare, 
  HeartPulse, Pill, User,
  Brain, Bone, Baby, Eye, Ear, ShieldCheck, Mail
} from 'lucide-react';
import doctorHeroImg from '../assets/doctor_hero.png';
import BookAppointmentSection from './BookAppointmentSection';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  setInitialChatText: (text: string) => void;
  lang: string;
}

interface Appointment {
  id: string;
  name: string;
  department: string;
  date: string;
  time: string;
}

export default function Home({ setCurrentTab, setInitialChatText, lang }: HomeProps) {
  // Satisfy TS unused variable checks
  if (lang === 'xyz') console.log(lang);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({ name: '', department: '', date: '', time: '' });

  useEffect(() => {
    const saved = localStorage.getItem('mediguide_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch {
        console.error('Failed to parse appointments');
      }
    }
  }, []);


  const handleNewBookAppointment = (apt: { date: string, time: string, name: string, department: string }) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...apt
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem('mediguide_appointments', JSON.stringify(updated));
  };

  const handleStartSearch = (query: string) => {
    setInitialChatText(query);
    setCurrentTab('chat');
  };

  const departments = [
    { name: 'Cardiology', icon: HeartPulse, desc: 'Expert heart care and surgery.' },
    { name: 'Neurology', icon: Brain, desc: 'Advanced brain and nerve treatments.' },
    { name: 'Orthopedics', icon: Bone, desc: 'Bone, joint, and muscle specialists.' },
    { name: 'Pediatrics', icon: Baby, desc: 'Compassionate care for children.' },
    { name: 'Ophthalmology', icon: Eye, desc: 'Vision and eye health services.' },
    { name: 'ENT', icon: Ear, desc: 'Ear, nose, and throat experts.' },
  ];

  const doctors = [
    { name: 'Dr. Sarah Jenkins', spec: 'Cardiologist', qual: 'MD, FACC', days: 'Mon, Wed, Fri', time: '09:00 AM - 01:00 PM', available: true },
    { name: 'Dr. Michael Chen', spec: 'Neurologist', qual: 'MD, PhD', days: 'Tue, Thu, Sat', time: '10:00 AM - 04:00 PM', available: true },
    { name: 'Dr. Emily Rodriguez', spec: 'Pediatrician', qual: 'MD, FAAP', days: 'Mon - Fri', time: '08:00 AM - 02:00 PM', available: false },
    { name: 'Dr. James Wilson', spec: 'Orthopedic Surgeon', qual: 'MD, FAAOS', days: 'Mon, Thu', time: '01:00 PM - 06:00 PM', available: true },
    { name: 'Dr. Aisha Patel', spec: 'Dermatologist', qual: 'MD, FAAD', days: 'Wed, Fri, Sat', time: '09:00 AM - 03:00 PM', available: true },
    { name: 'Dr. Robert Kim', spec: 'General Physician', qual: 'MD, FACP', days: 'Mon - Sat', time: '08:00 AM - 08:00 PM', available: true },
  ];

  return (
    <div style={styles.pageContainer}>
      
      {/* HEADER */}
      <header style={styles.topHeaderNav}>
        <div style={styles.logoGroup} onClick={() => setCurrentTab('home')}>
          <div style={styles.logoIconBadge}>
            <Activity size={18} color="#000" />
          </div>
          <span style={styles.logoText}>MediGuide Hospital</span>
        </div>

        <nav style={styles.headerMenuNav}>
          <button style={{ ...styles.menuLink, color: 'var(--text-main)', fontWeight: 800 }}>Home</button>
          <button style={styles.menuLink} onClick={() => document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' })}>Departments</button>
          <button style={styles.menuLink} onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}>Doctors</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('chat')}>AI Support</button>
        </nav>

        <button 
          style={styles.headerCtaBtn}
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span>Book Appointment</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badgeLabel}>
            <ShieldCheck size={14} />
            <span>Trusted Healthcare Excellence</span>
          </div>
          <h1 style={styles.heroTitle}>
            Advanced Care.<br />
            <span style={{ color: 'var(--primary)' }}>Compassionate Healing.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Providing world-class medical services with state-of-the-art facilities, expert specialists, and our revolutionary AI medical assistant.
          </p>
          <div style={styles.heroCtaRow}>
            <button style={styles.primaryBtn} onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}>
              <Calendar size={16} /> Book an Appointment
            </button>
            <button style={styles.secondaryBtn} onClick={() => handleStartSearch("I need help understanding my symptoms")}>
              <Activity size={16} /> Try AI Symptom Checker
            </button>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>150+</h3>
              <p style={styles.statLabel}>Specialist Doctors</p>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>24/7</h3>
              <p style={styles.statLabel}>Emergency Services</p>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>50k+</h3>
              <p style={styles.statLabel}>Happy Patients</p>
            </div>
          </div>
        </div>
        <div style={styles.heroImageWrapper}>
          <div style={styles.heroImageBg} />
          <img src={doctorHeroImg} alt="Professional Doctor" style={styles.heroImage} />
          {/* Floating badge */}
          <div style={styles.floatingBadge}>
            <div style={styles.floatingIconBox}>
              <Phone size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={styles.floatingBadgeText}>Emergency Hotline</p>
              <h4 style={styles.floatingBadgeTitle}>1-800-MED-HELP</h4>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={styles.quickActionsGrid}>
        <div style={styles.actionCard} onClick={() => handleStartSearch("Start symptom assessment")}>
          <div style={{ ...styles.actionIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Activity size={24} />
          </div>
          <h3 style={styles.actionTitle}>AI Symptom Checker</h3>
          <p style={styles.actionDesc}>Get instant AI-driven preliminary assessments.</p>
        </div>
        <div style={styles.actionCard} onClick={() => setCurrentTab('chat')}>
          <div style={{ ...styles.actionIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <MessageSquare size={24} />
          </div>
          <h3 style={styles.actionTitle}>AI Doctor Chat</h3>
          <p style={styles.actionDesc}>Ask medical questions and get detailed explanations.</p>
        </div>
        <div style={styles.actionCard} onClick={() => setCurrentTab('hospitals')}>
          <div style={{ ...styles.actionIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <MapPin size={24} />
          </div>
          <h3 style={styles.actionTitle}>Find Hospitals</h3>
          <p style={styles.actionDesc}>Locate nearby healthcare facilities instantly.</p>
        </div>
        <div style={styles.actionCard} onClick={() => setCurrentTab('firstaid')}>
          <div style={{ ...styles.actionIcon, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Pill size={24} />
          </div>
          <h3 style={styles.actionTitle}>Medicine Info</h3>
          <p style={styles.actionDesc}>Search for drugs, side effects, and dosages.</p>
        </div>
      </section>

      {/* WORKING HOURS & BOOKING ROW */}
      <BookAppointmentSection onBookAppointment={handleNewBookAppointment} />

      {/* SPECIALIST DOCTORS */}
      <section style={styles.sectionContainer} id="doctors">
        <div style={styles.sectionHeaderCenter}>
          <span style={styles.badgeLabel}>Our Medical Team</span>
          <h2 style={styles.sectionBigTitle}>Meet Our Specialist Doctors</h2>
          <p style={styles.sectionDescTextCenter}>
            Highly qualified professionals dedicated to providing the best healthcare services.
          </p>
        </div>

        <div style={styles.doctorsGrid}>
          {doctors.map((doc, idx) => (
            <div key={idx} style={styles.doctorCard}>
              <div style={styles.docCardHeader}>
                <div style={styles.docAvatarBox}>
                  <User size={24} color="var(--primary)" />
                </div>
                <div style={styles.docStatusBadge} data-available={doc.available ? "true" : "false"}>
                  <span style={{ 
                    width: 6, height: 6, borderRadius: '50%', 
                    backgroundColor: doc.available ? 'var(--success)' : 'var(--text-muted)' 
                  }} />
                  {doc.available ? 'Available Today' : 'Next: Tomorrow'}
                </div>
              </div>
              <h3 style={styles.docName}>{doc.name}</h3>
              <p style={styles.docSpec}>{doc.spec} • <span style={{ opacity: 0.7 }}>{doc.qual}</span></p>
              
              <div style={styles.docScheduleBox}>
                <div style={styles.docScheduleRow}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>{doc.days}</span>
                </div>
                <div style={styles.docScheduleRow}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>{doc.time}</span>
                </div>
              </div>

              <button 
                style={styles.docBookBtn}
                onClick={() => {
                  setFormData({ ...formData, department: doc.spec });
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Book Consultation
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section style={styles.sectionContainer} id="departments">
        <div style={styles.sectionHeaderCenter}>
          <span style={styles.badgeLabel}>Specialties</span>
          <h2 style={styles.sectionBigTitle}>Hospital Departments</h2>
        </div>
        
        <div style={styles.departmentsGrid}>
          {departments.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <div key={i} style={styles.deptCard}>
                <div style={styles.deptIconBox}>
                  <Icon size={24} color="var(--primary)" />
                </div>
                <h4 style={styles.deptTitle}>{dept.name}</h4>
                <p style={styles.deptDesc}>{dept.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footerContainer}>
        <div style={styles.footerTopGrid}>
          
          <div style={{ maxWidth: '300px' }}>
            <div style={styles.logoGroup}>
              <div style={{...styles.logoIconBadge, backgroundColor: 'rgba(255,255,255,0.1)'}}>
                <Activity size={18} color="#fff" />
              </div>
              <span style={{...styles.logoText, color: '#fff'}}>MediGuide Hospital</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '1rem', lineHeight: 1.6 }}>
              Providing world-class healthcare combined with cutting-edge AI technology for better patient outcomes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              <Phone size={18} />
              <Mail size={18} />
              <MapPin size={18} />
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Departments</h4>
            <div style={styles.footerLinksList}>
              <span style={styles.footerLink}>Cardiology</span>
              <span style={styles.footerLink}>Neurology</span>
              <span style={styles.footerLink}>Orthopedics</span>
              <span style={styles.footerLink}>Pediatrics</span>
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Quick Links</h4>
            <div style={styles.footerLinksList}>
              <span style={styles.footerLink} onClick={() => setCurrentTab('home')}>Home</span>
              <span style={styles.footerLink} onClick={() => document.getElementById('doctors')?.scrollIntoView()}>Find a Doctor</span>
              <span style={styles.footerLink} onClick={() => document.getElementById('booking')?.scrollIntoView()}>Book Appointment</span>
              <span style={styles.footerLink} onClick={() => setCurrentTab('chat')}>AI Assistant</span>
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Address</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              123 Medical Center Blvd<br />
              Healthcare City, HC 90210<br />
              Open 24/7 for Emergencies
            </p>
          </div>

        </div>

        <div style={styles.footerBottomRow}>
          <span>© 2026 MediGuide Hospital & AI Platform. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
    width: '100%',
    paddingBottom: '0rem'
  },
  
  // HEADER
  topHeaderNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-card)',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: '1rem',
    zIndex: 50,
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer'
  },
  logoIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em'
  },
  headerMenuNav: {
    display: 'flex',
    gap: '1.5rem',
  },
  menuLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color var(--transition-fast)'
  },
  headerCtaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)'
  },

  // HERO
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2rem',
    alignItems: 'center',
    minHeight: '600px',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  badgeLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: 700,
    width: 'fit-content'
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: 1.1,
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '90%',
    margin: 0,
  },
  heroCtaRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    padding: '0.8rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--border-color)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: 0,
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  statDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'var(--border-color)',
  },
  heroImageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageBg: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: 'var(--primary-light)',
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    zIndex: 0,
  },
  heroImage: {
    width: '90%',
    maxWidth: '500px',
    zIndex: 1,
    objectFit: 'contain',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: '10%',
    left: '0',
    backgroundColor: 'var(--bg-card)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    zIndex: 2,
    border: '1px solid var(--border-color)',
  },
  floatingIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadgeText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: 0,
    fontWeight: 600,
  },
  floatingBadgeTitle: {
    fontSize: '1.1rem',
    color: 'var(--text-main)',
    margin: 0,
    fontWeight: 800,
  },

  // QUICK ACTIONS
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: 'var(--shadow-sm)',
  },
  actionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text-main)',
  },
  actionDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.5,
  },

  // BOOKING & SCHEDULE ROW
  bookingRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '2rem',
  },
  workingHoursCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--border-color)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: 0,
  },
  workingDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '2rem',
    marginTop: 0,
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  scheduleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px dashed var(--border-color)',
  },
  scheduleDay: {
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  scheduleTime: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  emergencyBox: {
    marginTop: '2rem',
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bookingCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
  },
  bookingTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 0.5rem 0',
  },
  bookingSubtitle: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    margin: '0 0 2rem 0',
  },
  bookingForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  formInput: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  recentBookings: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  recentBookingsTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: '0 0 1rem 0',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  appointmentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    fontWeight: 500,
  },

  // COMMON SECTION STYLES
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  sectionHeaderCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  sectionBigTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: 0,
    lineHeight: 1.2,
  },
  sectionDescTextCenter: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
  },

  // DOCTORS GRID
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  doctorCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: 'var(--shadow-sm)',
  },
  docCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docAvatarBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docStatusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.3rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-main)',
  },
  docName: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0.5rem 0 0 0',
  },
  docSpec: {
    fontSize: '0.9rem',
    color: 'var(--primary)',
    fontWeight: 600,
    margin: 0,
  },
  docScheduleBox: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  docScheduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    fontWeight: 500,
  },
  docBookBtn: {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    border: '1px solid var(--primary)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all var(--transition-fast)',
  },

  // DEPARTMENTS
  departmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  deptCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  deptIconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: 0,
  },
  deptDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0,
  },

  // FOOTER
  footerContainer: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '4rem 2rem 2rem 2rem',
    borderRadius: 'var(--radius-lg)',
    marginTop: '2rem',
  },
  footerTopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
  },
  footerColTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#ffffff',
    margin: 0,
  },
  footerLinksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'color var(--transition-fast)',
    background: 'none',
    border: 'none',
    padding: 0,
    textAlign: 'left',
  },
  footerBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    flexWrap: 'wrap',
    gap: '1rem',
  }
};
