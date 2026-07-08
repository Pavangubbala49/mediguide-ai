import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  AlertCircle, 
  RefreshCw, 
  Stethoscope, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown,
  Pill,
  Hospital,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  getChatMessages, 
  saveChatMessages, 
  getBotResponse, 
  type ChatMessage 
} from '../services/medicalData';

interface AIChatProps {
  initialChatText: string;
  setInitialChatText: (text: string) => void;
  setCurrentTab: (tab: string) => void;
  lang?: string;
}

interface CategoryChip {
  category: string;
  icon: string;
  chips: string[];
}

export default function AIChat({ initialChatText, setInitialChatText, setCurrentTab, lang = 'en' }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('symptoms');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [msgFeedback, setMsgFeedback] = useState<{ [id: string]: 'up' | 'down' }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from service
  useEffect(() => {
    setMessages(getChatMessages());
  }, []);

  // Pre-load prompt from Home quick search if available
  useEffect(() => {
    if (initialChatText) {
      handleSendMessage(initialChatText);
      setInitialChatText(''); // reset
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatText]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up SpeechSynthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Stop speaking if currently speaking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');
    saveChatMessages(updated);
    setIsTyping(true);

    // Simulate bot thinking & formulating clear explanation
    setTimeout(() => {
      const botResponseText = getBotResponse(text, lang);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMsgs = [...updated, botMsg];
      setMessages(finalMsgs);
      saveChatMessages(finalMsgs);
      setIsTyping(false);
    }, 700);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      }
      localStorage.removeItem('mediguide_chat');
      setMessages(getChatMessages());
    }
  };

  // Text-To-Speech (Audio Read-Aloud)
  const toggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/👨‍⚕️|⚙️|⚠️/g, '')
      .replace(/[#*`_~🚨📌💡🔍📋💊🚑🛑👋]/gu, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };

  // Handle Feedback Reaction
  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setMsgFeedback(prev => {
      const updated = { ...prev };
      if (updated[msgId] === type) {
        delete updated[msgId];
      } else {
        updated[msgId] = type;
      }
      return updated;
    });
  };

  // Voice Input SpeechRecognition API
  const handleVoiceInput = () => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Categorized Query Prompt Chips
  const categoryData: CategoryChip[] = [
    {
      category: 'symptoms',
      icon: '🩺',
      chips: [
        'I have a sharp headache and feel dizzy',
        'What causes acid reflux and heartburn?',
        'I have a sore throat, fever, and cough',
        'Why am I feeling short of breath?'
      ]
    },
    {
      category: 'medicines',
      icon: '💊',
      chips: [
        'What is Paracetamol used for & dosage?',
        'Ibuprofen vs Paracetamol differences',
        'When should I take Omeprazole?',
        'Do antibiotics work for cold and flu?'
      ]
    },
    {
      category: 'emergency',
      icon: '🚑',
      chips: [
        'Emergency first-aid for a hot water burn',
        'What to do for a sprained ankle?',
        'How to recognize signs of a heart attack?',
        'First-aid steps for heavy wound bleeding'
      ]
    },
    {
      category: 'pediatric',
      icon: '👶',
      chips: [
        'How to treat fever in a young child?',
        'Is aspirin safe for children?',
        'What to give a child for cough and cold?'
      ]
    },
    {
      category: 'wellness',
      icon: '🍏',
      chips: [
        'How can I natural lower blood pressure?',
        'Tips to manage high blood sugar',
        'How much water should I drink daily?'
      ]
    }
  ];

  // Helper to format bot message lines cleanly
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return <div key={idx} style={{ height: '0.4rem' }} />;
      }

      // Headers (### Heading)
      if (trimmed.startsWith('### ')) {
        const titleText = trimmed.replace('### ', '');
        return (
          <h4 key={idx} style={styles.msgHeader}>
            {titleText}
          </h4>
        );
      }

      // Title line with 📌 or 🚨
      if (trimmed.startsWith('📌') || trimmed.startsWith('🚨') || trimmed.startsWith('👋')) {
        return (
          <div key={idx} style={styles.msgMainBanner}>
            {renderBoldFormattedText(trimmed)}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return (
          <div key={idx} style={styles.bulletItem}>
            <span style={styles.bulletDot}>•</span>
            <span style={{ flex: 1 }}>{renderBoldFormattedText(trimmed.substring(1).trim())}</span>
          </div>
        );
      }

      // Numbered lists (1. 2. 3.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={styles.bulletItem}>
            <span style={styles.numBadge}>{numMatch[1]}</span>
            <span style={{ flex: 1 }}>{renderBoldFormattedText(numMatch[2])}</span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} style={styles.msgParagraph}>
          {renderBoldFormattedText(trimmed)}
        </p>
      );
    });
  };

  // Helper to convert **bold text** to <strong> HTML elements
  const renderBoldFormattedText = (raw: string) => {
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const currentCategoryData = categoryData.find(c => c.category === activeCategory) || categoryData[0];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <div style={styles.botBadge}>
            <MessageSquare size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              MediGuide AI Assistant <Sparkles size={16} color="var(--primary)" />
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Instant, detailed medical explanations & clinical guidance
            </span>
          </div>
        </div>

        <button className="btn btn-outline" onClick={handleClearHistory} style={styles.clearBtn}>
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Alert Disclaimer */}
      <div style={styles.alertBanner}>
        <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
        <span style={styles.alertText}>
          MediGuide AI provides general, educational medical information. <strong>It is NOT a substitute for professional clinical diagnosis.</strong> Call emergency services immediately in life-threatening scenarios.
        </span>
      </div>

      {/* Main Chat Box Container */}
      <div className="glass-card" style={styles.chatBox}>
        <div style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: msg.sender === 'user' ? 'var(--user-bubble-bg)' : 'var(--bg-card)',
                  color: msg.sender === 'user' ? 'var(--user-bubble-text)' : 'var(--text-main)',
                  borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.sender === 'user' ? '16px' : '4px',
                  border: msg.sender === 'bot' ? '1px solid var(--border-color)' : '1px solid var(--user-bubble-border)',
                  boxShadow: msg.sender === 'bot' ? '0 2px 12px rgba(0, 0, 0, 0.04)' : '0 2px 8px rgba(15, 23, 42, 0.15)'
                }}
              >
                {/* Message Header for Bot */}
                {msg.sender === 'bot' && (
                  <div style={styles.botBubbleHeader}>
                    <div style={styles.botMetaTag}>
                      <Sparkles size={12} color="var(--primary)" />
                      <span>MediGuide AI Explanation</span>
                    </div>

                    <div style={styles.actionIconGroup}>
                      {/* Audio Text-To-Speech Button */}
                      <button
                        onClick={() => toggleSpeech(msg.id, msg.text)}
                        style={{
                          ...styles.iconActionBtn,
                          color: speakingMsgId === msg.id ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                        title={speakingMsgId === msg.id ? 'Stop Speaking' : 'Listen to Explanation'}
                      >
                        {speakingMsgId === msg.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>

                      {/* Copy Response Button */}
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        style={styles.iconActionBtn}
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Formatted Message Body */}
                <div style={styles.msgBody}>
                  {msg.sender === 'user' ? (
                    <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}
                </div>

                {/* Footer bar with Feedback and Timestamp */}
                <div style={styles.msgFooter}>
                  {msg.sender === 'bot' && (
                    <div style={styles.feedbackRow}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Was this explanation clear?</span>
                      <button
                        onClick={() => handleFeedback(msg.id, 'up')}
                        style={{
                          ...styles.feedbackBtn,
                          color: msgFeedback[msg.id] === 'up' ? 'var(--success)' : 'var(--text-muted)'
                        }}
                        title="Helpful"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'down')}
                        style={{
                          ...styles.feedbackBtn,
                          color: msgFeedback[msg.id] === 'down' ? 'var(--danger)' : 'var(--text-muted)'
                        }}
                        title="Not Helpful"
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>
                  )}

                  <span
                    style={{
                      ...styles.timestamp,
                      color: msg.sender === 'user' ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)'
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isTyping && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={{ ...styles.bubble, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={styles.typingIndicator}>
                  <Sparkles size={14} className="pulse-indicator" color="var(--primary)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    AI Doctor is formulating detailed explanation...
                  </span>
                  <div style={styles.dotsContainer}>
                    <span className="dot" style={{ animationDelay: '0s' }}></span>
                    <span className="dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="dot" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Categorized Prompt Chips Selector */}
        <div style={styles.suggestionsContainer}>
          <div style={styles.categoryTabs}>
            <button
              onClick={() => setActiveCategory('symptoms')}
              style={{
                ...styles.categoryTab,
                borderColor: activeCategory === 'symptoms' ? 'var(--primary)' : 'transparent',
                color: activeCategory === 'symptoms' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === 'symptoms' ? 700 : 500
              }}
            >
              🩺 Symptoms
            </button>
            <button
              onClick={() => setActiveCategory('medicines')}
              style={{
                ...styles.categoryTab,
                borderColor: activeCategory === 'medicines' ? 'var(--primary)' : 'transparent',
                color: activeCategory === 'medicines' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === 'medicines' ? 700 : 500
              }}
            >
              💊 Medicines
            </button>
            <button
              onClick={() => setActiveCategory('emergency')}
              style={{
                ...styles.categoryTab,
                borderColor: activeCategory === 'emergency' ? 'var(--primary)' : 'transparent',
                color: activeCategory === 'emergency' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === 'emergency' ? 700 : 500
              }}
            >
              🚑 First Aid
            </button>
            <button
              onClick={() => setActiveCategory('pediatric')}
              style={{
                ...styles.categoryTab,
                borderColor: activeCategory === 'pediatric' ? 'var(--primary)' : 'transparent',
                color: activeCategory === 'pediatric' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === 'pediatric' ? 700 : 500
              }}
            >
              👶 Child Care
            </button>
            <button
              onClick={() => setActiveCategory('wellness')}
              style={{
                ...styles.categoryTab,
                borderColor: activeCategory === 'wellness' ? 'var(--primary)' : 'transparent',
                color: activeCategory === 'wellness' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeCategory === 'wellness' ? 700 : 500
              }}
            >
              🍏 Wellness
            </button>
          </div>

          <div style={styles.chipsWrapper}>
            {currentCategoryData.chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                style={styles.chip}
              >
                <span>{chip}</span>
                <ChevronRight size={12} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>

        {/* Embedded Navigation Action Toolbar */}
        <div style={styles.navigationToolbar}>
          <button
            onClick={() => setCurrentTab('symptom_checker')}
            style={styles.quickNavBtn}
          >
            <Stethoscope size={15} color="var(--primary)" />
            <span>Start Symptom Assessment</span>
          </button>

          <button
            onClick={() => setCurrentTab('medicines')}
            style={styles.quickNavBtn}
          >
            <Pill size={15} color="var(--primary)" />
            <span>Search Medicine Database</span>
          </button>

          <button
            onClick={() => setCurrentTab('hospitals')}
            style={styles.quickNavBtn}
          >
            <Hospital size={15} color="var(--primary)" />
            <span>Find Nearby Hospitals</span>
          </button>
        </div>

        {/* Message Form Input */}
        <div style={styles.formContainer}>
          <button
            onClick={handleVoiceInput}
            style={{
              ...styles.voiceBtn,
              backgroundColor: isListening ? 'var(--danger-light)' : 'var(--bg-secondary)',
              color: isListening ? 'var(--danger)' : 'var(--text-muted)'
            }}
            title={isListening ? 'Stop Listening' : 'Voice Input (Speak to Ask)'}
          >
            {isListening ? <MicOff size={20} className="pulse-indicator" /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            className="form-control"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder={isListening ? 'Listening... Speak your health query clearly' : 'Ask any medical question (symptoms, drugs, remedies, diseases)...'}
            style={styles.chatInput}
            disabled={isListening}
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            className="btn btn-primary"
            style={styles.sendBtn}
            disabled={!inputText.trim()}
            title="Send Question"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    height: 'calc(100vh - 120px)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem'
  },
  botBadge: {
    width: '42px',
    height: '42px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)'
  },
  clearBtn: {
    padding: '0.45rem 0.9rem',
    fontSize: '0.85rem'
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--danger-light)',
    borderLeft: '4px solid var(--danger)',
    borderRadius: 'var(--radius-sm)'
  },
  alertText: {
    fontSize: '0.82rem',
    color: 'var(--text-main)',
    lineHeight: '1.4'
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
    padding: '1.25rem',
    position: 'relative' as const,
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    paddingRight: '0.5rem',
    marginBottom: '0.8rem'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    maxWidth: '82%',
    padding: '0.95rem 1.25rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  botBubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.4rem',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '0.3rem'
  },
  botMetaTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--primary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  actionIconGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  iconActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.2rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)'
  },
  msgBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem'
  },
  msgHeader: {
    margin: '0.4rem 0 0.2rem 0',
    fontSize: '0.94rem',
    fontWeight: 700,
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  msgMainBanner: {
    fontSize: '0.95rem',
    fontWeight: 700,
    lineHeight: '1.45',
    color: 'var(--text-main)',
    marginBottom: '0.3rem'
  },
  msgParagraph: {
    margin: '0.15rem 0',
    fontSize: '0.9rem',
    lineHeight: '1.55',
    color: 'var(--text-main)'
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    margin: '0.15rem 0'
  },
  bulletDot: {
    color: 'var(--primary)',
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: '1.2'
  },
  numBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontSize: '0.75rem',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px'
  },
  msgFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.4rem',
    paddingTop: '0.3rem'
  },
  feedbackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  feedbackBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timestamp: {
    fontSize: '0.7rem',
    marginLeft: 'auto'
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.2rem 0'
  },
  dotsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  suggestionsContainer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.6rem',
    marginBottom: '0.6rem'
  },
  categoryTabs: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto' as const,
    marginBottom: '0.5rem',
    paddingBottom: '0.2rem'
  },
  categoryTab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all var(--transition-fast)'
  },
  chipsWrapper: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto' as const,
    paddingBottom: '0.2rem'
  },
  chip: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    padding: '0.38rem 0.85rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.78rem',
    color: 'var(--text-main)',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'all var(--transition-fast)'
  },
  navigationToolbar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap' as const
  },
  quickNavBtn: {
    flex: 1,
    minWidth: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  formContainer: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
  },
  voiceBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  chatInput: {
    flex: 1,
    height: '38px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.9rem',
    color: 'var(--text-main)'
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    padding: 0,
    backgroundColor: 'var(--text-main)',
    color: 'var(--bg-primary)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};
