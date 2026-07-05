import { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { HOSPITALS, EMERGENCY_NUMBERS } from '../services/medicalData';

interface EmergencyHelpProps {
  setCurrentTab: (tab: string) => void;
}

export default function EmergencyHelp({ setCurrentTab }: EmergencyHelpProps) {
  const [activeInstruction, setActiveInstruction] = useState<string | null>('cpr');

  const emergencyHospitals = HOSPITALS.filter(h => h.isEmergency);

  const firstAidGuides = [
    {
      id: 'cpr',
      title: 'Cardiopulmonary Resuscitation (CPR)',
      steps: [
        '1. Check scene safety. Shake the person and shout "Are you okay?".',
        '2. Call 911 / 108 immediately or ask someone nearby to do so.',
        '3. Check for breathing. If not breathing, place the person flat on their back on a firm surface.',
        '4. Start compressions: Place heel of one hand in the center of the chest, other hand on top. Push hard and fast at a rate of 100-120 compressions per minute (to the beat of "Staying Alive").',
        '5. After 30 compressions, give 2 rescue breaths (tilt head, pinch nose, blow into mouth). Repeat cycles.'
      ]
    },
    {
      id: 'choking',
      title: 'Choking (Heimlich Maneuver)',
      steps: [
        '1. Stand behind the person, wrap your arms around their waist.',
        '2. Make a fist with one hand and place it slightly above the navel.',
        '3. Grasp the fist with your other hand and press hard into the abdomen with a quick, upward thrust.',
        '4. Perform 5 abdominal thrusts. Repeat until the object is expelled or the person becomes unconscious.',
        '5. If unconscious, lower them to the floor, call emergency services, and look for object in mouth.'
      ]
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding Control',
      steps: [
        '1. Put on sterile gloves if available. Remove obvious dirt from wound.',
        '2. Apply firm, direct pressure on the wound with a clean cloth or bandage.',
        '3. Elevate the injured limb above heart level if possible.',
        '4. If bleeding does not stop, apply pressure to the supplying artery (pressure points).',
        '5. Keep bandage in place. Do NOT remove soaked cloth, add more layers on top. Seek ER care.'
      ]
    },
    {
      id: 'burns',
      title: 'Immediate Help for Burns',
      steps: [
        '1. Immediately stop the burning process. Remove heat source.',
        '2. Cool the burn: Hold under cool running water (no ice) for 10-15 minutes.',
        '3. Remove tight jewelry or clothing near the burn before swelling begins.',
        '4. Cover loosely with clean, non-stick sterile gauze. Avoid popping blisters.',
        '5. Do NOT apply home remedies (oil, butter, toothpaste). Seek medical aid if skin is charred or blistered.'
      ]
    }
  ];

  const handleDial = (number: string) => {
    alert(`SIMULATION:\nAttempting to call emergency number: ${number}...\nDialer launched.`);
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Alert Header */}
      <div style={styles.emergencyBanner}>
        <ShieldAlert size={36} color="#ffffff" style={{ flexShrink: 0 }} />
        <div>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.6rem' }}>CRITICAL EMERGENCY DASHBOARD</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
            If you are experiencing severe symptoms like breathing distress or suspected heart attack, dial immediately.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3" style={styles.layout}>
        {/* Left Side: Call & ER hospital List */}
        <div style={styles.leftColumn}>
          {/* Quick Call Box */}
          <div className="glass-card" style={styles.hotlinesCard}>
            <h3 style={styles.boxTitle}>Global Emergency Codes</h3>
            <div style={styles.hotlinesGrid}>
              {Object.entries(EMERGENCY_NUMBERS).map(([region, info]) => (
                <div key={region} style={styles.hotlineRow}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{region} ({info.name})</strong>
                    <span style={styles.dialCode}>{info.code}</span>
                  </div>
                  <button 
                    onClick={() => handleDial(info.code)}
                    className="btn btn-danger"
                    style={styles.dialBtn}
                  >
                    <Phone size={14} /> Dial
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 ER Facilities */}
          <div className="glass-card" style={styles.erCard}>
            <h3 style={styles.boxTitle}>24/7 Emergency Rooms</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              These local clinics are simulated with full trauma and ICU beds.
            </p>
            
            <div style={styles.hospList}>
              {emergencyHospitals.map(hosp => (
                <div key={hosp.id} style={styles.hospRow}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{hosp.name}</strong>
                    <span style={styles.hospMeta}>Distance: {hosp.distance} km | Phone: {hosp.phone}</span>
                  </div>
                  <button 
                    onClick={() => handleDial(hosp.phone)}
                    className="btn btn-outline"
                    style={styles.hospCallBtn}
                    title="Call Clinic"
                  >
                    <Phone size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentTab('hospitals')}
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '1rem', fontSize: '0.85rem' }}
            >
              Open Interactive Emergency Map
            </button>
          </div>
        </div>

        {/* Right Side: First-Aid Guides Accordion */}
        <div style={styles.rightColumn} className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PlusCircle size={22} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Standard First-Aid Instructions</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Quick, reliable step guides to assist injured individuals until professional clinical assistance arrives.
          </p>

          <div style={styles.accordionContainer}>
            {firstAidGuides.map(guide => {
              const isOpen = activeInstruction === guide.id;
              return (
                <div 
                  key={guide.id} 
                  style={{
                    ...styles.accordionItem,
                    borderColor: isOpen ? 'var(--primary)' : 'var(--border-color)'
                  }}
                >
                  <button
                    onClick={() => setActiveInstruction(isOpen ? null : guide.id)}
                    style={{
                      ...styles.accordionHeader,
                      backgroundColor: isOpen ? 'var(--primary-light)' : 'transparent'
                    }}
                  >
                    <strong style={{ fontSize: '0.92rem', color: isOpen ? 'var(--primary-text)' : 'var(--text-main)' }}>
                      {guide.title}
                    </strong>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {isOpen && (
                    <div style={styles.accordionBody} className="fade-in">
                      {guide.steps.map((step, idx) => (
                        <p key={idx} style={styles.guideStepText}>
                          {step}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  emergencyBanner: {
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    padding: '1.5rem 2rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.25)'
  },
  layout: {
    width: '100%',
    alignItems: 'stretch'
  },
  leftColumn: {
    gridColumn: 'span 1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  hotlinesCard: {
    padding: '1.25rem'
  },
  boxTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)'
  },
  hotlinesGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem'
  },
  hotlineRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.6rem'
  },
  dialCode: {
    display: 'block',
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'var(--danger)'
  },
  dialBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    backgroundColor: 'var(--danger)',
    color: '#ffffff'
  },
  erCard: {
    padding: '1.25rem'
  },
  hospList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  hospRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem'
  },
  hospMeta: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  hospCallBtn: {
    padding: '0.3rem',
    borderRadius: 'var(--radius-sm)'
  },
  rightColumn: {
    gridColumn: 'span 2',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  accordionItem: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden' as const,
    transition: 'all var(--transition-normal)'
  },
  accordionHeader: {
    width: '100%',
    border: 'none',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'left' as const,
    outline: 'none',
    transition: 'background var(--transition-fast)'
  },
  accordionBody: {
    padding: '1rem',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    borderTop: '1px solid var(--border-color)'
  },
  guideStepText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  }
};
