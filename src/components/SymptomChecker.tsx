import { useState } from 'react';
import { Stethoscope, AlertTriangle, ShieldCheck, ArrowRight, Mic } from 'lucide-react';
import { SYMPTOMS, saveDiagnosisReport, predictDiseases } from '../services/medicalData';

interface SymptomCheckerProps {
  onAssessComplete: (reportId: string) => void;
}

export default function SymptomChecker({ onAssessComplete }: SymptomCheckerProps) {
  // Step State
  const [step, setStep] = useState(1);
  
  // Form State
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('Female');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('1-3 days');
  const [severity, setSeverity] = useState<string>('Moderate');
  const [conditions, setConditions] = useState<string>('');
  
  // Search state for symptoms
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Group symptoms by category
  const categories = {
    general: 'General Body Symptoms',
    respiratory: 'Respiratory & Breathing',
    digestive: 'Digestive & Stomach',
    skin: 'Skin & Dermatological',
    neurological: 'Neurological & Brain',
    psychological: 'Mental & Psychological'
  };

  const handleSymptomToggle = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  // Voice Search Symptom Recognition
  const handleVoiceSearch = () => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const phrase = event.results[0][0].transcript.toLowerCase();
      setSearchTerm(phrase);
      setIsListening(false);
      
      // Auto-toggle match
      const matched = SYMPTOMS.find(s => 
        Object.values(s.name).some(val => val.toLowerCase().includes(phrase))
      );
      if (matched) {
        handleSymptomToggle(matched.id);
        alert(`Automatically selected symptom: ${matched.name.en}`);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Submit assessment
  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom.');
      return;
    }

    const predictions = predictDiseases(selectedSymptoms);
    
    // Determine Specialist
    let specialist = 'General Physician';
    if (predictions.length > 0) {
      const topDisease = predictions[0].diseaseId;
      if (topDisease === 'covid19') specialist = 'Pulmonologist';
      if (topDisease === 'migraine') specialist = 'Neurologist';
      if (topDisease === 'hypertension') specialist = 'Cardiologist';
      if (topDisease === 'dermatitis') specialist = 'Dermatologist';
      if (topDisease === 'asthma') specialist = 'Pediatrician';
    } else if (age < 12) {
      specialist = 'Pediatrician';
    }

    const report = saveDiagnosisReport({
      age,
      gender,
      selectedSymptoms,
      duration,
      severity,
      conditions,
      predictions,
      recommendedSpecialist: specialist
    });

    onAssessComplete(report.id);
  };

  const filteredSymptoms = SYMPTOMS.filter(sym => 
    sym.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sym.name.es.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sym.name.hi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <Stethoscope size={28} color="var(--primary)" />
        <h2>Symptom Assessment Tool</h2>
      </div>

      {/* Progress Stepper */}
      <div style={styles.stepper}>
        {[1, 2, 3].map(num => (
          <div key={num} style={styles.stepIndicatorWrapper}>
            <div 
              style={{
                ...styles.stepIndicator,
                backgroundColor: step >= num ? 'var(--primary)' : 'var(--bg-secondary)',
                color: step >= num ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              {num}
            </div>
            <span style={{ 
              ...styles.stepLabel, 
              color: step === num ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: step === num ? 700 : 500
            }}>
              {num === 1 ? 'Demographics' : num === 2 ? 'Symptoms' : 'Severity & History'}
            </span>
            {num < 3 && <div style={{...styles.stepConnector, backgroundColor: step > num ? 'var(--primary)' : 'var(--border-color)'}} />}
          </div>
        ))}
      </div>

      {/* Steps View */}
      <div className="glass-card" style={styles.card}>
        {/* STEP 1: Demographics */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3>Demographics Information</h3>
            <p>Please enter basic details. Age helps filter diseases specific to children or elderly adults.</p>
            
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                className="form-control"
                value={age}
                onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                max={120}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Gender at Birth</label>
              <div style={styles.pillsRow}>
                {['Female', 'Male', 'Non-binary'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      ...styles.pillBtn,
                      backgroundColor: gender === g ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: gender === g ? '#ffffff' : 'var(--text-main)'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => setStep(2)}
              style={styles.nextBtn}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Symptoms Selection */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3>Select Your Symptoms</h3>
            <p>Check all symptoms you are experiencing. Use voice dictation to quickly check a symptom.</p>
            
            {/* Search + Voice box */}
            <div style={styles.searchRow}>
              <input
                type="text"
                className="form-control"
                placeholder="Search symptom list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleVoiceSearch} 
                style={{
                  ...styles.micBtn,
                  backgroundColor: isListening ? 'var(--danger-light)' : 'var(--bg-secondary)',
                  color: isListening ? 'var(--danger)' : 'var(--text-muted)'
                }}
              >
                <Mic size={18} />
              </button>
            </div>

            {/* Selected Symptoms Count */}
            {selectedSymptoms.length > 0 && (
              <div style={styles.selectedCountBadge}>
                <span className="pulse-indicator"></span>
                <strong>{selectedSymptoms.length}</strong> symptoms selected.
              </div>
            )}

            {/* Categorized Checkbox List */}
            <div style={styles.symptomsListContainer}>
              {Object.entries(categories).map(([catKey, catLabel]) => {
                const catSyms = filteredSymptoms.filter(s => s.category === catKey);
                if (catSyms.length === 0) return null;

                return (
                  <div key={catKey} style={styles.categoryBlock}>
                    <h4 style={styles.categoryTitle}>{catLabel}</h4>
                    <div style={styles.checkboxGrid}>
                      {catSyms.map(sym => {
                        const isChecked = selectedSymptoms.includes(sym.id);
                        return (
                          <label 
                            key={sym.id} 
                            style={{
                              ...styles.checkboxLabel,
                              borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                              backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSymptomToggle(sym.id)}
                              style={styles.checkboxInput}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {sym.name.en} ({sym.name.hi})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.buttonGroup}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(3)}
                disabled={selectedSymptoms.length === 0}
              >
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Severity, Duration & Chronic Conditions */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h3>Assessment Parameters</h3>
            <p>Define duration and severity. This sets the risk classification levels for predictions.</p>

            <div className="form-group">
              <label className="form-label">Symptom Duration</label>
              <div style={styles.pillsRow}>
                {['< 24 hours', '1-3 days', '4-7 days', '1-2 weeks', '2+ weeks'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    style={{
                      ...styles.pillBtn,
                      backgroundColor: duration === d ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: duration === d ? '#ffffff' : 'var(--text-main)'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Overall Severity</label>
              <div style={styles.pillsRow}>
                {['Mild', 'Moderate', 'Severe'].map(s => {
                  let color = 'var(--primary)';
                  if (s === 'Moderate') color = 'var(--warning)';
                  if (s === 'Severe') color = 'var(--danger)';

                  const isSelected = severity === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      style={{
                        ...styles.pillBtn,
                        backgroundColor: isSelected ? color : 'var(--bg-secondary)',
                        color: isSelected ? '#ffffff' : 'var(--text-main)',
                        borderColor: isSelected ? 'transparent' : 'var(--border-color)'
                      }}
                    >
                      {s === 'Severe' && <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Existing Chronic Conditions (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Hypertension, Diabetes, Asthma"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
            </div>

            <div style={{ ...styles.disclaimerBox, display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <ShieldCheck size={20} color="var(--success)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Your diagnostic reports are saved in browser storage (localStorage) for historical records. We do not store health metrics on remote servers.
              </span>
            </div>

            <div style={styles.buttonGroup}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} style={styles.submitBtn}>
                Evaluate Diagnosis Report
              </button>
            </div>
          </div>
        )}
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.5rem 0',
    overflowX: 'auto' as const
  },
  stepIndicatorWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative' as const,
    flex: 1
  },
  stepIndicator: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    transition: 'all var(--transition-fast)'
  },
  stepLabel: {
    fontSize: '0.85rem',
    whiteSpace: 'nowrap' as const
  },
  stepConnector: {
    height: '2px',
    flex: 1,
    minWidth: '20px',
    margin: '0 0.5rem'
  },
  card: {
    padding: '2rem'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  pillsRow: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap' as const
  },
  pillBtn: {
    border: '1px solid var(--border-color)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)'
  },
  nextBtn: {
    alignSelf: 'flex-start',
    marginTop: '1rem'
  },
  searchRow: {
    display: 'flex',
    gap: '0.6rem',
    marginBottom: '0.5rem'
  },
  micBtn: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  selectedCountBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    alignSelf: 'flex-start'
  },
  symptomsListContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    maxHeight: '350px',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem',
    marginTop: '0.5rem'
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem'
  },
  categoryTitle: {
    fontSize: '0.95rem',
    fontWeight: 800,
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
    color: 'var(--text-main)'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.6rem'
  },
  checkboxLabel: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: 'all var(--transition-fast)'
  },
  checkboxInput: {
    accentColor: 'var(--primary)',
    width: '16px',
    height: '16px'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem'
  },
  disclaimerBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--radius-md)'
  },
  submitBtn: {
    boxShadow: 'var(--shadow-md)'
  }
};
