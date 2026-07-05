import { useState, useEffect, useMemo } from 'react';
import { Info, AlertTriangle, FileText, Mic, Search } from 'lucide-react';
import { MEDICINES, type Medicine } from '../services/medicalData';

interface MedicineInfoProps {
  lang: string;
}

export default function MedicineInfo({ lang }: MedicineInfoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Dynamic Medicine Profile Generator (Type-Safe, crash-proof)
  const generateDynamicMedicine = (name: string): Medicine => {
    const cleanName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
    
    let category = "Therapeutic Pharmacological Agent";
    let uses = "Symptomatic treatment and clinical management of indicated conditions.";
    let sideEffects = "Nausea, gastrointestinal discomfort, mild headache, or allergic skin reactions.";
    let precautions = "Always inspect the medicine package leaflet. Consult a doctor or pharmacist prior to use if pregnant, lactating, or if hepatic/renal impairment exists.";
    let storage = "Store at room temperature between 15°C and 30°C (59°F to 86°F), away from direct sunlight, moisture, and reach of children.";
    
    const lowerName = cleanName.toLowerCase();
    
    if (lowerName.endsWith('cillin') || lowerName.endsWith('mycin') || lowerName.endsWith('xacin') || lowerName.endsWith('cyclines') || lowerName.endsWith('penem')) {
      category = "Antibiotic / Antimicrobial Agent";
      uses = "Treatment of bacterial infections of the respiratory tract, skin, urinary tract, or soft tissue. Not effective against viral infections (like colds or flu).";
      sideEffects = "Diarrhea, stomach upset, nausea, vomiting, mild skin rash, or secondary fungal infections (thrush).";
      precautions = "Complete the full prescribed course even if symptoms resolve earlier to prevent bacterial resistance. Seek immediate help if severe watery diarrhea develops.";
    } else if (lowerName.endsWith('prazole') || lowerName.endsWith('tidine')) {
      category = "Proton Pump Inhibitor / Antacid";
      uses = "Management of gastroesophageal reflux disease (GERD), gastric or duodenal ulcers, and excessive acid secretion conditions.";
      sideEffects = "Headache, diarrhea or constipation, abdominal pain, flatulence, or dry mouth.";
      precautions = "Take ideally 30-60 minutes before breakfast. Prolonged use may require monitoring of magnesium and vitamin B12 levels.";
    } else if (lowerName.endsWith('lol') || lowerName.endsWith('pine') || lowerName.endsWith('pril') || lowerName.endsWith('sartan') || lowerName.endsWith('zosin')) {
      category = "Antihypertensive / Cardiovascular Drug";
      uses = "Management of hypertension (high blood pressure), angina pectoris, cardiac arrhythmias, or post-myocardial infarction care.";
      sideEffects = "Fatigue, cold extremities, bradycardia (slow heart rate), lightheadedness, or orthostatic hypotension.";
      precautions = "Do not discontinue abruptly as it may cause rebound high blood pressure or cardiac complications. Regularly monitor blood pressure and pulse rate.";
    } else if (lowerName.endsWith('pam') || lowerName.endsWith('lam') || lowerName.endsWith('pine') || lowerName.endsWith('tal')) {
      category = "Anxiolytic / Sedative Agent";
      uses = "Short-term relief of severe anxiety disorders, panic attacks, insomnia, acute muscle spasms, or seizure control.";
      sideEffects = "Drowsiness, ataxia, motor impairment, fatigue, forgetfulness, or slowed reflexes.";
      precautions = "High potential for tolerance, dependence, and withdrawal symptoms. Avoid operating machinery or driving. Strictly avoid concurrent alcohol use.";
    } else if (lowerName.endsWith('profen') || lowerName.endsWith('fenac') || lowerName.endsWith('cam') || lowerName.includes('aspirin') || lowerName.endsWith('coxib')) {
      category = "NSAID (Non-Steroidal Anti-Inflammatory Drug)";
      uses = "Relief of mild-to-moderate inflammatory pain, osteoarthritic symptoms, rheumatoid arthritis, dysmenorrhea, or general dental pain.";
      sideEffects = "Gastric irritation, heartburn, dyspepsia, fluid retention, or elevated blood pressure.";
      precautions = "Take with or after food to minimize gastrointestinal discomfort. Avoid use if history of active peptic ulcers or severe renal dysfunction is present.";
    } else if (lowerName.includes('paracetamol') || lowerName.includes('acetaminophen') || lowerName.includes('calpol') || lowerName.includes('dolo') || lowerName.includes('crocin')) {
      category = "Analgesic & Antipyretic (Pain & Fever Reliever)";
      uses = "Management of mild to moderate pain (including headaches, toothache, muscle aches) and reduction of fever.";
      sideEffects = "Rare when taken at recommended dosages. Excess dosage can lead to severe hepatotoxicity (liver damage).";
      precautions = "Strictly adhere to the maximum daily limit (4000mg in 24 hours). Avoid taking concurrently with other products containing paracetamol.";
    } else if (lowerName.endsWith('tadine') || lowerName.endsWith('rizine') || lowerName.endsWith('ramine') || lowerName.includes('hist') || lowerName.endsWith('astine')) {
      category = "Antihistamine (Allergy Treatment)";
      uses = "Symptomatic relief of seasonal allergic rhinitis (hay fever), hives, allergic conjunctivitis, or minor insect bite reactions.";
      sideEffects = "Drowsiness (mostly in first-generation variants), dry mouth, blurred vision, or urinary retention.";
      precautions = "Avoid driving or operating machinery if drowsiness occurs. Use caution when co-administering with other central nervous system depressants.";
    } else if (lowerName.endsWith('statin')) {
      category = "HMG-CoA Reductase Inhibitor (Cholesterol Lowering Statin)";
      uses = "Reduction of elevated total cholesterol, LDL cholesterol, and triglycerides, and to raise HDL cholesterol. Helps reduce risk of stroke and heart attack.";
      sideEffects = "Mild muscle pain (myalgia), headache, digestive system discomfort, or slight elevation in liver enzyme levels.";
      precautions = "Avoid consumption of excessive quantities of grapefruit juice. Contact your physician immediately if unexplained muscle pain or weakness occurs.";
    } else if (lowerName.endsWith('glim') || lowerName.endsWith('glip') || lowerName.endsWith('formin') || lowerName.includes('insulin') || lowerName.endsWith('tide')) {
      category = "Antidiabetic Agent / Hypoglycemic";
      uses = "Improvement of glycemic control in adults with type 2 diabetes mellitus as an adjunct to diet and physical exercise.";
      sideEffects = "Diarrhea, nausea, vomiting, metallic taste, abdominal bloating, or hypoglycemia (low blood sugar) if co-administered with sulfonylureas.";
      precautions = "Take with meals to reduce gastrointestinal side effects. Monitor kidney function regularly. Discontinue temporarily before contrast-dye imaging procedures.";
    } else if (lowerName.endsWith('nide') || lowerName.endsWith('sone') || lowerName.endsWith('lone') || lowerName.includes('cort')) {
      category = "Corticosteroid / Anti-inflammatory Steroid";
      uses = "Treatment of severe inflammatory and allergic conditions, including asthma, rheumatoid arthritis, severe skin disorders, or immune system suppression.";
      sideEffects = "Increased appetite, weight gain, insomnia, fluid retention, mood fluctuations, or elevated blood glucose levels.";
      precautions = "Do not stop using suddenly if taken for long periods (requires gradual tapering). Prolonged use may increase susceptibility to infections.";
    } else if (lowerName.includes('cough') || lowerName.includes('cold') || lowerName.endsWith('fed') || lowerName.includes('phen') || lowerName.includes('expectorant')) {
      category = "Decongestant / Cough Expectorant";
      uses = "Relief of nasal and sinus congestion due to common cold or allergies, and clearing bronchial mucus.";
      sideEffects = "Restlessness, elevated heart rate, insomnia, mild headache, or dry nose/throat.";
      precautions = "Use caution if you have high blood pressure, thyroid disorders, or coronary artery disease. Do not use nasal decongestant sprays for more than 3-5 consecutive days.";
    }

    return {
      name: cleanName,
      category,
      uses: {
        en: uses,
        es: uses,
        hi: uses
      },
      sideEffects: {
        en: sideEffects,
        es: sideEffects,
        hi: sideEffects
      },
      precautions: {
        en: precautions,
        es: precautions,
        hi: precautions
      },
      storage: {
        en: storage,
        es: storage,
        hi: storage
      }
    };
  };

  // Memoized medicine list filter to prevent re-render loops
  const filteredMeds = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return MEDICINES;

    // Filter static medicine records
    const matches = MEDICINES.filter(med => 
      med && med.name && (
        med.name.toLowerCase().includes(term) ||
        (med.category && med.category.toLowerCase().includes(term))
      )
    );

    // Generate dynamic match if no exact match exists
    const hasExactMatch = MEDICINES.some(med => med && med.name && med.name.toLowerCase() === term);
    if (!hasExactMatch && term.length >= 1) {
      const dynamicMed = generateDynamicMedicine(searchTerm);
      return [dynamicMed, ...matches];
    }

    return matches;
  }, [searchTerm]);

  // Auto-select first matching medicine safely
  useEffect(() => {
    if (filteredMeds && filteredMeds.length > 0) {
      setSelectedMed(filteredMeds[0]);
    } else {
      setSelectedMed(null);
    }
  }, [filteredMeds]);

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
      const phrase = event.results[0][0].transcript;
      setSearchTerm(phrase);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Crash-proof text extractor helper
  const getMedText = (fieldData: any, langKey: string): string => {
    if (!fieldData) return 'No specific clinical information recorded.';
    if (typeof fieldData === 'string') return fieldData;
    if (typeof fieldData === 'object') {
      return fieldData[langKey] || fieldData['en'] || Object.values(fieldData)[0] || 'No specific clinical information recorded.';
    }
    return String(fieldData);
  };

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <FileText size={28} color="var(--clinic-primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Medicine Reference Library</h2>
      </div>

      <div className="grid grid-cols-3" style={styles.layout}>
        {/* Left Side: Search Panel */}
        <div style={styles.searchPanel} className="glass-card">
          <h3 style={styles.panelTitle}>Search Catalog</h3>
          <p style={styles.panelDesc}>Search any drug name to view safe pharmacological reference values.</p>
          
          {/* Prevent form submission from reloading the app */}
          <form onSubmit={(e) => e.preventDefault()} style={styles.searchBox}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search any medicine (e.g. Paracetamol, Metformin)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', height: '40px' }}
              />
            </div>
            <button 
              type="button" 
              onClick={handleVoiceSearch} 
              style={{
                ...styles.micBtn,
                backgroundColor: isListening ? 'var(--danger-light)' : 'var(--bg-secondary)',
                color: isListening ? 'var(--danger)' : 'var(--text-muted)'
              }}
              title="Voice Search"
            >
              <Mic size={16} />
            </button>
          </form>

          <div style={styles.divider} />

          {/* Matches List */}
          <div style={styles.medsList}>
            {filteredMeds.length === 0 ? (
              <p style={styles.emptyText}>No matches found. Try typing a generic medicine name.</p>
            ) : (
              filteredMeds.map(med => {
                const isSelected = selectedMed?.name === med.name;
                const isDynamic = !MEDICINES.some(m => m.name === med.name);
                return (
                  <div
                    key={med.name}
                    onClick={() => setSelectedMed(med)}
                    style={{
                      ...styles.medItemCard,
                      borderColor: isSelected ? 'var(--clinic-primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(45, 212, 191, 0.08)' : 'var(--clinic-card-bg)',
                      boxShadow: isSelected ? '0 0 10px rgba(45, 212, 191, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: isSelected ? 'var(--clinic-primary)' : 'var(--text-main)', fontSize: '0.85rem' }}>
                        {med.name}
                      </strong>
                      {isDynamic && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: 'var(--clinic-primary)', color: 'var(--clinic-btn-text)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)' }}>
                          AI Match
                        </span>
                      )}
                    </div>
                    <span style={styles.medCatLabel}>{med.category}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Details View */}
        <div style={styles.detailsPanel} className="glass-card">
          {selectedMed ? (
            <div style={styles.detailsContent} className="fade-in">
              <div style={styles.detailsHeader}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{selectedMed.name}</h3>
                  <span style={styles.medCatBadge}>{selectedMed.category}</span>
                </div>
              </div>

              {/* Warning Alert */}
              <div style={styles.dosageWarning}>
                <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>CRITICAL INFORMATION:</strong> In compliance with safety regulations, dosage quantities are omitted. Please consult your physician/pharmacist for exact dosing schedules.
                </span>
              </div>

              {/* Details Sections */}
              <div style={styles.infoBlocks}>
                <div style={styles.infoBlock}>
                  <strong style={styles.infoTitle}>Clinical Uses & Indication</strong>
                  <p style={styles.infoText}>{getMedText(selectedMed.uses, lang)}</p>
                </div>

                <div style={styles.infoBlock}>
                  <strong style={{ ...styles.infoTitle, color: 'var(--danger)' }}>Possible Side Effects</strong>
                  <p style={styles.infoText}>{getMedText(selectedMed.sideEffects, lang)}</p>
                </div>

                <div style={styles.infoBlock}>
                  <strong style={{ ...styles.infoTitle, color: 'var(--warning)' }}>Key Safety Precautions</strong>
                  <p style={styles.infoText}>{getMedText(selectedMed.precautions, lang)}</p>
                </div>

                <div style={styles.infoBlock}>
                  <strong style={styles.infoTitle}>Storage & Handling Instructions</strong>
                  <p style={styles.infoText}>{getMedText(selectedMed.storage, lang)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.noMedSelected}>
              <Info size={36} color="var(--text-light)" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>No Medicine Selected</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Type a drug name in the search bar to analyze custom pharmacological guides.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  layout: {
    width: '100%',
    alignItems: 'stretch',
    gap: '1.25rem'
  },
  searchPanel: {
    gridColumn: 'span 1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    maxHeight: '520px',
    overflowY: 'auto' as const,
    padding: '1.25rem'
  },
  panelTitle: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: 800
  },
  panelDesc: {
    margin: 0,
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: 1.4
  },
  searchBox: {
    display: 'flex',
    gap: '0.5rem',
    width: '100%'
  },
  micBtn: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)'
  },
  medsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    overflowY: 'auto' as const
  },
  emptyText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  medItemCard: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem 0.9rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
    transition: 'all var(--transition-fast)'
  },
  medCatLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  detailsPanel: {
    gridColumn: 'span 2',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '1.5rem'
  },
  noMedSelected: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    gap: '0.75rem',
    padding: '2rem'
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  medCatBadge: {
    display: 'inline-block',
    fontSize: '0.72rem',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    color: 'var(--clinic-primary)',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--radius-full)',
    marginTop: '0.25rem'
  },
  dosageWarning: {
    backgroundColor: 'var(--warning-light)',
    color: 'var(--text-main)',
    borderLeft: '4px solid var(--warning)',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    fontSize: '0.78rem',
    lineHeight: '1.4'
  },
  infoBlocks: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem'
  },
  infoBlock: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)'
  },
  infoTitle: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '0.25rem'
  },
  infoText: {
    margin: 0,
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45'
  }
};
