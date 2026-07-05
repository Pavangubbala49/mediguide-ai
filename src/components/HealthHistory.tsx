import { useEffect, useState } from 'react';
import { 
  History, 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  BrainCircuit
} from 'lucide-react';
import { 
  type DiagnosisReport, 
  getDiagnosisReports, 
  SYMPTOMS, 
  getDiseases 
} from '../services/medicalData';

interface HealthHistoryProps {
  onLoadReport: (report: DiagnosisReport) => void;
  setCurrentTab: (tab: string) => void;
}

export interface UploadedFileReport {
  name: string;
  size: string;
  extractedTerms: string[];
  riskRating: 'Low' | 'Medium' | 'High';
  findings: string;
  timestamp: string;
}

export default function HealthHistory({ onLoadReport, setCurrentTab }: HealthHistoryProps) {
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'assessments' | 'upload_scanner'>('assessments');
  const [uploadedReports, setUploadedReports] = useState<UploadedFileReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanFileName, setScanFileName] = useState('');

  useEffect(() => {
    setReports(getDiagnosisReports());
    // Load uploaded reports history
    const uploadedData = localStorage.getItem('mediguide_uploads');
    if (uploadedData) {
      setUploadedReports(JSON.parse(uploadedData));
    }
  }, []);

  const handleClearReports = () => {
    if (window.confirm('Delete all diagnostic reports from local history?')) {
      localStorage.removeItem('mediguide_reports');
      setReports([]);
    }
  };

  const handleLoadReport = (rep: DiagnosisReport) => {
    onLoadReport(rep);
    setCurrentTab('symptom_checker'); // This will load report in App state and show Prediction tab
  };

  // Mock upload report handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanFileName(file.name);
    setIsScanning(true);
    setScanProgress(0);

    // Progress simulation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            finalizeScan(file.name, file.size);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const finalizeScan = (fileName: string, sizeBytes: number) => {
    setIsScanning(false);
    
    // Heuristic mock findings based on report name
    let extracted: string[] = ['Glucose Levels: Normal', 'Blood Pressure: Normal', 'Cholesterol (LDL): Under control'];
    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    let findingsText = 'The scanned document reports all vital indicators inside reference values. Regular checkup in 12 months is suggested.';
    
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('blood') || lowerName.includes('cbc') || lowerName.includes('lipid')) {
      extracted = ['Platelet Count: 140,000/µL (Mild Thrombocytopenia)', 'Hemoglobin: 11.2 g/dL (Low)', 'LDL Cholesterol: 162 mg/dL (High)'];
      risk = 'Medium';
      findingsText = 'Identified mild iron-deficiency anemia indicators (low hemoglobin) and elevated bad cholesterol (LDL). Consider adjusting diet and consult a General Physician.';
    } else if (lowerName.includes('urine') || lowerName.includes('kidney')) {
      extracted = ['Protein: Trace (+1)', 'Urea: 48 mg/dL', 'Creatinine: 1.1 mg/dL'];
      risk = 'Low';
      findingsText = 'Slight trace of proteins in urine. Creatinine levels indicate normal kidney glomerular filtration rates. Stay hydrated.';
    } else if (lowerName.includes('cardiac') || lowerName.includes('ecg') || lowerName.includes('heart')) {
      extracted = ['Heart Rate: 98 bpm', 'QT Interval: 420ms', 'ST Segment: Mild elevation in lead II'];
      risk = 'High';
      findingsText = 'ECG shows heart rate near tachycardic levels with mild ST elevations. High clinical priority. Please schedule an emergency consult with a Cardiologist.';
    }

    const newUpload: UploadedFileReport = {
      name: fileName,
      size: (sizeBytes / 1024).toFixed(1) + ' KB',
      extractedTerms: extracted,
      riskRating: risk,
      findings: findingsText,
      timestamp: new Date().toLocaleString()
    };

    const updated = [newUpload, ...uploadedReports];
    setUploadedReports(updated);
    localStorage.setItem('mediguide_uploads', JSON.stringify(updated));
  };

  const handleClearUploads = () => {
    if (window.confirm('Clear upload scan history?')) {
      localStorage.removeItem('mediguide_uploads');
      setUploadedReports([]);
    }
  };

  const diseases = getDiseases();

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={28} color="var(--primary)" />
          <h2>Health Records & History</h2>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={styles.subTabsRow}>
        <button
          onClick={() => setActiveSubTab('assessments')}
          style={{
            ...styles.subTabBtn,
            color: activeSubTab === 'assessments' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottomColor: activeSubTab === 'assessments' ? 'var(--primary)' : 'transparent'
          }}
        >
          Symptom Assessments ({reports.length})
        </button>
        <button
          onClick={() => setActiveSubTab('upload_scanner')}
          style={{
            ...styles.subTabBtn,
            color: activeSubTab === 'upload_scanner' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottomColor: activeSubTab === 'upload_scanner' ? 'var(--primary)' : 'transparent'
          }}
        >
          AI Medical Report Scanner
        </button>
      </div>

      {/* Sub tab Contents */}
      <div style={styles.mainPanel}>
        
        {/* TAB 1: Saved Diagnosis assessments */}
        {activeSubTab === 'assessments' && (
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={{ margin: 0 }}>Diagnosis History</h3>
              {reports.length > 0 && (
                <button className="btn btn-outline" onClick={handleClearReports} style={styles.clearBtn}>
                  <Trash2 size={14} /> Wipe Records
                </button>
              )}
            </div>

            <div style={styles.listContainer}>
              {reports.length === 0 ? (
                <div style={styles.emptyState}>
                  <Clock size={40} color="var(--text-light)" />
                  <h4>No Assessments Logged</h4>
                  <p>Complete our Symptom Checker to record diagnostic evaluations here.</p>
                  <button className="btn btn-primary" onClick={() => setCurrentTab('symptom_checker')}>
                    Start Assessment
                  </button>
                </div>
              ) : (
                reports.map(rep => {
                  const topPredictionName = rep.predictions.length > 0 
                    ? diseases.find(d => d.id === rep.predictions[0].diseaseId)?.name.en || rep.predictions[0].diseaseId
                    : 'Unknown match';

                  return (
                    <div key={rep.id} style={styles.recordRow}>
                      <div style={styles.recordLeft}>
                        <div style={styles.badgeWrapper}>
                          <span style={styles.badgeText}>Report ID: {rep.id.split('_')[1]}</span>
                        </div>
                        <strong style={styles.recordTitle}>
                          Top Match: {topPredictionName}
                        </strong>
                        <div style={styles.metaRow}>
                          <span>Severity: <strong style={{ color: rep.severity === 'Severe' ? 'var(--danger)' : 'var(--text-main)' }}>{rep.severity}</strong></span>
                          <span>•</span>
                          <span>Age: <strong>{rep.age}</strong></span>
                          <span>•</span>
                          <span>Gender: <strong>{rep.gender}</strong></span>
                        </div>
                        <p style={styles.symptomTags}>
                          Symptoms: {rep.selectedSymptoms.map(sid => SYMPTOMS.find(s => s.id === sid)?.name.en || sid).join(', ')}
                        </p>
                      </div>
                      
                      <div style={styles.recordRight}>
                        <span style={styles.timestampText}>{rep.timestamp}</span>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleLoadReport(rep)}
                          style={styles.viewBtn}
                        >
                          <Eye size={14} /> View Report
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Upload Scanner */}
        {activeSubTab === 'upload_scanner' && (
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{ margin: 0 }}>AI Medical PDF & Lab Scanner</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Upload clinical lab reports (PDF/Images) to parse terms and scan risk indicators in real-time.
                </p>
              </div>
              {uploadedReports.length > 0 && (
                <button className="btn btn-outline" onClick={handleClearUploads} style={styles.clearBtn}>
                  <Trash2 size={14} /> Clear Scan History
                </button>
              )}
            </div>

            {/* Upload Box */}
            <div style={styles.uploadArea}>
              <input
                type="file"
                id="report-uploader"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isScanning}
              />
              <label htmlFor="report-uploader" style={styles.uploadLabel}>
                <Upload size={36} color="var(--primary)" />
                <strong style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Drag & Drop file here, or click to browse</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports PDF or JPG/PNG report uploads up to 10MB</span>
              </label>
            </div>

            {/* Scan progress loader */}
            {isScanning && (
              <div style={styles.progressBlock} className="fade-in">
                <div style={styles.progressTextRow}>
                  <span>Scanning <strong>{scanFileName}</strong>...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${scanProgress}%` }} />
                </div>
                <span style={styles.loaderStatus}>Extracting lab parameters and running health classifiers...</span>
              </div>
            )}

            {/* Scanner History Results List */}
            <div style={styles.scansList}>
              {uploadedReports.length === 0 ? (
                <div style={styles.emptyScansState}>
                  <BrainCircuit size={40} color="var(--text-light)" />
                  <h4>No Lab Reports Scanned</h4>
                  <p>Upload a file named e.g. "blood_test.pdf" or "urine_test.jpg" to test our mock AI extraction engine.</p>
                </div>
              ) : (
                uploadedReports.map((item, idx) => {
                  let rColor = 'var(--success)';
                  if (item.riskRating === 'Medium') rColor = 'var(--warning)';
                  if (item.riskRating === 'High') rColor = 'var(--danger)';

                  return (
                    <div key={idx} style={styles.scanResultRow} className="fade-in">
                      <div style={styles.scanRowHeader}>
                        <div style={styles.scanNameBlock}>
                          <FileText size={20} color="var(--primary)" />
                          <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                          <span style={styles.fileSizeText}>({item.size})</span>
                        </div>
                        <span style={styles.scanTimestamp}>{item.timestamp}</span>
                      </div>

                      <div style={styles.divider} />

                      {/* Findings */}
                      <div style={styles.scanFindingsArea}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <strong style={{ fontSize: '0.88rem' }}>Extracted Parameters:</strong>
                        </div>
                        <div style={styles.extractedTermsGrid}>
                          {item.extractedTerms.map((term, i) => (
                            <span key={i} style={styles.termTag}>{term}</span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.85rem', alignItems: 'flex-start' }}>
                          <div style={{ ...styles.riskRatingBadge, color: rColor, borderColor: rColor, backgroundColor: rColor + '15' }}>
                            Risk Level: {item.riskRating}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {item.findings}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
    justifyContent: 'space-between'
  },
  subTabsRow: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem'
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
    outline: 'none'
  },
  mainPanel: {
    width: '100%'
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
    gap: '0.8rem'
  },
  clearBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    gap: '1rem',
    padding: '3rem'
  },
  recordRow: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap' as const
  },
  recordLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.4rem',
    flex: 1
  },
  badgeWrapper: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.2rem 0.5rem'
  },
  badgeText: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-muted)'
  },
  recordTitle: {
    fontSize: '1.05rem',
    color: 'var(--text-main)'
  },
  metaRow: {
    display: 'flex',
    gap: '0.6rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    flexWrap: 'wrap' as const
  },
  symptomTags: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: 600
  },
  recordRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.6rem'
  },
  timestampText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)'
  },
  viewBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem'
  },
  uploadArea: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer',
    transition: 'border var(--transition-fast)'
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    gap: '0.4rem'
  },
  progressBlock: {
    backgroundColor: 'var(--primary-light)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    border: '1px solid rgba(var(--primary-rgb), 0.2)'
  },
  progressTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    fontWeight: 600
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--border-color)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden' as const
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    transition: 'width 0.2s ease-out'
  },
  loaderStatus: {
    fontSize: '0.75rem',
    color: 'var(--primary-text)'
  },
  scansList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  emptyScansState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    gap: '0.8rem',
    padding: '2rem'
  },
  scanResultRow: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem'
  },
  scanRowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '0.6rem'
  },
  scanNameBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  fileSizeText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)'
  },
  scanTimestamp: {
    fontSize: '0.8rem',
    color: 'var(--text-light)'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)'
  },
  scanFindingsArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  extractedTermsGrid: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap' as const,
    marginTop: '0.25rem'
  },
  termTag: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  riskRatingBadge: {
    fontSize: '0.78rem',
    fontWeight: 800,
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    whiteSpace: 'nowrap' as const
  }
};
