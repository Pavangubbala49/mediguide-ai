import { 
  FileText, 
  UserCheck, 
  MapPin, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  type DiagnosisReport, 
  getDiseases, 
  SYMPTOMS 
} from '../services/medicalData';


interface DiseasePredictionProps {
  report: DiagnosisReport | null;
  setCurrentTab: (tab: string) => void;
  setSelectedHospitalFilter?: (specialty: string) => void;
}

export default function DiseasePrediction({ 
  report, 
  setCurrentTab,
  setSelectedHospitalFilter
}: DiseasePredictionProps) {
  if (!report) {
    return (
      <div style={styles.errorContainer} className="glass-card">
        <AlertTriangle size={48} color="var(--warning)" />
        <h3>No Diagnosis Report Loaded</h3>
        <p>Please complete a symptom checker assessment first to review prediction results.</p>
        <button className="btn btn-primary" onClick={() => setCurrentTab('symptom_checker')}>
          Start Assessment
        </button>
      </div>
    );
  }

  const diseases = getDiseases();
  const topPrediction = report.predictions[0];
  const matchedDisease = topPrediction ? diseases.find(d => d.id === topPrediction.diseaseId) : null;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // jsPDF generation
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 118, 110); // Teal Primary
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('Helvetica', 'bold');
    doc.text('MEDIGUIDE AI', 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Smart Health Evaluation Report', 15, 28);
    doc.text(`Report ID: ${report.id}`, 140, 18);
    doc.text(`Generated: ${report.timestamp}`, 140, 28);

    // Patient Info
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('PATIENT DEMOGRAPHICS', 15, 55);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 58, 195, 58);
    
    doc.setTextColor(15, 23, 42); // Text Slate-900
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Age: ${report.age} Years`, 15, 66);
    doc.text(`Gender: ${report.gender}`, 75, 66);
    doc.text(`Conditions: ${report.conditions || 'None Reported'}`, 130, 66);
    doc.text(`Duration: ${report.duration}`, 15, 74);
    doc.text(`Severity: ${report.severity}`, 75, 74);

    // Selected Symptoms
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('REPORTED SYMPTOMS', 15, 90);
    doc.line(15, 93, 195, 93);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    const symptomNames = report.selectedSymptoms.map(sid => SYMPTOMS.find(s => s.id === sid)?.name.en || sid).join(', ');
    const splitSymptoms = doc.splitTextToSize(symptomNames, 180);
    doc.text(splitSymptoms, 15, 102);

    // Predictions
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('DISEASE PREDICTION METRICS', 15, 120);
    doc.line(15, 123, 195, 123);

    let nextY = 132;
    if (report.predictions.length === 0) {
      doc.setTextColor(239, 68, 68);
      doc.text('No clear matches. Please consult a physician for diagnostic advice.', 15, nextY);
      nextY += 10;
    } else {
      report.predictions.forEach((pred, i) => {
        const dName = diseases.find(d => d.id === pred.diseaseId)?.name.en || pred.diseaseId;
        doc.setTextColor(i === 0 ? 15 : 100, i === 0 ? 118 : 110, i === 0 ? 110 : 110);
        doc.setFont('Helvetica', i === 0 ? 'bold' : 'normal');
        doc.text(`${i + 1}. ${dName} (Confidence Score: ${pred.confidence}%)`, 15, nextY);
        nextY += 8;
      });
    }

    // Recommendations
    if (matchedDisease) {
      nextY += 6;
      doc.setTextColor(15, 118, 110);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('CAUSES & REMEDIAL ACTIONS', 15, nextY);
      doc.line(15, nextY + 3, 195, nextY + 3);
      nextY += 10;

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.text('Potential Causes:', 15, nextY);
      nextY += 6;
      doc.setFont('Helvetica', 'normal');
      matchedDisease.possibleCauses.en.forEach(cause => {
        doc.text(`- ${cause}`, 18, nextY);
        nextY += 6;
      });

      nextY += 4;
      doc.setFont('Helvetica', 'bold');
      doc.text('Suggested Remedies / Action Plan:', 15, nextY);
      nextY += 6;
      doc.setFont('Helvetica', 'normal');
      matchedDisease.nextSteps.en.forEach(stepText => {
        const splitStep = doc.splitTextToSize(`- ${stepText}`, 175);
        doc.text(splitStep, 18, nextY);
        nextY += splitStep.length * 5;
      });
    }

    // Medical Disclaimer Footer
    nextY = 270;
    doc.setFillColor(254, 242, 242);
    doc.rect(10, nextY - 5, 190, 22, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.text('DISCLAIMER', 15, nextY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const disclaimer = 'This diagnostic summary is powered by local rule mapping algorithms. It is strictly an education simulation. Do NOT use this document to self-prescribe medications. Always consult a certified healthcare professional.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 180);
    doc.text(splitDisclaimer, 15, nextY + 4);

    doc.save(`MediGuide_Report_${report.id}.pdf`);
  };

  const handleLocateSpecialistHospitals = () => {
    if (setSelectedHospitalFilter) {
      setSelectedHospitalFilter(report.recommendedSpecialist);
    }
    setCurrentTab('hospitals');
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Page Title & Controls */}
      <div style={styles.header} className="no-print">
        <div style={styles.titleArea}>
          <FileText size={28} color="var(--primary)" />
          <h2>Evaluation Summary Report</h2>
        </div>
        <div style={styles.headerActions}>
          <button className="btn btn-outline" onClick={handlePrint} style={styles.controlBtn}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} style={styles.controlBtn}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>


      {/* Main Report Layout */}
      <div style={styles.reportLayout}>
        {/* Left Side: Diagnostics Results */}
        <div style={styles.resultsPanel} className="glass-card">
          <div style={styles.sectionHeader}>
            <CheckCircle size={20} color="var(--primary)" />
            <h3>Diagnostic Inference Calculations</h3>
          </div>

          {/* Patient Details Sub-header */}
          <div style={styles.demographicsSub}>
            <span style={styles.demoPill}>Age: <strong>{report.age} yrs</strong></span>
            <span style={styles.demoPill}>Gender: <strong>{report.gender}</strong></span>
            <span style={styles.demoPill}>Duration: <strong>{report.duration}</strong></span>
            <span style={{ 
              ...styles.demoPill, 
              backgroundColor: report.severity === 'Severe' ? 'var(--danger-light)' : 'var(--bg-secondary)',
              color: report.severity === 'Severe' ? 'var(--danger)' : 'var(--text-main)',
            }}>
              Severity: <strong>{report.severity}</strong>
            </span>
            {report.conditions && <span style={styles.demoPill}>Conditions: <strong>{report.conditions}</strong></span>}
          </div>

          <div style={styles.divider} />

          {/* Predictions Breakdown */}
          <div style={styles.predictionsBlock}>
            <h4 style={styles.subHeading}>Possible Conditions Match</h4>
            {report.predictions.length === 0 ? (
              <div style={styles.noMatch}>
                <HelpCircle size={24} color="var(--text-muted)" />
                <span>No matching disease patterns found in our local database. Please see a physician for clinical assessment.</span>
              </div>
            ) : (
              <div style={styles.predictionsList}>
                {report.predictions.map((pred, index) => {
                  const disease = diseases.find(d => d.id === pred.diseaseId);
                  const isTop = index === 0;

                  return (
                    <div 
                      key={pred.diseaseId} 
                      style={{
                        ...styles.predictionRow,
                        borderColor: isTop ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: isTop ? 'var(--primary-light)' : 'transparent',
                        padding: isTop ? '1.25rem' : '0.85rem'
                      }}
                    >
                      <div style={styles.predictionInfo}>
                        <span style={{
                          ...styles.predictionRank,
                          backgroundColor: isTop ? 'var(--primary)' : 'var(--text-muted)'
                        }}>{index + 1}</span>
                        <div>
                          <strong style={{ fontSize: isTop ? '1.1rem' : '0.92rem', color: isTop ? 'var(--primary-text)' : 'var(--text-main)' }}>
                            {disease?.name.en || pred.diseaseId}
                          </strong>
                          {isTop && <span style={styles.topBadge}>Most Likely</span>}
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Specialist Area: {disease?.specialist}
                          </p>
                        </div>
                      </div>
                      <div style={styles.progressCircleArea}>
                        <div style={styles.percentageVal}>
                          {pred.confidence}%
                          <span style={styles.pctLabel}>Confidence</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Possible Causes & Next Steps (Shown for top matched disease) */}
          {matchedDisease && (
            <>
              <div style={styles.divider} />
              <div style={styles.medicalExplanations}>
                <h4 style={styles.subHeading}>Clinician Guidance Details</h4>
                
                <div style={styles.guideBlock}>
                  <strong style={styles.guideTitle}>Potential Causes:</strong>
                  <ul style={styles.list}>
                    {matchedDisease.possibleCauses.en.map((cause, idx) => (
                      <li key={idx} style={styles.listItem}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div style={styles.guideBlock}>
                  <strong style={styles.guideTitle}>Recommended Next Steps & First-Aid:</strong>
                  <ul style={styles.list}>
                    {matchedDisease.nextSteps.en.map((stepText, idx) => (
                      <li key={idx} style={styles.listItem}>{stepText}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Specialist Card & Action CTAs */}
        <div style={styles.actionsPanel}>
          {/* Specialist Card */}
          <div className="glass-card" style={styles.specialistCard}>
            <div style={styles.specialistHeader}>
              <UserCheck size={24} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Consultation Recommended</h3>
            </div>
            
            <p style={styles.specialistDesc}>
              Our algorithm recommends consulting a doctor in the following field:
            </p>

            <div style={styles.specialistFieldBadge}>
              {report.recommendedSpecialist}
            </div>

            <div style={styles.divider} />

            <div style={styles.simBookingArea}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Instant Appointment Booking</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Simulate scheduling a video consultation or physical visit.
              </p>
              
              <button 
                onClick={() => alert(`SIMULATION:\nConnecting you to a certified ${report.recommendedSpecialist}...\nAvailable Slots: Today 3:00 PM or 5:30 PM.\nAppointment booked successfully!`)}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.6rem' }}
              >
                Schedule Virtual Visit
              </button>
            </div>
          </div>

          {/* Locate hospital Card */}
          <div className="glass-card" style={styles.hospitalCard}>
            <div style={styles.hospitalHeader}>
              <MapPin size={24} color="var(--secondary)" />
              <h3 style={{ margin: 0 }}>Nearby Medical Facilities</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
              Locate clinical centers in your area equipped with specialists in <strong>{report.recommendedSpecialist}</strong>.
            </p>
            <button 
              onClick={handleLocateSpecialistHospitals}
              className="btn btn-secondary" 
              style={{ width: '100%' }}
            >
              Locate Nearby Clinics <ArrowRight size={16} />
            </button>
          </div>

          {/* Warning disclaimer */}
          <div style={styles.sideDisclaimer}>
            <ShieldAlert size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Report summary represents automated inference data. Please share this PDF file with your physician for diagnostic corroboration.
            </span>
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
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    gap: '1rem',
    maxWidth: '500px',
    margin: '3rem auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  headerActions: {
    display: 'flex',
    gap: '0.6rem'
  },
  controlBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem'
  },
  reportLayout: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap' as const
  },
  resultsPanel: {
    flex: 2,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  demographicsSub: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap' as const
  },
  demoPill: {
    fontSize: '0.82rem',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    width: '100%'
  },
  predictionsBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  subHeading: {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text-main)'
  },
  noMatch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem',
    color: 'var(--text-muted)'
  },
  predictionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  predictionRow: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    transition: 'all var(--transition-fast)'
  },
  predictionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem'
  },
  predictionRank: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem'
  },
  topBadge: {
    fontSize: '0.7rem',
    fontWeight: 800,
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--radius-full)',
    marginLeft: '0.5rem',
    textTransform: 'uppercase' as const
  },
  progressCircleArea: {
    textAlign: 'right' as const
  },
  percentageVal: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    lineHeight: '1.1'
  },
  pctLabel: {
    fontSize: '0.65rem',
    fontWeight: 500,
    color: 'var(--text-muted)'
  },
  medicalExplanations: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  guideBlock: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)'
  },
  guideTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    display: 'block',
    marginBottom: '0.5rem'
  },
  list: {
    paddingLeft: '1.2rem',
    margin: 0
  },
  listItem: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
    lineHeight: '1.4'
  },
  actionsPanel: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  specialistCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  specialistHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  specialistDesc: {
    fontSize: '0.88rem',
    margin: 0
  },
  specialistFieldBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontSize: '1.15rem',
    fontWeight: 800,
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center' as const,
    border: '1px dashed var(--primary)'
  },
  simBookingArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem'
  },
  hospitalCard: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  hospitalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  sideDisclaimer: {
    display: 'flex',
    gap: '0.6rem',
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-secondary)'
  }
};
