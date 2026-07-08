import { useState } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Play, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Check, 
  Globe, 
  Lock, 
  Brain, 
  Stethoscope, 
  Users
} from 'lucide-react';
import doctorHeroImg from '../assets/doctor_hero.png';
import doctorNewsletterImg from '../assets/doctor_newsletter.png';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  setInitialChatText: (text: string) => void;
  lang: string;
}

export default function Home({ setCurrentTab, setInitialChatText, lang }: HomeProps) {
  // Satisfy TS unused variable checks
  if (lang === 'xyz') console.log(lang);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 4000);
  };

  const handleStartSearch = (query: string) => {
    setInitialChatText(query);
    setCurrentTab('chat');
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* 1. TOP HEALTHAI SUB-HEADER NAVIGATION BAR */}
      <header style={styles.topHeaderNav}>
        <div style={styles.logoGroup} onClick={() => setCurrentTab('home')}>
          <div style={styles.logoIconBadge}>
            <Activity size={18} color="#000" />
          </div>
          <span style={styles.logoText}>HealthAI</span>
        </div>

        <nav style={styles.headerMenuNav}>
          <button style={{ ...styles.menuLink, color: 'var(--text-main)', fontWeight: 800 }}>Home</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('diseases')}>About Us</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('firstaid')}>Innovation</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('labs')}>Research</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('hospitals')}>Careers</button>
          <button style={styles.menuLink} onClick={() => setCurrentTab('chat')}>Blog</button>
        </nav>

        <button 
          style={styles.headerCtaBtn}
          onClick={() => setCurrentTab('chat')}
        >
          <span>Our Solutions</span>
          <ArrowRight size={14} />
        </button>
      </header>


      {/* 2. HERO BENTO GRID SECTION */}
      <section style={styles.heroGridSection}>
        
        {/* Left Giant Card: Lime Pastel Grid Hero Banner */}
        <div style={styles.heroMainCard}>
          <div style={styles.heroGridBgOverlay} />

          <h1 style={styles.heroTitle}>
            Transforming <br />
            Healthcare with <br />
            Artificial Intelligence!
          </h1>

          <p style={styles.heroSubtitle}>
            Empowering your health journey with cutting-edge AI solutions for better diagnosis, personalized care, and faster results.
          </p>

          <div style={styles.heroCtaRow}>
            <button 
              style={styles.heroDarkPillBtn}
              onClick={() => handleStartSearch("Start my comprehensive health AI checkup")}
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>

            <button 
              style={styles.heroGlassPillBtn}
              onClick={() => setShowDemoModal(true)}
            >
              <Play size={14} fill="currentColor" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* User Avatars Floating Badge */}
          <div style={styles.heroAvatarsBadge}>
            <div style={styles.stackedAvatars}>
              <div style={{ ...styles.avatarCircle, backgroundColor: '#0284c7' }}>🩺</div>
              <div style={{ ...styles.avatarCircle, backgroundColor: '#0d9488', marginLeft: '-8px' }}>👨‍⚕️</div>
              <div style={{ ...styles.avatarCircle, backgroundColor: '#7c3aed', marginLeft: '-8px' }}>👩‍⚕️</div>
            </div>
            <span style={styles.avatarBadgeText}>+23 Specialists Online</span>
          </div>
        </div>

        {/* Right Top Card: Doctor Hero Image & Metric */}
        <div style={styles.heroDoctorCard}>
          <img 
            src={doctorHeroImg} 
            alt="Trusted Healthcare Collaborator" 
            style={styles.doctorImg}
          />
          <div style={styles.doctorOverlayBadge}>
            <div style={styles.badgeIconCircle}>
              <Users size={14} color="#000" />
            </div>
            <div>
              <span style={styles.badgeSmallLabel}>Our Trusted Collaborators</span>
              <h4 style={styles.badgeBigMetric}>49K+ <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Global Research Partnerships</span></h4>
            </div>
          </div>
        </div>

        {/* Right Bottom Card: Platform Progress Card */}
        <div style={styles.heroProgressCard}>
          <div style={styles.tagChipsRow}>
            <span style={styles.miniTagChip}>Smart</span>
            <span style={styles.miniTagChip}>Secure</span>
            <span style={styles.miniTagChip}>Scientific</span>
            <span style={styles.miniTagChip}>Scalable</span>
          </div>

          <h3 style={styles.progressCardTitle}>Trusted Platform for Progress</h3>

          {/* Floating 3D Orbit Nodes */}
          <div style={styles.orbitNodesContainer}>
            <div style={{ ...styles.orbitNode, backgroundColor: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed', top: '10px', right: '40px' }}>
              <Brain size={16} />
            </div>
            <div style={{ ...styles.orbitNode, backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', bottom: '15px', right: '80px' }}>
              <ShieldCheck size={16} />
            </div>
            <div style={{ ...styles.orbitNode, backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', bottom: '25px', left: '30px' }}>
              <Stethoscope size={16} />
            </div>
          </div>
        </div>

      </section>


      {/* 3. SECTION: HOW OUR AI WORKS FOR YOU */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionHeaderRow}>
          <div>
            <h2 style={styles.sectionBigTitle}>How Our AI <br />Works for You</h2>
          </div>
          <div style={{ maxWidth: '440px' }}>
            <p style={styles.sectionDescText}>
              AI is revolutionizing healthcare by enabling faster, more accurate diagnoses, personalized treatment plans, and improved patient outcomes. Experience the power of AI in healthcare today.
            </p>
            <button 
              style={styles.viewMoreBtn}
              onClick={() => setCurrentTab('chat')}
            >
              <span>View More</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Bento Feature Cards */}
        <div style={styles.featureCardsGrid}>
          
          {/* Card 01 */}
          <div style={styles.bentoFeatureCard} onClick={() => handleStartSearch("Explain personalized treatment AI recommendations")}>
            <div style={styles.cardTopBar}>
              <span style={styles.cardCategoryTitle}>Personalized Care</span>
              <div style={styles.arrowIconBtn}><ArrowUpRight size={16} /></div>
            </div>
            <p style={styles.cardDesc}>
              The AI generates personalized treatment suggestions to guide healthcare providers in making informed clinical decisions.
            </p>
            <div style={styles.cardFooter}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={styles.cardNumberText}>01</span>
            </div>
          </div>

          {/* Card 02 */}
          <div style={styles.bentoFeatureCardActive} onClick={() => handleStartSearch("How does medical data collection work?")}>
            <div style={styles.cardTopBar}>
              <span style={styles.cardCategoryTitle}>Data Collection</span>
              <div style={styles.arrowIconBtnActive}><ArrowUpRight size={16} /></div>
            </div>
            <p style={styles.cardDesc}>
              Our AI models gather health data from multiple sources like patient records, wearable devices, and diagnostic medical scans.
            </p>
            <div style={styles.cardFooter}>
              <Activity size={16} color="var(--primary)" />
              <span style={styles.cardNumberText}>02</span>
            </div>
          </div>

          {/* Card 03 */}
          <div style={styles.bentoFeatureCard} onClick={() => handleStartSearch("How does continuous health telemetry monitoring work?")}>
            <div style={styles.cardTopBar}>
              <span style={styles.cardCategoryTitle}>Continuous Monitoring</span>
              <div style={styles.arrowIconBtn}><ArrowUpRight size={16} /></div>
            </div>
            <p style={styles.cardDesc}>
              Our AI technology monitors progress and adjusts the care plan as needed, ensuring optimal long-term health outcomes.
            </p>
            <div style={styles.cardFooter}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span style={styles.cardNumberText}>03</span>
            </div>
          </div>
        </div>
      </section>



      {/* 4. SECTION: WHY CHOOSE OUR AI HEALTH SOLUTIONS? */}
      <section style={styles.whyChooseSection}>
        <div style={styles.centerSectionHeader}>
          <h2 style={styles.centerTitle}>Why Choose Our AI Health <br />Solutions?</h2>
          <p style={styles.centerSubtitle}>
            The AI generates personalized treatment suggestions to guide healthcare providers and patients in making informed decisions.
          </p>
        </div>

        <div style={styles.whyGrid}>
          
          {/* Card: Improved Accuracy */}
          <div style={styles.whyCard}>
            <span style={styles.whyCardLabel}>Improved Accuracy</span>
            <h4 style={styles.whyCardSub}>Served Across Regions</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Assist in diagnosing conditions with greater precision, reducing diagnostic errors worldwide.
            </p>
            
            {/* Country Pill Badges */}
            <div style={styles.countryPillGrid}>
              <span style={styles.countryPill}>🇺🇸 United States</span>
              <span style={styles.countryPill}>🇬🇧 United Kingdom</span>
              <span style={styles.countryPill}>🇨🇭 Switzerland</span>
              <span style={styles.countryPill}>🇵🇱 Poland</span>
            </div>
          </div>

          {/* Card: 24/7 Access */}
          <div style={styles.whyCard}>
            <span style={styles.whyCardLabel}>24/7 Access</span>
            <h4 style={styles.whyCardSub}>Online Consultations Completed</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Our AI tools are available anytime to assist doctors and patients with continuous care support.
            </p>

            <div style={styles.accessSphereVisual}>
              <div style={styles.sphereOrb}>
                <Globe size={32} color="var(--primary)" />
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* 6. SECTION: SUBSCRIBE TO NEWSLETTER BANNER */}
      <section style={styles.newsletterBanner}>
        <div style={styles.newsletterLeftContent}>
          <h2 style={styles.newsletterTitle}>Subscribe to <br />newsletter</h2>

          <form style={styles.newsletterForm} onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              style={styles.newsletterInput}
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" style={styles.newsletterSubmitBtn}>
              {subscribed ? <Check size={16} /> : <span>Subscribe</span>}
            </button>
          </form>

          {subscribed && (
            <div style={styles.subscribeSuccessToast}>
              <Check size={14} /> Subscribed successfully! Thank you for joining HealthAI.
            </div>
          )}

          {/* Floating Category Tag Pills */}
          <div style={styles.newsletterTagsRow}>
            <span style={styles.newsletterTagChip}>🩺 AI-powered health</span>
            <span style={styles.newsletterTagChip}>🍏 Wellness</span>
            <span style={styles.newsletterTagChip}>💡 Smart health</span>
            <span style={styles.newsletterTagChip}>🔍 Symptom checker</span>
          </div>
        </div>

        <div style={styles.newsletterRightDoctor}>
          <img 
            src={doctorNewsletterImg} 
            alt="HealthAI Doctor Newsletter" 
            style={styles.doctorNewsletterImg}
          />
        </div>
      </section>


      {/* 7. FOOTER NAVIGATION */}
      <footer style={styles.footerContainer}>
        <div style={styles.footerTopGrid}>
          
          <div style={{ maxWidth: '300px' }}>
            <div style={styles.logoGroup}>
              <div style={styles.logoIconBadge}>
                <Activity size={18} color="#000" />
              </div>
              <span style={styles.logoText}>HealthAI</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              Healthcare tools are intended to assist, not replace clinical professionals. Always consult your provider for medical advice.
            </p>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Quick Links</h4>
            <div style={styles.footerLinksList}>
              <button style={styles.footerLink} onClick={() => setCurrentTab('home')}>Home</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('diseases')}>About Us</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('chat')}>Blog</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('hospitals')}>Contact Us</button>
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>AI Technology</h4>
            <div style={styles.footerLinksList}>
              <button style={styles.footerLink} onClick={() => setCurrentTab('chat')}>AI-powered health</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('firstaid')}>Wellness</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('labs')}>Smart health</button>
              <button style={styles.footerLink} onClick={() => setCurrentTab('diseases')}>Symptom checker</button>
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Security</h4>
            <div style={styles.footerLinksList}>
              <span style={styles.footerStaticText}><Lock size={12} /> HIPAA Compliant</span>
              <span style={styles.footerStaticText}><ShieldCheck size={12} /> 256-bit Encryption</span>
              <span style={styles.footerStaticText}><Check size={12} /> ISO 27001 Certified</span>
            </div>
          </div>

        </div>

        <div style={styles.footerBottomRow}>
          <span>© 2026 HealthAI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms & Conditions</span>
          </div>
        </div>
      </footer>


      {/* DEMO INTERACTIVE MODAL */}
      {showDemoModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDemoModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
              HealthAI Platform Overview Demo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem 0' }}>
              Experience how our Artificial Intelligence platform synthesizes patient records, diagnostic scans, and clinical telemetry to deliver high-precision recommendations.
            </p>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                <Brain size={18} />
                <span>Neural Diagnostic Model Active</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Processing multi-vector symptom checks and differential diagnosis matching in sub-second response times.
              </span>
            </div>
            <button 
              style={{ ...styles.heroDarkPillBtn, width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
              onClick={() => {
                setShowDemoModal(false);
                setCurrentTab('chat');
              }}
            >
              <span>Launch Live AI Assistant</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2.5rem',
    width: '100%',
    paddingBottom: '2rem'
  },
  topHeaderNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-card)',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
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
    backgroundColor: '#86efac',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(134, 239, 172, 0.6)'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em'
  },
  headerMenuNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  menuLink: {
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'color var(--transition-fast)'
  },
  headerCtaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--text-main)',
    color: 'var(--bg-primary)',
    border: 'none',
    padding: '0.55rem 1.2rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  heroGridSection: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.8fr',
    gridTemplateRows: 'auto auto',
    gap: '1.25rem'
  },
  heroMainCard: {
    gridRow: '1 / span 2',
    position: 'relative' as const,
    backgroundColor: '#dcfce7', // Soft mint/lime pastel matching mockup
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '440px',
    overflow: 'hidden',
    border: '1px solid rgba(134, 239, 172, 0.4)'
  },
  heroGridBgOverlay: {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: 'radial-gradient(#bbf7d0 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    opacity: 0.6,
    pointerEvents: 'none' as const
  },
  heroTitle: {
    position: 'relative' as const,
    zIndex: 2,
    fontSize: '2.4rem',
    fontWeight: 900,
    color: '#052e16',
    lineHeight: 1.12,
    letterSpacing: '-0.03em',
    margin: 0
  },
  heroSubtitle: {
    position: 'relative' as const,
    zIndex: 2,
    fontSize: '0.92rem',
    color: '#166534',
    margin: '1.25rem 0',
    maxWidth: '480px',
    lineHeight: 1.5
  },
  heroCtaRow: {
    position: 'relative' as const,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginTop: '1rem'
  },
  heroDarkPillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: '#052e16',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.4rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.9rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(5, 46, 22, 0.25)'
  },
  heroGlassPillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(8px)',
    color: '#052e16',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    padding: '0.75rem 1.4rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  heroAvatarsBadge: {
    position: 'relative' as const,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(6px)',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content'
  },
  stackedAvatars: {
    display: 'flex',
    alignItems: 'center'
  },
  avatarCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#fff',
    border: '2px solid #fff'
  },
  avatarBadgeText: {
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#052e16'
  },
  heroDoctorCard: {
    position: 'relative' as const,
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    height: '260px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)'
  },
  doctorImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    objectPosition: 'top center'
  },
  doctorOverlayBadge: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    right: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(8px)',
    borderRadius: 'var(--radius-md)',
    padding: '0.6rem 0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)'
  },
  badgeIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#86efac',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeSmallLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const
  },
  badgeBigMetric: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 900,
    color: 'var(--text-main)'
  },
  heroProgressCard: {
    position: 'relative' as const,
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    height: '160px'
  },
  tagChipsRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap' as const
  },
  miniTagChip: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)'
  },
  progressCardTitle: {
    fontSize: '1.1rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    margin: 0
  },
  orbitNodesContainer: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const
  },
  orbitNode: {
    position: 'absolute' as const,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  howItWorksSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.75rem',
    marginTop: '1rem'
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%'
  },
  sectionBigTitle: {
    fontSize: '2.1rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    margin: 0
  },
  sectionDescText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0
  },
  viewMoreBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    cursor: 'pointer',
    marginTop: '0.75rem'
  },
  featureCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1.25rem'
  },
  bentoFeatureCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '200px',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)'
  },
  bentoFeatureCardActive: {
    backgroundColor: 'var(--primary-light)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '200px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.2)'
  },
  cardTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardCategoryTitle: {
    fontSize: '1.05rem',
    fontWeight: 900,
    color: 'var(--text-main)'
  },
  arrowIconBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-main)'
  },
  arrowIconBtnActive: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#86efac',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#052e16'
  },
  cardDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: '1rem 0'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardNumberText: {
    fontSize: '1.25rem',
    fontWeight: 900,
    color: 'var(--text-muted)',
    fontFamily: 'monospace'
  },
  whyChooseSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2rem',
    marginTop: '1.5rem'
  },
  centerSectionHeader: {
    textAlign: 'center' as const,
    maxWidth: '560px'
  },
  centerTitle: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    margin: 0
  },
  centerSubtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    marginTop: '0.75rem',
    lineHeight: 1.5
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
    width: '100%'
  },
  whyCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.75rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  whyCardLabel: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const
  },
  whyCardSub: {
    fontSize: '1.2rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    margin: 0
  },
  countryPillGrid: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    marginTop: '1rem'
  },
  countryPill: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.3rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)'
  },
  accessSphereVisual: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '0.5rem'
  },
  sphereOrb: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(134, 239, 172, 0.4)'
  },
  telemetry3DSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
    marginTop: '1rem'
  },
  telemetryCardContainer: {
    width: '100%'
  },
  newsletterBanner: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    backgroundColor: '#bbf7d0', // Soft mint banner
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    overflow: 'hidden',
    alignItems: 'center',
    border: '1px solid #86efac'
  },
  newsletterLeftContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  newsletterTitle: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#052e16',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    margin: 0
  },
  newsletterForm: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-full)',
    padding: '0.35rem 0.4rem 0.35rem 1rem',
    maxWidth: '420px',
    boxShadow: '0 4px 14px rgba(5, 46, 22, 0.1)'
  },
  newsletterInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    color: '#052e16'
  },
  newsletterSubmitBtn: {
    backgroundColor: '#052e16',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: 800,
    cursor: 'pointer'
  },
  subscribeSuccessToast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#15803d'
  },
  newsletterTagsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    marginTop: '0.5rem'
  },
  newsletterTagChip: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#052e16',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: '0.3rem 0.75rem',
    borderRadius: 'var(--radius-full)'
  },
  newsletterRightDoctor: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '240px'
  },
  doctorNewsletterImg: {
    height: '100%',
    objectFit: 'contain' as const
  },
  footerContainer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '2.5rem',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem'
  },
  footerTopGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
    gap: '2rem'
  },
  footerColTitle: {
    fontSize: '0.9rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    marginBottom: '0.85rem'
  },
  footerLinksList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  footerLink: {
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: 0
  },
  footerStaticText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  footerBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem'
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)'
  }
};
