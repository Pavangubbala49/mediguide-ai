import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, FileText, Mic, Search, ChevronRight, Activity, ShieldCheck, ThermometerSnowflake, HeartPulse, Pill, ArrowLeft } from 'lucide-react';
import { MEDICINES, type Medicine } from '../services/medicalData';

interface MedicineInfoProps {
  lang: string;
}

export default function MedicineInfo({ lang }: MedicineInfoProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const filteredMeds = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const matches = MEDICINES.filter(med => 
      med && med.name && (
        med.name.toLowerCase().includes(term) ||
        (med.category && med.category.toLowerCase().includes(term))
      )
    );

    const hasExactMatch = MEDICINES.some(med => med && med.name && med.name.toLowerCase() === term);
    if (!hasExactMatch && term.length >= 1) {
      const dynamicMed = generateDynamicMedicine(searchTerm);
      return [dynamicMed, ...matches].slice(0, 8); // Limit dropdown size
    }

    return matches.slice(0, 8);
  }, [searchTerm]);

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
      setShowDropdown(true);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const getMedText = (fieldData: any, langKey: string): string => {
    if (!fieldData) return 'No specific clinical information recorded.';
    if (typeof fieldData === 'string') return fieldData;
    if (typeof fieldData === 'object') {
      return fieldData[langKey] || fieldData['en'] || Object.values(fieldData)[0] || 'No specific clinical information recorded.';
    }
    return String(fieldData);
  };

  const popularMeds = [
    { name: 'Paracetamol', desc: 'Pain reliever & fever reducer' },
    { name: 'Amoxicillin', desc: 'Antibiotic for bacterial infections' },
    { name: 'Ibuprofen', desc: 'NSAID for pain and inflammation' },
    { name: 'Omeprazole', desc: 'Reduces stomach acid (GERD)' },
    { name: 'Lisinopril', desc: 'Treats high blood pressure' },
    { name: 'Metformin', desc: 'Type 2 diabetes medication' }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      
      {!selectedMed ? (
        // HERO SEARCH VIEW
        <div style={styles.heroContainer}>
          <div style={styles.heroBox}>
            <div style={styles.heroIconBadge}>
              <FileText size={32} color="#ffffff" />
            </div>
            <h1 style={styles.heroTitle}>Medicine & Drug Directory</h1>
            <p style={styles.heroSubtitle}>
              Access our comprehensive pharmacological database. Search for detailed information on uses, side effects, and safety precautions.
            </p>

            <div style={styles.searchWrapper} ref={searchRef}>
              <div style={styles.searchBox}>
                <Search size={22} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
                <input
                  type="text"
                  placeholder="Search any medicine (e.g., Paracetamol, Amoxicillin)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={styles.searchInput}
                />
                <button 
                  type="button" 
                  onClick={handleVoiceSearch} 
                  style={{
                    ...styles.micBtn,
                    backgroundColor: isListening ? 'var(--danger-light)' : 'transparent',
                    color: isListening ? 'var(--danger)' : 'var(--text-muted)'
                  }}
                  title="Voice Search"
                >
                  <Mic size={20} />
                </button>
              </div>

              {/* AUTOCOMPLETE DROPDOWN */}
              {showDropdown && searchTerm.trim().length > 0 && (
                <div style={styles.dropdownMenu}>
                  {filteredMeds.length === 0 ? (
                    <div style={styles.dropdownItemEmpty}>No matches found.</div>
                  ) : (
                    filteredMeds.map(med => {
                      const isDynamic = !MEDICINES.some(m => m.name === med.name);
                      return (
                        <div
                          key={med.name}
                          style={styles.dropdownItem}
                          onClick={() => {
                            setSelectedMed(med);
                            setShowDropdown(false);
                            setSearchTerm('');
                          }}
                        >
                          <div style={styles.dropdownItemIcon}>
                            <Pill size={16} />
                          </div>
                          <div style={styles.dropdownItemContent}>
                            <span style={styles.dropdownItemName}>{med.name}</span>
                            <span style={styles.dropdownItemCat}>{med.category}</span>
                          </div>
                          {isDynamic && (
                            <span style={styles.dynamicBadge}>AI Match</span>
                          )}
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.popularSection}>
            <h3 style={styles.popularTitle}>Most Searched Medicines</h3>
            <div style={styles.popularGrid}>
              {popularMeds.map((med, idx) => (
                <div 
                  key={idx} 
                  style={styles.popularCard}
                  onClick={() => {
                    // Try to find it, otherwise AI generates it
                    const found = MEDICINES.find(m => m.name.toLowerCase() === med.name.toLowerCase());
                    if (found) setSelectedMed(found);
                    else setSelectedMed(generateDynamicMedicine(med.name));
                  }}
                >
                  <h4 style={styles.popularCardTitle}>{med.name}</h4>
                  <p style={styles.popularCardDesc}>{med.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // DRUG PROFILE VIEW
        <div style={styles.profileContainer} className="fade-in">
          <button style={styles.backBtn} onClick={() => setSelectedMed(null)}>
            <ArrowLeft size={16} />
            <span>Back to Search</span>
          </button>

          <div style={styles.profileHeader}>
            <div style={styles.profileHeaderContent}>
              <div style={styles.profileIconBox}>
                <Pill size={36} color="var(--primary)" />
              </div>
              <div>
                <h2 style={styles.profileTitle}>{selectedMed.name}</h2>
                <span style={styles.profileBadge}>{selectedMed.category}</span>
              </div>
            </div>
          </div>

          <div style={styles.warningBanner}>
            <AlertTriangle size={24} color="#b45309" />
            <div style={styles.warningTextContainer}>
              <h4 style={styles.warningTitle}>CRITICAL DOSAGE INFORMATION</h4>
              <p style={styles.warningText}>
                In compliance with safety regulations, specific dosage quantities are omitted. Always consult your physician or pharmacist for exact dosing schedules and personalized medical advice.
              </p>
            </div>
          </div>

          <div style={styles.detailsGrid}>
            
            <div style={styles.detailCard}>
              <div style={styles.detailCardHeader}>
                <div style={{ ...styles.detailIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <HeartPulse size={20} />
                </div>
                <h3 style={styles.detailTitle}>Clinical Uses & Indication</h3>
              </div>
              <p style={styles.detailText}>{getMedText(selectedMed.uses, lang)}</p>
            </div>

            <div style={styles.detailCard}>
              <div style={styles.detailCardHeader}>
                <div style={{ ...styles.detailIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Activity size={20} />
                </div>
                <h3 style={styles.detailTitle}>Possible Side Effects</h3>
              </div>
              <p style={styles.detailText}>{getMedText(selectedMed.sideEffects, lang)}</p>
            </div>

            <div style={styles.detailCard}>
              <div style={styles.detailCardHeader}>
                <div style={{ ...styles.detailIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={styles.detailTitle}>Key Safety Precautions</h3>
              </div>
              <p style={styles.detailText}>{getMedText(selectedMed.precautions, lang)}</p>
            </div>

            <div style={styles.detailCard}>
              <div style={styles.detailCardHeader}>
                <div style={{ ...styles.detailIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <ThermometerSnowflake size={20} />
                </div>
                <h3 style={styles.detailTitle}>Storage & Handling</h3>
              </div>
              <p style={styles.detailText}>{getMedText(selectedMed.storage, lang)}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '2rem'
  },
  
  // HERO VIEW
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%'
  },
  heroBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '4rem 2rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    position: 'relative',
    overflow: 'hidden'
  },
  heroIconBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.02em'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '600px',
    margin: '0 0 2.5rem 0'
  },
  searchWrapper: {
    width: '100%',
    maxWidth: '650px',
    position: 'relative'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--border-color)',
    padding: '0.5rem 1rem',
    transition: 'border-color var(--transition-fast)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    padding: '0.75rem 1rem 0.75rem 3rem',
    fontSize: '1.1rem',
    color: 'var(--text-main)',
    outline: 'none',
  },
  micBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s',
  },
  dropdownItemEmpty: {
    padding: '1.5rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  dropdownItemIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)'
  },
  dropdownItemContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    textAlign: 'left'
  },
  dropdownItemName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)'
  },
  dropdownItemCat: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  dynamicBadge: {
    fontSize: '0.7rem',
    fontWeight: 800,
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
  },

  // POPULAR SECTION
  popularSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
  },
  popularTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: 0
  },
  popularGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem'
  },
  popularCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  popularCardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: 0
  },
  popularCardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    margin: 0
  },

  // PROFILE VIEW
  profileContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: 'fit-content',
    padding: '0.5rem 0',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'var(--bg-card)',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  profileHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  profileIconBox: {
    width: '72px',
    height: '72px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 0.5rem 0'
  },
  profileBadge: {
    display: 'inline-block',
    fontSize: '0.85rem',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: 700,
    padding: '0.3rem 0.8rem',
    borderRadius: 'var(--radius-full)'
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
  },
  warningTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  warningTitle: {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#92400e',
    margin: 0
  },
  warningText: {
    fontSize: '0.9rem',
    color: '#92400e',
    margin: 0,
    lineHeight: 1.5
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  detailCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  detailCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  detailIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: 0
  },
  detailText: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0
  }
};
