import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { ChatMessage, DiagnosisReport } from './medicalData';

// Firebase Configuration for MediGuide AI
export const firebaseConfig = {
  apiKey: "AIzaSyC41pjQvfguzqmq62AL-wdGpmCvjz2qFIA",
  authDomain: "mediguide-ai-00.firebaseapp.com",
  projectId: "mediguide-ai-00",
  storageBucket: "mediguide-ai-00.firebasestorage.app",
  messagingSenderId: "143280193817",
  appId: "1:143280193817:web:2643b6ef8f90e9798b8588",
  measurementId: "G-R9N80VLJC5"
};

// Initialize Firebase App instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export core Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics if supported in browser environment
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// --- Firebase Cloud Sync Helpers ---

// Save a new chat message to Cloud Firestore
export async function syncChatMessageToFirebase(msg: ChatMessage) {
  try {
    const chatRef = collection(db, 'chat_messages');
    await addDoc(chatRef, {
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firebase sync note (using local fallback):', err);
  }
}

// Save a diagnosis report to Cloud Firestore
export async function syncReportToFirebase(report: DiagnosisReport) {
  try {
    const reportRef = collection(db, 'diagnosis_reports');
    await addDoc(reportRef, {
      ...report,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firebase sync note (using local fallback):', err);
  }
}

// Listen for real-time chat updates from Cloud Firestore
export function subscribeToFirebaseChat(onUpdate: (msgs: ChatMessage[]) => void) {
  try {
    const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || doc.id,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      if (msgs.length > 0) {
        onUpdate(msgs);
      }
    });
  } catch (err) {
    console.warn('Firebase subscription note:', err);
    return () => {};
  }
}

export default app;
