import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AIChat from './components/AIChat';
import SymptomChecker from './components/SymptomChecker';
import DiseasePrediction from './components/DiseasePrediction';
import NearbyHospitals from './components/NearbyHospitals';
import MedicineInfo from './components/MedicineInfo';
import HealthHistory from './components/HealthHistory';
import EmergencyHelp from './components/EmergencyHelp';
import LoginPage, { getLocalUserSession, type UserSession } from './components/LoginPage';

import { type DiagnosisReport, getDiagnosisReports } from './services/medicalData';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lang, setLang] = useState<string>('en');
  const [theme, setTheme] = useState<string>('light');
  
  // Gatekeeper User Session State
  const [userSession, setUserSession] = useState<UserSession | null>(getLocalUserSession());
  
  // Cross-component communications states
  const [initialChatText, setInitialChatText] = useState<string>('');
  const [activeReport, setActiveReport] = useState<DiagnosisReport | null>(null);
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('All');

  // Sync theme with Document Element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // Load the latest report on initialization if it exists
  useEffect(() => {
    const reports = getDiagnosisReports();
    if (reports.length > 0) {
      setActiveReport(reports[0]);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAssessComplete = (reportId: string) => {
    const reports = getDiagnosisReports();
    const match = reports.find(r => r.id === reportId);
    if (match) {
      setActiveReport(match);
      setCurrentTab('disease_prediction');
    }
  };

  const handleLoadSavedReport = (report: DiagnosisReport) => {
    setActiveReport(report);
    setCurrentTab('disease_prediction');
  };

  // Content Router
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home 
            setCurrentTab={setCurrentTab} 
            setInitialChatText={setInitialChatText} 
            lang={lang} 
          />
        );
      case 'chat':
        return (
          <AIChat 
            initialChatText={initialChatText} 
            setInitialChatText={setInitialChatText} 
            setCurrentTab={setCurrentTab} 
            lang={lang}
          />
        );
      case 'symptom_checker':
        return (
          <SymptomChecker 
            onAssessComplete={handleAssessComplete} 
          />
        );
      case 'disease_prediction':
        return (
          <DiseasePrediction 
            report={activeReport} 
            setCurrentTab={setCurrentTab} 
            setSelectedHospitalFilter={setSelectedHospitalFilter}
          />
        );
      case 'hospitals':
        return (
          <NearbyHospitals 
            selectedSpecialtyFilter={selectedHospitalFilter} 
            setSelectedSpecialtyFilter={setSelectedHospitalFilter} 
            lang={lang} 
          />
        );
      case 'medicines':
        return (
          <MedicineInfo lang={lang} />
        );
      case 'history':
        return (
          <HealthHistory 
            onLoadReport={handleLoadSavedReport} 
            setCurrentTab={setCurrentTab} 
          />
        );
      case 'emergency':
        return (
          <EmergencyHelp 
            setCurrentTab={setCurrentTab} 
          />
        );
      case 'login':
        return (
          <LoginPage 
            setCurrentTab={setCurrentTab} 
            lang={lang}
            onLoginSuccess={(session) => setUserSession(session)}
            onLogout={() => setUserSession(null)}
          />
        );
      default:
        return (
          <Home 
            setCurrentTab={setCurrentTab} 
            setInitialChatText={setInitialChatText} 
            lang={lang} 
          />
        );
    }
  };

  // Gatekeeper Mode: If user is not authenticated, render Full-Screen Login Page Portal
  if (!userSession) {
    return (
      <div className="halo-app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', minHeight: '100vh', padding: '1rem' }}>
        <LoginPage 
          setCurrentTab={setCurrentTab} 
          lang={lang} 
          onLoginSuccess={(session) => {
            setUserSession(session);
            setCurrentTab('home');
          }}
        />
      </div>
    );
  }

  return (
    <div className="halo-app-container">
      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        userSession={userSession}
        onLogout={() => {
          setUserSession(null);
          localStorage.removeItem('mediguide_user');
          setCurrentTab('login');
        }}
      />
      
      {/* Central Content Window */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
