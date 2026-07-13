import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers, Clock, MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface BookAppointmentSectionProps {
  onBookAppointment: (appointment: { date: string, time: string, name: string, department: string }) => void;
}

export default function BookAppointmentSection({ onBookAppointment }: BookAppointmentSectionProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(9);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    organization: '', 
    phone: '', 
    email: '', 
    setupType: '', 
    setupTypeOther: '',
    requirements: '' 
  });

  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    if (ticketRef.current) {
      const opt = {
        margin: 1,
        filename: `MediGuide-Appointment-${formData.name || 'Ticket'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(ticketRef.current).save();
    }
  };

  const days = [
    { num: 1, active: false }, { num: 2, active: false }, { num: 3, active: false }, { num: 4, active: false },
    { num: 5, active: false }, { num: 6, active: false }, { num: 7, active: false }, { num: 8, active: false },
    { num: 9, active: true }, { num: 10, active: true }, { num: 11, active: true },
    { num: 12, active: true }, { num: 13, active: true }, { num: 14, active: true }, { num: 15, active: true }, { num: 16, active: true }, { num: 17, active: true }, { num: 18, active: true },
    { num: 19, active: true }, { num: 20, active: true }, { num: 21, active: true }, { num: 22, active: true }, { num: 23, active: true }, { num: 24, active: true }, { num: 25, active: true },
    { num: 26, active: true }, { num: 27, active: true }, { num: 28, active: true }, { num: 29, active: true }, { num: 30, active: true }, { num: 31, active: true }
  ];

  const timeSlots = [
    '3:30 pm', '5:00 pm', '6:00 pm', '7:30 pm', '8:00 pm'
  ];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && formData.name && formData.organization) {
      onBookAppointment({
        date: `2026-07-${selectedDate.toString().padStart(2, '0')}`,
        time: selectedTime,
        name: formData.name,
        department: formData.organization // Mapping organization to department for compatibility
      });
      // Move to success step instead of resetting
      setStep(3);
    }
  };

  return (
    <section style={styles.container} id="booking">
      <div style={styles.gridBg}></div>
      <div style={styles.content}>
        
        {/* Left Side: Info */}
        <div style={styles.leftSide}>
          <div style={styles.badge}>
            <span style={styles.badgeText}>HEALTHCARE AGENTIC CLOUD</span>
          </div>
          <h2 style={styles.title}>
            Book your<br/>MediGuide demo.
          </h2>
          
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Layers size={20} color="var(--primary)" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Platform walkthrough</h4>
                <p style={styles.featureDesc}>Agentic cloud layers, workflows, and integrations — live on screen.</p>
              </div>
            </div>
            
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Clock size={20} color="var(--primary)" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Built for your setup</h4>
                <p style={styles.featureDesc}>Hospital, clinic, lab, pharmacy or institute — we tailor the session.</p>
              </div>
            </div>
            
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <MessageSquare size={20} color="var(--primary)" />
              </div>
              <div>
                <h4 style={styles.featureTitle}>Instant confirmation</h4>
                <p style={styles.featureDesc}>Slot confirmed by email and WhatsApp. No sales pressure.</p>
              </div>
            </div>
          </div>
          
          <div style={styles.bottomDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailVal}>30 min</span>
              <span style={styles.detailLabel}>SESSION</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailVal}>1-on-1</span>
              <span style={styles.detailLabel}>PRODUCT TEAM</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailVal}>IST</span>
              <span style={styles.detailLabel}>TIME SLOTS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Card */}
        <div style={styles.rightSide}>
          <div style={styles.card}>
            {step === 1 ? (
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.scheduleLabel}>SCHEDULE</span>
                  <h3 style={styles.cardTitle}>Choose date & time</h3>
                </div>
                <div style={styles.durationBadge}>IST - 30 MIN</div>
              </div>
            ) : null}
            
            <div style={styles.stepsIndicator}>
              <div style={{...styles.step, color: step >= 1 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: step >= 1 ? 700 : 500}}>
                <div style={{...styles.stepNum, backgroundColor: step >= 1 ? 'var(--text-main)' : 'var(--bg-secondary)', color: step >= 1 ? 'var(--bg-card)' : 'var(--text-muted)'}}>1</div>
                Date & time
              </div>
              <div style={styles.stepDivider}></div>
              <div style={{...styles.step, color: step >= 2 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: step >= 2 ? 700 : 500}}>
                <div style={{...styles.stepNum, backgroundColor: step >= 2 ? 'var(--text-main)' : 'var(--bg-secondary)', color: step >= 2 ? 'var(--bg-card)' : 'var(--text-muted)'}}>2</div>
                Your details
              </div>
            </div>

            {step === 3 ? (
              <div style={styles.formContainer}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={32} color="#fff" />
                  </div>
                  <h3 style={styles.formSectionTitle}>Booking Successful!</h3>
                  <p style={styles.formSectionSubtitle}>Your appointment has been confirmed.</p>
                </div>

                <div ref={ticketRef} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>MediGuide Appointment</h4>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>July {selectedDate}, 2026</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</span>
                      <span style={{ fontWeight: 700 }}>{formData.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Organization</span>
                      <span style={{ fontWeight: 700 }}>{formData.organization}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Time</span>
                      <span style={{ fontWeight: 700 }}>{selectedTime} IST</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Setup Type</span>
                      <span style={{ fontWeight: 700 }}>{formData.setupType === 'Other' ? formData.setupTypeOther : formData.setupType}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={handleDownloadPdf} style={{ ...styles.submitBtn, flex: 1, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', marginTop: 0 }}>
                    Download PDF
                  </button>
                  <button onClick={() => {
                    setStep(1);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setFormData({ name: '', organization: '', phone: '', email: '', setupType: '', setupTypeOther: '', requirements: '' });
                  }} style={{ ...styles.submitBtn, flex: 1, marginTop: 0 }}>
                    Book Another
                  </button>
                </div>
              </div>
            ) : step === 1 ? (
              <div style={styles.calendarContainer}>
                {/* Calendar Left */}
                <div style={styles.calendarArea}>
                  <div style={styles.monthSelector}>
                    <button style={styles.iconBtn}><ChevronLeft size={16} /></button>
                    <span style={styles.monthText}>July 2026</span>
                    <button style={styles.iconBtn}><ChevronRight size={16} /></button>
                  </div>
                  
                  <div style={styles.daysGrid}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                      <div key={d} style={styles.dayHeader}>{d}</div>
                    ))}
                    {/* Empty spots for July 2026 starting on Wed */}
                    <div style={styles.dayCell}></div>
                    <div style={styles.dayCell}></div>
                    <div style={styles.dayCell}></div>
                    
                    {days.map((day) => (
                      <div 
                        key={day.num} 
                        style={{
                          ...styles.dayCell, 
                          color: day.active ? (selectedDate === day.num ? 'var(--bg-card)' : 'var(--text-main)') : 'var(--text-light)',
                          backgroundColor: selectedDate === day.num ? 'var(--text-main)' : 'transparent',
                          cursor: day.active ? 'pointer' : 'default',
                          fontWeight: selectedDate === day.num ? 700 : 500
                        }}
                        onClick={() => day.active && setSelectedDate(day.num)}
                      >
                        {day.num}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Time Slots Right */}
                <div style={styles.timeSlotsArea}>
                  <div style={styles.selectedDateHeader}>
                    <span style={styles.selectedDateText}>Thu 9</span>
                    <div style={styles.formatToggle}>
                      <span style={{...styles.formatOption, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)'}}>12h</span>
                      <span style={{...styles.formatOption, color: 'var(--text-muted)'}}>24h</span>
                    </div>
                  </div>
                  
                  <div style={styles.slotsList}>
                    {timeSlots.map(time => (
                      <button 
                        key={time} 
                        style={styles.timeSlotBtn}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.formContainer}>
                
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  
                  <div style={styles.selectedDateTimeSummary}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>Thursday, 9 July - {selectedTime} IST</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <h3 style={styles.formSectionTitle}>Enter your details</h3>
                  <p style={styles.formSectionSubtitle}>We'll send confirmation to your email and WhatsApp.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>FULL NAME *</label>
                    <input 
                      style={styles.formInput} 
                      placeholder="Dr. Rahul Sharma"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>ORGANIZATION *</label>
                    <input 
                      style={styles.formInput} 
                      placeholder="City Hospital"
                      value={formData.organization} 
                      onChange={e => setFormData({...formData, organization: e.target.value})} 
                      list="org-suggestions"
                      required 
                    />
                    <datalist id="org-suggestions">
                      <option value="City Hospital" />
                      <option value="Apollo Clinic" />
                      <option value="Global Health Institute" />
                      <option value="St. Mary's Healthcare" />
                      <option value="Sunrise Medical Center" />
                    </datalist>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>PHONE *</label>
                      <input 
                        style={styles.formInput} 
                        placeholder="98765 43210"
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        required 
                      />
                      <span style={styles.formHelperText}>+91 added automatically for India numbers</span>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>EMAIL *</label>
                      <input 
                        type="email"
                        style={styles.formInput} 
                        placeholder="john@hospital.com"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>SETUP TYPE *</label>
                    <select 
                      style={styles.formSelect} 
                      value={formData.setupType} 
                      onChange={e => setFormData({...formData, setupType: e.target.value})} 
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Other">Other (Please specify)</option>
                    </select>
                    {formData.setupType === 'Other' && (
                      <input 
                        style={{ ...styles.formInput, marginTop: '0.5rem' }} 
                        placeholder="Type your setup type here..."
                        value={formData.setupTypeOther} 
                        onChange={e => setFormData({...formData, setupTypeOther: e.target.value})} 
                        required 
                      />
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>REQUIREMENTS</label>
                    <input 
                      style={styles.formInput} 
                      placeholder="OPD, IPD, billing, ABDM..."
                      value={formData.requirements} 
                      onChange={e => setFormData({...formData, requirements: e.target.value})} 
                      list="req-suggestions"
                    />
                    <datalist id="req-suggestions">
                      <option value="OPD & IPD Management" />
                      <option value="Billing & Pharmacy Integration" />
                      <option value="ABDM Compliance Setup" />
                      <option value="Laboratory Information System" />
                      <option value="Teleconsultation Module" />
                    </datalist>
                  </div>
                  
                  <button type="submit" style={styles.submitBtn}>Schedule Event</button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-main)',
    padding: '4rem 2rem',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '4rem',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
  },
  gridBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    zIndex: 0,
    opacity: 0.2
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'center'
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  badge: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.4rem 1rem',
    borderRadius: '2rem',
    border: '1px solid var(--border-color)',
    width: 'fit-content'
  },
  badgeText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)'
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: '-0.02em',
    color: 'var(--text-main)'
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    backgroundColor: 'var(--bg-card)',
    padding: '1.2rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)'
  },
  featureIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 0 0.3rem 0',
    color: 'var(--text-main)'
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.5
  },
  bottomDetails: {
    display: 'flex',
    gap: '2.5rem',
    marginTop: '1rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--border-color)'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem'
  },
  detailVal: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)'
  },
  detailLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 700,
    letterSpacing: '0.05em'
  },
  
  rightSide: {
    display: 'flex',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '550px',
    color: 'var(--text-main)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  scheduleLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: '0.2rem 0 0 0',
    color: 'var(--text-main)'
  },
  durationBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.3rem 0.8rem',
    borderRadius: '2rem',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-secondary)'
  },
  stepsIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem'
  },
  stepNum: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700
  },
  stepDivider: {
    height: '1px',
    flex: 1,
    backgroundColor: 'var(--border-color)'
  },
  calendarContainer: {
    display: 'flex',
    gap: '1.5rem'
  },
  calendarArea: {
    flex: 1.5,
    borderRight: '1px solid var(--border-color)',
    paddingRight: '1.5rem'
  },
  monthSelector: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  iconBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.3rem',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-main)'
  },
  monthText: {
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    textAlign: 'center'
  },
  dayHeader: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: '0.5rem'
  },
  dayCell: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: '0.85rem',
    margin: '0 auto'
  },
  timeSlotsArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  selectedDateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    height: '28px' // Match month selector height
  },
  selectedDateText: {
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  formatToggle: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '2rem',
    padding: '0.15rem',
    border: '1px solid var(--border-color)'
  },
  formatOption: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '2rem'
  },
  slotsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  timeSlotBtn: {
    padding: '0.7rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  
  /* Step 2 Form Styles */
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '2rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    width: 'fit-content'
  },
  selectedDateTimeSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '2rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    width: 'fit-content'
  },
  formSectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 0.3rem 0'
  },
  formSectionSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: 0
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  formLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  formInput: {
    padding: '0.8rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    outline: 'none',
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-primary)'
  },
  formSelect: {
    padding: '0.8rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    outline: 'none',
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer'
  },
  formTextarea: {
    padding: '0.8rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    outline: 'none',
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-primary)',
    minHeight: '80px',
    resize: 'vertical'
  },
  formHelperText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem'
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem'
  }
};
