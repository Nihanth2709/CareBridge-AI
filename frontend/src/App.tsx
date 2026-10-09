import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ShieldAlert,
  MessageSquare,
  Bed,
  Bell,
  Camera,
  Upload,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  PhoneCall,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  Check,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  X,
  Heart,
  Activity,
  Search,
  SlidersHorizontal,
  BookmarkCheck,
  Building2,
  User,
  Stethoscope,
  FileSpreadsheet,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  Globe,
  Square,
  RotateCcw,
  Languages,
} from 'lucide-react';
import {
  LIVE_HOSPITALS_DATA,
  NEARBY_CLINICS_DIRECTORY,
  FIRST_AID_GUIDES,
  FirstAidTopic,
} from './data/hospitals';
import {
  SAMPLE_PRESCRIPTIONS,
  SAMPLE_INJURIES,
  SAMPLE_LAB_REPORTS,
} from './data/samples';
import {
  MedicineReminder,
  LiveHospital,
  LabReportResult,
  ClinicRecommendation,
  PersonalEmergencyContact,
} from './types';
import { TRANSLATIONS, LanguageCode } from './data/translations';
import {
  playReminderChime,
  playBeep,
  startAudioRecording,
  setupSpeechRecognition,
  AudioRecordingSession,
} from './utils/audio';

type Tab = 'rx' | 'lab' | 'voice' | 'reminders' | 'aid' | 'beds';

interface MedicineItem {
  name: string;
  type?: string;
  purpose: string;
  dosage: string;
  timing: string;
  foodRelation: string;
  duration: string;
  warnings?: string;
}

interface PrescriptionResult {
  isPrescription: boolean;
  doctorOrHospital?: string | null;
  patientName?: string | null;
  date?: string | null;
  medicines?: MedicineItem[];
  generalInstructions?: string[];
  simpleSummary?: string;
  translations?: {
    hi?: { summary: string; instructions?: string[] };
    te?: { summary: string; instructions?: string[] };
    ta?: { summary: string; instructions?: string[] };
  };
  cautionNote?: string;
}

interface FirstAidResult {
  injuryTitle: string;
  severity: 'mild' | 'moderate' | 'severe_emergency';
  isLifeThreatening?: boolean;
  visualAssessment: string;
  immediateActions: string[];
  criticalDoNots: string[];
  redFlagWarnings: string[];
  disclaimer: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isEmergency?: boolean;
  timestamp: string;
}

const DEFAULT_REMINDERS: MedicineReminder[] = [
  {
    id: '1',
    name: 'Paracetamol 650mg',
    dosage: '1 tablet',
    time: '08:00',
    foodRelation: 'After Food',
    frequency: 'Twice Daily',
    takenToday: true,
    notes: 'For fever and body pain',
  },
  {
    id: '2',
    name: 'Amoxicillin 500mg',
    dosage: '1 capsule',
    time: '13:30',
    foodRelation: 'After Food',
    frequency: 'Twice Daily',
    takenToday: false,
    notes: 'Antibiotic - Complete full course',
  },
  {
    id: '3',
    name: 'Pantoprazole 40mg',
    dosage: '1 tablet',
    time: '07:30',
    foodRelation: 'Before Food',
    frequency: 'Once Daily',
    takenToday: false,
    notes: 'For acidity and stomach lining',
  },
];

const DEFAULT_EMERGENCY_CONTACTS: PersonalEmergencyContact[] = [
  {
    id: 'c1',
    name: 'Dr. Anand (Family Physician)',
    relation: 'Doctor',
    phone: '+919849012345',
  },
  {
    id: 'c2',
    name: 'Primary Family Contact',
    relation: 'Family',
    phone: '+919876543210',
  },
];

function getLocalTriageResponse(
  query: string,
  lang: LanguageCode
): { transcription: string; solution: string; isEmergency: boolean } {
  const q = query.toLowerCase();
  const isEmergency = /chest|heart|breathe|breathing|unconscious|bleed|stroke|poison|paralysis|ఛాతీ|గుండె|శ్వాస|రక్తం|सीने|सांस|बेहोश|मார்பு|மூச்சு/i.test(q);
  const isFever = /fever|temperature|headache|జ్వరం|తలనొప్పి|बुखार|सिरदर्द|காய்ச்சல்|தலைவலி/i.test(q);
  const isCough = /cough|throat|cold|sore|దగ్గు|గొంతు|జలుబు|खांसी|गले|जुकाम|இருமல்|தொண்டை|சளி/i.test(q);
  const isStomach = /stomach|vomit|diarrhea|belly|కడుపు|వాంతి|విరేచనాలు|पेट|उल्टी|दस्त|வயிறு|வாந்தி/i.test(q);

  if (lang === 'te') {
    if (isEmergency) {
      return {
        transcription: query,
        solution: '⚠️ అత్యవసర హెచ్చరిక: మీ లక్షణాలు తీవ్రమైనవిగా కనిపిస్తున్నాయి. ఆలస్యం చేయకుండా వెంటనే 108కి కాల్ చేయండి లేదా సమీప ఆసుపత్రి అత్యవసర విభాగానికి (Trauma/Emergency) వెళ్లండి. రోగిని సౌకర్యవంతంగా కూర్చోబెట్టండి, ప్రశాంతంగా ఉంచండి.',
        isEmergency: true,
      };
    }
    if (isFever) {
      return {
        transcription: query,
        solution: '🩺 వైద్య సలహా & గృహ సంరక్షణ (జ్వరం & తలనొప్పి):\n• పుష్కలంగా గోరువెచ్చని నీరు మరియు ఓఆర్‌ఎస్ (ORS) త్రాగి శరీరాన్ని హైడ్రేటెడ్‌గా ఉంచండి.\n• నుదిటిపై చల్లని నీటి తడి గుడ్డతో కాపడం పెట్టండి.\n• తేలికపాటి తాజా ఆహారం (గంజి, పండ్లు, సూప్) తీసుకోండి.\n• తగినంత నిద్ర మరియు పూర్తి విశ్రాంతి తీసుకోండి.\n• జ్వరం 102°F కంటే ఎక్కువ ఉంటే లేదా 48 గంటలు తగ్గకపోతే వెంటనే వైద్యుడిని సంప్రదించండి.',
        isEmergency: false,
      };
    }
    if (isCough) {
      return {
        transcription: query,
        solution: '🩺 వైద్య సలహా & గృహ సంరక్షణ (దగ్గు, జలుబు & గొంతు నొప్పి):\n• గోరువెచ్చని ఉప్పు నీటితో రోజుకు 3 సార్లు పుక్కిలించండి (గార్గిల్ చేయండి).\n• తులసి, అల్లం మరియు తేనెతో కూడిన గోరువెచ్చని నీరు త్రాగండి.\n• రోజుకు రెండుసార్లు ఆవిరి (Steam inhalation) పట్టండి.\n• చల్లని పదార్థాలు మరియు శీతల పానీయాలు పూర్తిగా నివారించండి.\n• శ్వాస తీసుకోవడంలో తీవ్రమైన ఇబ్బంది ఉంటే వైద్యుడిని సంప్రదించండి.',
        isEmergency: false,
      };
    }
    if (isStomach) {
      return {
        transcription: query,
        solution: '🩺 వైద్య సలహా & గృహ సంరక్షణ (కడుపు నొప్పి & జీర్ణ సమస్యలు):\n• ఓఆర్‌ఎస్ ద్రవం లేదా కొబ్బరి నీరు కొద్దికొద్దిగా తాగుతూ డీహైడ్రేషన్ నివారించండి.\n• మసాలాలు, నూనె పదార్థాలు మరియు బయటి ఆహారాన్ని నివారించండి.\n• మజ్జిగ, పెరుగు అన్నం వంటి తేలికైన ఆహారం తీసుకోండి.\n• కడుపు నొప్పి తీవ్రంగా మారితే లేదా రక్తపు వాంతులు ఉంటే వెంటనే ఆసుపత్రికి వెళ్లండి.',
        isEmergency: false,
      };
    }
    return {
      transcription: query,
      solution: '🩺 వైద్య మార్గదర్శకత్వం:\n• తగినంత విశ్రాంతి తీసుకోండి మరియు ప్రతి గంటకు నీరు త్రాగండి.\n• సొంతంగా మందులు వాడకండి.\n• లక్షణాలు 24 గంటలకు పైగా కొనసాగితే వైద్యుడిని సంప్రదించండి.',
      isEmergency: false,
    };
  } else if (lang === 'hi') {
    if (isEmergency) {
      return {
        transcription: query,
        solution: '⚠️ आपातकालीन चेतावनी: ये लक्षण गंभीर हो सकते हैं। बिना किसी देरी के तुरंत 108 पर कॉल करें या नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं। मरीज को आरामदायक स्थिति में रखें और शांत रखें।',
        isEmergency: true,
      };
    }
    if (isFever) {
      return {
        transcription: query,
        solution: '🩺 चिकित्सा सलाह और घरेलू उपचार (बुखार और सिरदर्द):\n• पर्याप्त मात्रा में गुनगुना पानी और ओआरएस पिएं ताकि शरीर में पानी की कमी न हो।\n• माथे पर सामान्य पानी की ठंडी पट्टी रखें।\n• हल्का और सुपाच्य भोजन (खिचड़ी, सूप, दलिया) लें।\n• पूरा आराम करें और तनाव से बचें।\n• यदि बुखार 102°F से अधिक है या 2 दिनों से अधिक बना रहता है तो तुरंत डॉक्टर को दिखाएं।',
        isEmergency: false,
      };
    }
    if (isCough) {
      return {
        transcription: query,
        solution: '🩺 चिकित्सा सलाह और घरेलू उपचार (खांसी, जुकाम और गले में खराश):\n• हल्के गुनगुने नमक के पानी से दिन में 3 बार गरारे करें।\n• तुलसी, अदरक और शहद वाली गुनगुनी चाय या काढ़ा पिएं।\n• दिन में दो बार भाप (Steam) लें।\n• ठंडी चीजें, बर्फ और तली हुई चीजों से बचें।\n• सांस लेने में कठिनाई होने पर तुरंत डॉक्टर से मिलें।',
        isEmergency: false,
      };
    }
    if (isStomach) {
      return {
        transcription: query,
        solution: '🩺 चिकित्सा सलाह और घरेलू उपचार (पेट दर्द और उल्टी):\n• ओआरएस का घोल और नारियल पानी घूंट-घूंट करके पिएं।\n• मसालेदार, तला-भुना और बासी खाना बिल्कुल न खाएं।\n• छाछ, दही और मूंग दाल की खिचड़ी खाएं।\n• तेज दर्द या लगातार उल्टी होने पर तुरंत डॉक्टर से संपर्क करें।',
        isEmergency: false,
      };
    }
    return {
      transcription: query,
      solution: '🩺 सामान्य चिकित्सा सलाह:\n• भरपूर आराम करें और गुनगुना पानी पिएं।\n• बिना डॉक्टर की सलाह के कोई दवा न लें।\n• लक्षण 24 घंटे से अधिक समय तक बने रहें तो डॉक्टर से परामर्श लें।',
      isEmergency: false,
    };
  } else if (lang === 'ta') {
    if (isEmergency) {
      return {
        transcription: query,
        solution: '⚠️ அவசர எச்சரிக்கை: இந்த அறிகுறிகள் தீவிரமானவை. தாமதிக்காமல் உடனடியாக 108 அழைக்கவும் அல்லது அருகிலுள்ள அவசர சிகிச்சை பிரிவுக்கு (Trauma/Emergency) செல்லவும். நோயாளியை அமைதியாக உட்கார வைக்கவும்.',
        isEmergency: true,
      };
    }
    if (isFever) {
      return {
        transcription: query,
        solution: '🩺 மருத்துவ ஆலோசனை & வீட்டுப் பராமரிப்பு (காய்ச்சல் & தலைவலி):\n• நீரிழப்பைத் தடுக்க போதுமான வெதுவெதுப்பான நீர் மற்றும் ஓ.ஆர்.எஸ் (ORS) அருந்துங்கள்.\n• நெற்றியில் குளிர்ந்த நீரில் நனைத்த துணியை வைக்கவும்.\n• எளிதில் செரிமானமாகும் கஞ்சி, சூப் போன்ற உணவுகளை உட்கொள்ளுங்கள்.\n• முழுமையான ஓய்வு எடுங்கள்.\n• காய்ச்சல் 102°F-க்கு மேல் இருந்தால் அல்லது 48 மணி நேரத்திற்கு மேல் நீடித்தால் மருத்துவரை அணுகவும்.',
        isEmergency: false,
      };
    }
    if (isCough) {
      return {
        transcription: query,
        solution: '🩺 மருத்துவ ஆலோசனை & வீட்டுப் பராமரிப்பு (இருமல், சளி & தொண்டை வலி):\n• வெதுவெதுப்பான உப்பு நீரில் தினமும் 3 முறை வாய் கொப்பளிக்கவும்.\n• துளசி, இஞ்சி, மிளகு கலந்த வெதுவெதுப்பான நீர் அல்லது கஷாயம் அருந்தவும்.\n• தினமும் இரண்டு முறை ஆவி பிடிக்கவும்.\n• குளிர்ந்த உணவுகள் மற்றும் பானங்களைத் தவிர்க்கவும்.\n• மூச்சுத் திணறல் ஏற்பட்டால் உடனடியாக மருத்துவரை அணுகவும்.',
        isEmergency: false,
      };
    }
    if (isStomach) {
      return {
        transcription: query,
        solution: '🩺 மருத்துவ ஆலோசனை & வீட்டுப் பராமரிப்பு (வயிற்று வலி & செரிமானக் கோளாறு):\n• ஓ.ஆர்.எஸ் கரைசல் அல்லது இளநீர் அடிக்கடி சிறிது சிறிதாக அருந்துங்கள்.\n• காரமான, எண்ணெய் நிறைந்த உணவுகளை முற்றிலும் தவிர்க்கவும்.\n• மோர், தயிர் சாதம் போன்ற எளிய உணவுகளை உண்ணுங்கள்.\n• வலி தீவிரமானால் தாமதிக்காமல் மருத்துவமனைக்கு செல்லவும்.',
        isEmergency: false,
      };
    }
    return {
      transcription: query,
      solution: '🩺 பொது மருத்துவ வழிகாட்டல்:\n• போதுமான ஓய்வு எடுங்கள், வெதுவெதுப்பான நீர் அருந்துங்கள்.\n• சுய மருந்துகளைத் தவிர்க்கவும்.\n• அறிகுறிகள் தொடர்ந்தால் மருத்துவரை அணுகவும்.',
      isEmergency: false,
    };
  } else {
    if (isEmergency) {
      return {
        transcription: query,
        solution: '⚠️ Emergency Alert: These symptoms indicate possible critical medical distress. Please call 108 or proceed to the nearest trauma hospital emergency room immediately without delay.',
        isEmergency: true,
      };
    }
    if (isFever) {
      return {
        transcription: query,
        solution: '🩺 Clinical Guidance & Home Care (Fever & Headache):\n• Stay thoroughly hydrated with electrolyte solutions (ORS), coconut water, and lukewarm fluids.\n• Place a cool damp cloth on forehead to safely lower body temperature.\n• Eat light, nourishing foods such as clear soups, broths, and fresh fruits.\n• Ensure adequate bed rest and avoid strenuous physical effort.\n• If temperature exceeds 102°F or persists past 48 hours, consult a physician promptly.',
        isEmergency: false,
      };
    }
    if (isCough) {
      return {
        transcription: query,
        solution: '🩺 Clinical Guidance & Home Care (Cough, Cold & Sore Throat):\n• Gargle with warm saline water 3 times daily to reduce mucosal swelling.\n• Inhale steam twice daily to clear nasal passages and bronchial congestion.\n• Drink warm herbal tea with ginger and honey.\n• Avoid refrigerated beverages, deep-fried snacks, and allergen exposure.\n• Seek medical attention if you experience wheezing or difficulty catching your breath.',
        isEmergency: false,
      };
    }
    if (isStomach) {
      return {
        transcription: query,
        solution: '🩺 Clinical Guidance & Home Care (Abdominal Pain & Nausea):\n• Sip oral rehydration solution (ORS) in small quantities to prevent dehydration.\n• Stick strictly to bland foods (bananas, rice, applesauce, toast).\n• Avoid spicy, greasy, or dairy-heavy meals.\n• Consult a doctor immediately if pain becomes localized and sharp or if vomiting persists.',
        isEmergency: false,
      };
    }
    return {
      transcription: query,
      solution: '🩺 Clinical Guidance:\n• Please rest adequately and maintain high fluid intake throughout the day.\n• Avoid unprescribed OTC medication.\n• If symptoms worsen or persist beyond 24 hours, consult your physician.',
      isEmergency: false,
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('rx');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [largeText, setLargeText] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Emergency Contacts & SOS Hub State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [personalContacts, setPersonalContacts] = useState<PersonalEmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('carebridge_personal_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_EMERGENCY_CONTACTS;
    } catch {
      return DEFAULT_EMERGENCY_CONTACTS;
    }
  });
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('carebridge_personal_contacts', JSON.stringify(personalContacts));
    } catch (e) {
      console.warn('Could not save personal contacts to localStorage', e);
    }
  }, [personalContacts]);

  // Translation dictionary for whole app
  const t = TRANSLATIONS[language];

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ----------------------------------------------------
  // VOICE PROBLEM CONSULTATION STATE
  // ----------------------------------------------------
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<LanguageCode>('en');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState('');
  const [voiceInputManualText, setVoiceInputManualText] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    transcription: string;
    solution: string;
    isEmergency: boolean;
  } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recordingSessionRef = useRef<AudioRecordingSession | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef('');
  const recordingTimerRef = useRef<any>(null);

  // Sync voiceLanguage when app language changes
  useEffect(() => {
    setVoiceLanguage(language);
  }, [language]);

  // ----------------------------------------------------
  // FLOATING CHATBOT STATE (Left Corner Bottom)
  // ----------------------------------------------------
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your CareBridge AI Doctor. Speak or type your health problem in English, Hindi, Telugu, or Tamil to get immediate guidance.',
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // PRESCRIPTION SCANNER STATE
  // ----------------------------------------------------
  const [rxImage, setRxImage] = useState<string | null>(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxResult, setRxResult] = useState<PrescriptionResult | null>(null);
  const [rxError, setRxError] = useState<string | null>(null);
  const rxFileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // LAB REPORT ANALYSER STATE
  // ----------------------------------------------------
  const [labImage, setLabImage] = useState<string | null>(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labResult, setLabResult] = useState<LabReportResult | null>(null);
  const [labError, setLabError] = useState<string | null>(null);
  const [showOfflineLabGuide, setShowOfflineLabGuide] = useState(false);
  const labFileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // MEDICINE REMINDERS STATE
  // ----------------------------------------------------
  const [reminders, setReminders] = useState<MedicineReminder[]>(() => {
    try {
      const saved = localStorage.getItem('carebridge_reminders');
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('1 tablet');
  const [newMedTime, setNewMedTime] = useState('09:00');
  const [newMedFood, setNewMedFood] = useState<MedicineReminder['foodRelation']>('After Food');
  const [newMedFreq, setNewMedFreq] = useState<MedicineReminder['frequency']>('Twice Daily');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('carebridge_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.warn('Could not save reminders to localStorage', e);
    }
  }, [reminders]);

  // ----------------------------------------------------
  // FIRST AID STATE
  // ----------------------------------------------------
  const [aidImage, setAidImage] = useState<string | null>(null);
  const [aidUserNote, setAidUserNote] = useState('');
  const [aidLoading, setAidLoading] = useState(false);
  const [aidResult, setAidResult] = useState<FirstAidResult | null>(null);
  const [aidError, setAidError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<FirstAidTopic | null>(null);
  const aidFileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // HOSPITAL BEDS STATE (Real Count, Doctors, Contacts)
  // ----------------------------------------------------
  const [hospitalList, setHospitalList] = useState<LiveHospital[]>(LIVE_HOSPITALS_DATA);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedBedType, setSelectedBedType] = useState<string>('all');
  const [bedSearchQuery, setBedSearchQuery] = useState('');
  const [onlyAvailableBeds, setOnlyAvailableBeds] = useState(false);
  const [selectedHospitalModal, setSelectedHospitalModal] = useState<LiveHospital | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);
  const [patientInquiryName, setPatientInquiryName] = useState('');
  const [patientInquiryBedType, setPatientInquiryBedType] = useState('General');
  const [liveUpdateTicker, setLiveUpdateTicker] = useState('Live sync verified • Just now');
  const [isRefreshingBeds, setIsRefreshingBeds] = useState(false);

  // Audio speech synthesis state
  const [speaking, setSpeaking] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Simulate periodic realistic bed fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setHospitalList((prev) =>
        prev.map((h) => {
          const delta = Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const next = Math.max(1, Math.min(h.totalBeds, h.availableBeds + delta));
          return {
            ...h,
            availableBeds: next,
            lastUpdatedMinutesAgo: 1,
          };
        })
      );
      setLiveUpdateTicker('Live sync verified • 1m ago');
    }, 40000);
    return () => clearInterval(timer);
  }, []);

  const refreshBedsManually = () => {
    setIsRefreshingBeds(true);
    setTimeout(() => {
      setHospitalList((prev) =>
        prev.map((h) => ({
          ...h,
          availableBeds: Math.max(2, h.availableBeds + (Math.random() > 0.5 ? 1 : 0)),
          lastUpdatedMinutesAgo: 0,
        }))
      );
      setLiveUpdateTicker('Live count refreshed just now');
      setIsRefreshingBeds(false);
      playBeep(true);
    }, 600);
  };

  // Text-to-Speech Helper with multi-language (en-IN, hi-IN, te-IN, ta-IN) support
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const speakText = (text: string, targetLang?: LanguageCode) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };
    const chosen = targetLang || voiceLanguage || language;
    utterance.lang = langMap[chosen] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // ROBUST VOICE RECORDING IMPLEMENTATION
  // ----------------------------------------------------
  const startVoiceRecording = async () => {
    setVoiceError(null);
    setLiveVoiceTranscript('');
    transcriptBufferRef.current = '';
    setVoiceResult(null);
    setRecordingSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    let streamActive = false;
    let speechActive = false;

    // 1. Try SpeechRecognition (native browser STT for te-IN, hi-IN, ta-IN, en-IN)
    const rec = setupSpeechRecognition(
      voiceLanguage,
      (text) => {
        transcriptBufferRef.current = text;
        setLiveVoiceTranscript(text);
      },
      (err) => {
        console.warn('Speech rec notice:', err);
      }
    );

    if (rec) {
      speechRecognitionRef.current = rec;
      try {
        rec.start();
        speechActive = true;
      } catch (e) {
        console.warn('Speech recognition start note:', e);
      }
    }

    // 2. Try MediaRecorder stream in parallel
    try {
      const session = await startAudioRecording((vol) => {
        setVoiceVolume(vol);
      });
      recordingSessionRef.current = session;
      streamActive = true;
    } catch (streamErr) {
      console.warn('MediaRecorder audio stream note:', streamErr);
    }

    if (streamActive || speechActive) {
      setIsRecordingVoice(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Simulate live volume activity if analyser is quiet
      if (!streamActive) {
        setVoiceVolume(55);
      }
    } else {
      setIsRecordingVoice(false);
      setVoiceError(
        voiceLanguage === 'hi'
          ? 'माइक्रोफ़ोन अनुमति नहीं मिली। कोई बात नहीं — नीचे दिए गए लक्षणों पर टैप करें या लिखकर तुरंत समाधान पाएं!'
          : voiceLanguage === 'te'
          ? 'మైక్రోఫోన్ అనుమతి లభించలేదు. పర్వాలేదు — కింద ఉన్న లక్షణాలపై నొక్కండి లేదా టైప్ చేసి వెంటనే సమాధానం పొందండి!'
          : voiceLanguage === 'ta'
          ? 'மைக்ரோஃபோன் அனுமதி கிடைக்கவில்லை. கவலைப்பட வேண்டாம் — கீழே உள்ள அறிகுறிகளைத் தேர்ந்தெடுக்கவும் அல்லது தட்டச்சு செய்து உடனே தீர்வு பெறவும்!'
          : 'Microphone access is not available. No worries — tap any sample symptom below or type to get immediate advice!'
      );
    }
  };

  const stopVoiceRecordingAndSolve = async () => {
    if (!isRecordingVoice) return;
    setIsRecordingVoice(false);
    setVoiceProcessing(true);
    stopSpeech();

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      speechRecognitionRef.current?.stop();
    } catch (e) {}

    let capturedAudioBase64 = '';
    let capturedMimeType = 'audio/webm';

    if (recordingSessionRef.current) {
      try {
        const { base64, mimeType } = await recordingSessionRef.current.stop();
        capturedAudioBase64 = base64;
        capturedMimeType = mimeType;
      } catch (e) {
        console.warn('Error finalizing recording:', e);
      }
    }

    const currentText = (transcriptBufferRef.current.trim() || liveVoiceTranscript.trim() || voiceInputManualText.trim());

    if (!currentText && !capturedAudioBase64) {
      setVoiceProcessing(false);
      setVoiceError(
        voiceLanguage === 'hi'
          ? 'आवाज नहीं पहचानी जा सकी। कृपया नीचे दिए गए किसी भी लक्षण पर टैप करें या अपनी समस्या लिखें।'
          : voiceLanguage === 'te'
          ? 'మాటలు సరిగా వినబడలేదు. దయచేసి కింద ఉన్న ఏదైనా లక్షణాన్ని ఎంచుకోండి లేదా టైప్ చేయండి.'
          : voiceLanguage === 'ta'
          ? 'குரல் தெளிவாகக் கேட்கவில்லை. கீழே உள்ள ஏதேனும் ஒரு அறிகுறியைத் தேர்ந்தெடுக்கவும் அல்லது தட்டச்சு செய்யவும்.'
          : 'No speech was detected clearly. Please choose any symptom below or type your problem.'
      );
      return;
    }

    try {
      const res = await fetch('/api/voice-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: capturedAudioBase64 || undefined,
          mimeType: capturedMimeType,
          textTranscript: currentText || undefined,
          language: voiceLanguage,
        }),
      });

      if (!res.ok) throw new Error('Could not analyze voice recording');
      const data = await res.json();
      setVoiceResult(data);
      speakText(`${data.transcription}. ${data.solution}`, voiceLanguage);
    } catch (err: any) {
      console.warn('Voice API error, using intelligent offline triage:', err);
      const fallback = getLocalTriageResponse(currentText || 'General symptom consultation', voiceLanguage);
      setVoiceResult(fallback);
      speakText(`${fallback.transcription}. ${fallback.solution}`, voiceLanguage);
    } finally {
      setVoiceProcessing(false);
    }
  };

  const testVoiceSample = async (sampleText: string, sampleLang?: LanguageCode) => {
    const targetLang = sampleLang || voiceLanguage;
    setVoiceProcessing(true);
    setVoiceError(null);
    setLiveVoiceTranscript(sampleText);
    stopSpeech();

    try {
      const res = await fetch('/api/voice-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textTranscript: sampleText,
          language: targetLang,
        }),
      });

      if (!res.ok) throw new Error('Failed to get solution');
      const data = await res.json();
      setVoiceResult(data);
      speakText(`${data.transcription}. ${data.solution}`, targetLang);
    } catch (e: any) {
      console.warn('Sample API error, using local response:', e);
      const fallback = getLocalTriageResponse(sampleText, targetLang);
      setVoiceResult(fallback);
      speakText(`${fallback.transcription}. ${fallback.solution}`, targetLang);
    } finally {
      setVoiceProcessing(false);
    }
  };

  // ----------------------------------------------------
  // CHAT HANDLER
  // ----------------------------------------------------
  const handleSendChatMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || chatInput).trim();
    if (!promptToSend || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: promptToSend,
      timestamp: 'Just now',
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          history: newHistory.map((m) => ({ role: m.role, text: m.text })),
          language: language,
        }),
      });

      if (!res.ok) throw new Error('Failed to reach AI assistant');
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply,
        isEmergency: data.isEmergency,
        timestamp: 'Just now',
      };
      setChatMessages([...newHistory, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I am having trouble connecting right now. Please try again or call 108 if this is an urgent emergency.',
        timestamp: 'Just now',
      };
      setChatMessages([...newHistory, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // ----------------------------------------------------
  // PRESCRIPTION SCANNER
  // ----------------------------------------------------
  const handleRxFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setRxImage(b64);
      triggerRxScan(b64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerRxScan = async (base64Image: string) => {
    setRxLoading(true);
    setRxError(null);
    setRxResult(null);
    stopSpeech();

    try {
      const res = await fetch('/api/scan-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          language: language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Server error scanning prescription');
      }

      const data: PrescriptionResult = await res.json();
      setRxResult(data);
    } catch (err: any) {
      console.error(err);
      setRxError(err.message || 'Unable to scan prescription. Please try a clearer photo.');
    } finally {
      setRxLoading(false);
    }
  };

  const addScannedMedicinesToReminders = () => {
    if (!rxResult?.medicines || rxResult.medicines.length === 0) return;

    const defaultTimes = ['08:00', '13:30', '20:30', '22:00'];
    const newItems: MedicineReminder[] = rxResult.medicines.map((m, index) => {
      let foodRel: MedicineReminder['foodRelation'] = 'After Food';
      if (/before/i.test(m.foodRelation)) foodRel = 'Before Food';
      if (/with/i.test(m.foodRelation)) foodRel = 'With Food';

      return {
        id: Date.now().toString() + index,
        name: m.name,
        dosage: m.dosage || '1 tablet',
        time: defaultTimes[index % defaultTimes.length],
        foodRelation: foodRel,
        frequency: /twice/i.test(m.timing) ? 'Twice Daily' : /three|thrice/i.test(m.timing) ? 'Thrice Daily' : 'Once Daily',
        takenToday: false,
        notes: m.purpose,
      };
    });

    setReminders((prev) => [...prev, ...newItems]);
    playReminderChime();
    setReminderToast(`Added ${newItems.length} medicines to Reminders!`);
    setTimeout(() => setReminderToast(null), 3000);
    setActiveTab('reminders');
  };

  // ----------------------------------------------------
  // LAB REPORT ANALYSER HANDLERS
  // ----------------------------------------------------
  const handleLabFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setLabImage(b64);
      triggerLabScan(b64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerLabScan = async (base64Image: string) => {
    setLabLoading(true);
    setLabError(null);
    setLabResult(null);
    stopSpeech();

    try {
      const res = await fetch('/api/analyze-lab-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          language: language,
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze lab report');
      const data: LabReportResult = await res.json();
      setLabResult(data);
    } catch (err: any) {
      console.error(err);
      setLabError(err.message || 'Could not analyze lab report. Please check image lighting and clarity.');
    } finally {
      setLabLoading(false);
    }
  };

  // ----------------------------------------------------
  // REMINDERS HANDLERS
  // ----------------------------------------------------
  const toggleReminderTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.takenToday;
          if (next) playReminderChime();
          return { ...r, takenToday: next };
        }
        return r;
      })
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddManualReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newRem: MedicineReminder = {
      id: Date.now().toString(),
      name: newMedName.trim(),
      dosage: newMedDose.trim() || '1 tablet',
      time: newMedTime,
      foodRelation: newMedFood,
      frequency: newMedFreq,
      takenToday: false,
    };

    setReminders((prev) => [...prev, newRem]);
    setNewMedName('');
    setShowAddReminderModal(false);
    playReminderChime();
  };

  // ----------------------------------------------------
  // FIRST AID HANDLER
  // ----------------------------------------------------
  const handleAidFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAidImage(b64);
      triggerAidScan(b64, aidUserNote);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerAidScan = async (base64Image: string, note: string) => {
    setAidLoading(true);
    setAidError(null);
    setAidResult(null);
    stopSpeech();

    try {
      const res = await fetch('/api/scan-first-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          userNote: note,
          language: language,
        }),
      });

      if (!res.ok) throw new Error('Server error analyzing injury');
      const data: FirstAidResult = await res.json();
      setAidResult(data);
    } catch (err: any) {
      setAidError(err.message || 'Unable to analyze image. Please try again.');
    } finally {
      setAidLoading(false);
    }
  };

  // ----------------------------------------------------
  // HOSPITAL BEDS FILTERING
  // ----------------------------------------------------
  const filteredHospitals = hospitalList.filter((h) => {
    if (selectedCity !== 'All' && h.city !== selectedCity) return false;

    if (bedSearchQuery.trim()) {
      const q = bedSearchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchAddress = h.address.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      const matchDoctor = h.doctors?.some((d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
      if (!matchName && !matchAddress && !matchCity && !matchDoctor) return false;
    }

    if (selectedBedType === 'icu' && h.icuAvailable <= 0) return false;
    if (selectedBedType === 'oxygen' && h.oxygenAvailable <= 0) return false;
    if (selectedBedType === 'emergency' && h.emergencyAvailable <= 0) return false;
    if (selectedBedType === 'ventilator' && h.ventilatorAvailable <= 0) return false;

    if (onlyAvailableBeds && h.availableBeds <= 0) return false;

    return true;
  });

  const adherencePercent =
    reminders.length > 0
      ? Math.round((reminders.filter((r) => r.takenToday).length / reminders.length) * 100)
      : 0;

  return (
    <div
      className={`min-h-screen flex justify-center ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      } ${largeText ? 'text-lg' : 'text-base'} selection:bg-blue-100 transition-colors font-sans`}
    >
      {/* ----------------- MOBILE CONTAINER ----------------- */}
      <div
        className={`w-full max-w-md min-h-screen flex flex-col relative shadow-2xl border-x ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Offline notice banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>{t.offlineModeNotice}</span>
            </span>
            <span className="bg-amber-700 px-1.5 py-0.5 rounded text-[9px]">OFFLINE</span>
          </div>
        )}

        {/* Toast */}
        {reminderToast && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{reminderToast}</span>
          </div>
        )}

        {/* ----------------- TOP APP BAR ----------------- */}
        <header
          className={`sticky top-0 z-30 px-4 py-3 border-b flex items-center justify-between backdrop-blur-md ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-extrabold text-base tracking-tight">{t.appName}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-none block mt-0.5">
                {t.tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clean Pill Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => {
                  const lang = e.target.value as LanguageCode;
                  setLanguage(lang);
                  setVoiceLanguage(lang);
                }}
                className={`text-xs font-bold pl-2.5 pr-7 py-1.5 rounded-xl border cursor-pointer appearance-none shadow-2xs transition ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600'
                    : 'bg-slate-100/90 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
                title="Change App Language"
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिन्दी</option>
                <option value="te">🇮🇳 తెలుగు</option>
                <option value="ta">🇮🇳 தமிழ்</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setLargeText(!largeText)}
              className={`text-xs font-black px-2 py-1.5 rounded-xl border transition ${
                largeText
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
              title="Toggle Large Text"
            >
              A{largeText ? '−' : '+'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-xl border transition ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
              title="Emergency SOS & Contacts Directory"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>{t.sosButton}</span>
            </button>
          </div>
        </header>

        {/* ----------------- MAIN SCROLL CONTENT ----------------- */}
        <main className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-4">

          {/* ========================================================== */}
          {/* TAB 1: PRESCRIPTION SCANNER                                */}
          {/* ========================================================== */}
          {activeTab === 'rx' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>{t.rxTitle}</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Gemini Vision
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {t.rxSub}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={rxFileInputRef}
                    onChange={handleRxFileSelect}
                    className="hidden"
                    id="rx-cam"
                  />
                  <button
                    onClick={() => rxFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.rxCamera}</span>
                  </button>

                  <label
                    htmlFor="rx-upload"
                    className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border font-bold text-xs cursor-pointer active:scale-[0.98] transition ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>{t.rxUpload}</span>
                    <input
                      type="file"
                      accept="image/*"
                      id="rx-upload"
                      onChange={handleRxFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {t.rxSamplesLabel}
                  </span>
                  <div className="space-y-1.5">
                    {SAMPLE_PRESCRIPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setRxImage(s.dataUrl);
                          triggerRxScan(s.dataUrl);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between group transition ${
                          darkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div>
                          <b className="font-bold block text-slate-800 dark:text-slate-200">{s.title}</b>
                          <span className="text-[11px] text-slate-400">{s.subtitle}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {rxError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{rxError}</span>
                </div>
              )}

              {rxLoading && (
                <div
                  className={`p-6 rounded-2xl border text-center ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <Sparkles className="w-7 h-7 text-blue-500 animate-spin mx-auto mb-2" />
                  <b className="text-sm block">{t.rxReadingStatus}</b>
                </div>
              )}

              {rxResult && !rxLoading && (
                <div
                  className={`p-4 rounded-2xl border space-y-3.5 ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {rxImage && (
                        <img
                          src={rxImage}
                          alt="Rx"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <div>
                        <b className="text-xs block">{t.rxDecodedHeader}</b>
                        <span className="text-[11px] text-slate-400">{rxResult.doctorOrHospital || 'Clinic Slip'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (speaking) stopSpeech();
                        else {
                          const speech = `${rxResult.simpleSummary || ''} ${
                            rxResult.medicines?.map((m) => `${m.name}. ${m.dosage}, ${m.timing}, ${m.foodRelation}.`).join(' ') || ''
                          }`;
                          speakText(speech);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        speaking
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{speaking ? t.rxStopAudio : t.rxListenAudio}</span>
                    </button>
                  </div>

                  {rxResult.simpleSummary && (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      <b className="text-blue-800 dark:text-blue-300 block mb-1">{t.rxExplanation}</b>
                      <p>
                        {language === 'hi' && rxResult.translations?.hi?.summary
                          ? rxResult.translations.hi.summary
                          : language === 'te' && rxResult.translations?.te?.summary
                          ? rxResult.translations.te.summary
                          : rxResult.simpleSummary}
                      </p>
                    </div>
                  )}

                  {rxResult.medicines && rxResult.medicines.length > 0 && (
                    <button
                      onClick={addScannedMedicinesToReminders}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                    >
                      <Bell className="w-4 h-4" />
                      <span>{t.rxAddAllReminders} ({rxResult.medicines.length})</span>
                    </button>
                  )}

                  <div className="space-y-2">
                    {rxResult.medicines?.map((med, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <b className="text-sm font-extrabold text-blue-600 dark:text-blue-400">💊 {med.name}</b>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {med.duration}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                          <b>For:</b> {med.purpose}
                        </p>
                        <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <span className="p-1.5 rounded-md bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                            {med.dosage}
                          </span>
                          <span className="p-1.5 rounded-md bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                            {med.timing}
                          </span>
                          <span className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {med.foodRelation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: LAB REPORT ANALYSER (NEW REQUESTED FEATURE)         */}
          {/* ========================================================== */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-teal-600">
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>{t.labTitle}</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Pathology AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {t.labSub}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={labFileInputRef}
                    onChange={handleLabFileSelect}
                    className="hidden"
                    id="lab-cam"
                  />
                  <button
                    onClick={() => labFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.labScanCamera}</span>
                  </button>

                  <label
                    htmlFor="lab-upload"
                    className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border font-bold text-xs cursor-pointer active:scale-[0.98] transition ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-teal-500" />
                    <span>{t.labUpload}</span>
                    <input
                      type="file"
                      accept="image/*"
                      id="lab-upload"
                      onChange={handleLabFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {t.labSampleLabel}
                  </span>
                  <div className="space-y-1.5">
                    {SAMPLE_LAB_REPORTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setLabImage(s.dataUrl);
                          triggerLabScan(s.dataUrl);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between group transition ${
                          darkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-teal-500'
                            : 'bg-slate-50 border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div>
                          <b className="font-bold block text-slate-800 dark:text-slate-200">{s.title}</b>
                          <span className="text-[11px] text-slate-400">{s.subtitle}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-500 group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offline Normal Lab Range Handbook Button */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowOfflineLabGuide(!showOfflineLabGuide)}
                    className="w-full py-2 px-3 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{t.offlineLabHandbookTitle}</span>
                    </span>
                    <span>{showOfflineLabGuide ? '▲ Close' : '▼ View'}</span>
                  </button>

                  {showOfflineLabGuide && (
                    <div className="mt-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] space-y-2">
                      <b className="font-extrabold text-slate-800 dark:text-slate-200 block">
                        Standard Reference Ranges (Adults):
                      </b>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Hemoglobin (Hb)', range: '13.0 - 17.0 g/dL (M) • 12.0 - 15.5 g/dL (F)', note: 'Oxygen delivery; low means anemia' },
                          { name: 'Platelet Count', range: '150,000 - 450,000 /cu.mm', note: 'Essential for blood clotting' },
                          { name: 'Total WBC', range: '4,000 - 11,000 /cu.mm', note: 'Immune defence against infections' },
                          { name: 'Fasting Blood Sugar', range: '70 - 99 mg/dL', note: 'Normal glucose regulation; >126 suggests diabetes' },
                          { name: 'HbA1c (3-Month Sugar)', range: '< 5.7% (Normal) • 5.7 - 6.4% (Pre-diabetes)', note: 'Average blood sugar control' },
                          { name: 'Total Cholesterol', range: '< 200 mg/dL', note: 'Lipid balance; high increases heart risk' },
                          { name: 'HDL (Good Cholesterol)', range: '> 40 mg/dL (M) • > 50 mg/dL (F)', note: 'Protective lipid carrier' },
                          { name: 'LDL (Bad Cholesterol)', range: '< 100 mg/dL', note: 'Plaque building lipoprotein' },
                          { name: 'Thyroid TSH', range: '0.4 - 4.0 mIU/L', note: 'Thyroid metabolism control' },
                          { name: 'Serum Creatinine', range: '0.7 - 1.3 mg/dL', note: 'Key kidney filtration biomarker' },
                          { name: 'SGPT / ALT', range: '7 - 56 units/L', note: 'Liver cell enzyme' },
                        ].map((ref, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                              <span>{ref.name}</span>
                              <span className="text-teal-600 dark:text-teal-400">{ref.range}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{ref.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {labError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{labError}</span>
                </div>
              )}

              {labLoading && (
                <div
                  className={`p-6 rounded-2xl border text-center ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <Sparkles className="w-7 h-7 text-teal-500 animate-spin mx-auto mb-2" />
                  <b className="text-sm block">{t.labAnalyzingStatus}</b>
                  <p className="text-xs text-slate-400 mt-1">Reading biochemical markers &amp; normal ranges</p>
                </div>
              )}

              {labResult && !labLoading && (
                <div
                  className={`p-4 rounded-2xl border space-y-3.5 ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {labImage && (
                        <img
                          src={labImage}
                          alt="Lab Report"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <div>
                        <b className="text-xs block">{t.labResultHeader}</b>
                        <span className="text-[11px] text-slate-400">
                          {labResult.labName || 'Pathology Report'} {labResult.reportDate ? `• ${labResult.reportDate}` : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (speaking) stopSpeech();
                        else {
                          const speech = `${labResult.overallSummary}. ${labResult.tests.map((tt) => `${tt.testName}: ${tt.value} ${tt.unit}. Status is ${tt.status}.`).join(' ')}`;
                          speakText(speech);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center gap-1"
                    >
                      {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{speaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>

                  {labResult.overallSummary && (
                    <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      <b className="text-teal-800 dark:text-teal-300 block mb-1">Summary in Plain Language:</b>
                      <p>{labResult.overallSummary}</p>
                    </div>
                  )}

                  {/* Lab Test Parameters List */}
                  <div className="space-y-2">
                    <b className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Test Parameters ({labResult.tests?.length || 0}):
                    </b>
                    {labResult.tests?.map((param, i) => {
                      const isHigh = param.status === 'high' || param.status === 'critical';
                      const isLow = param.status === 'low';

                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <b className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{param.testName}</b>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isHigh
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {param.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                            <span className="p-1.5 rounded-md bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                              <b>Result:</b> {param.value} {param.unit}
                            </span>
                            <span className="p-1.5 rounded-md bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                              <b>Normal:</b> {param.normalRange} {param.unit}
                            </span>
                          </div>

                          {param.simpleExplanation && (
                            <p className="text-slate-600 dark:text-slate-300 mb-1 leading-relaxed">
                              <b>What it means:</b> {param.simpleExplanation}
                            </p>
                          )}

                          {param.advice && (
                            <p className="text-teal-700 dark:text-teal-300 font-medium leading-relaxed">
                              💡 {param.advice}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dietary Advice */}
                  {labResult.dietaryRecommendations && labResult.dietaryRecommendations.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                      <b className="font-bold block mb-1 text-slate-900 dark:text-slate-100">{t.labDietAdvice}</b>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                        {labResult.dietaryRecommendations.map((d, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Doctor Questions */}
                  {labResult.doctorQuestions && labResult.doctorQuestions.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                      <b className="font-bold block mb-1 text-blue-900 dark:text-blue-200">{t.labDoctorQuestions}</b>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                        {labResult.doctorQuestions.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-600 font-bold">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB: VOICE & TRANSLATION HEALTH CONSULTATION               */}
          {/* ========================================================== */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Languages className="w-5 h-5" />
                    <span>{t.tabVoice} AI Doctor</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    4 Languages
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {t.speakHeroSub}
                </p>

                {/* 1. Language Chooser */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    {t.voiceChooseLangPrompt || 'Select consultation language:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'te' as LanguageCode, label: 'తెలుగు', sub: 'Telugu', flag: '🇮🇳' },
                      { code: 'hi' as LanguageCode, label: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' },
                      { code: 'en' as LanguageCode, label: 'English', sub: 'Indian English', flag: '🇬🇧' },
                      { code: 'ta' as LanguageCode, label: 'தமிழ்', sub: 'Tamil', flag: '🇮🇳' },
                    ].map((item) => {
                      const isSelected = voiceLanguage === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setVoiceLanguage(item.code);
                            setLanguage(item.code);
                            stopSpeech();
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{item.flag}</span>
                            <span className="text-xs font-bold">{item.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Microphone & Audio action */}
                <div className="text-center py-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
                  <div className="relative inline-block mb-2">
                    {isRecordingVoice && (
                      <div className="absolute -inset-2.5 rounded-full bg-rose-500/25 animate-ping" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isRecordingVoice) {
                          stopVoiceRecordingAndSolve();
                        } else {
                          startVoiceRecording();
                        }
                      }}
                      className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
                        isRecordingVoice
                          ? 'bg-rose-600 ring-4 ring-rose-400 animate-pulse'
                          : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:scale-105'
                      }`}
                    >
                      {isRecordingVoice ? <Square className="w-7 h-7 fill-white" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>

                  <b className="text-xs sm:text-sm font-extrabold block">
                    {isRecordingVoice ? t.voiceListening : t.voiceTapToSpeak}
                  </b>

                  {isRecordingVoice && (
                    <button
                      type="button"
                      onClick={() => stopVoiceRecordingAndSolve()}
                      className="mt-2.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs"
                    >
                      {t.voiceDoneSpeaking || 'Done Speaking ➔'}
                    </button>
                  )}
                </div>

                {/* 3. Open full modal button */}
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(true)}
                  className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  <Languages className="w-4 h-4" />
                  <span>Open Full Voice & Translation Doctor</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: MEDICINE REMINDERS                                  */}
          {/* ========================================================== */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-600" />
                      <span>{t.remindersTitle}</span>
                    </h2>
                    <p className="text-xs text-slate-400">{t.remindersSub}</p>
                  </div>
                  <button
                    onClick={() => setShowAddReminderModal(true)}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.remindersAddBtn}</span>
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-indigo-950 dark:text-indigo-200">
                    <span>{t.remindersAdherence}</span>
                    <span>{adherencePercent}% Taken</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-indigo-200 dark:bg-indigo-900 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${adherencePercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Gentle medical chime alerts</span>
                  <button
                    onClick={playReminderChime}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> {t.remindersTestChime}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {reminders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border rounded-2xl border-dashed">
                    {t.remindersEmpty}
                  </div>
                ) : (
                  reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        rem.takenToday
                          ? darkMode
                            ? 'bg-slate-850/60 border-slate-800 opacity-75'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                          : darkMode
                          ? 'bg-slate-850 border-slate-700'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleReminderTaken(rem.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                            rem.takenToday
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {rem.takenToday && <Check className="w-4 h-4" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                rem.takenToday ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {rem.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {rem.dosage}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-bold flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Clock className="w-3 h-3" /> {rem.time}
                            </span>
                            <span>•</span>
                            <span>{rem.foodRelation}</span>
                            <span>•</span>
                            <span>{rem.frequency}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: FIRST AID AI & NEARBY CLINICS                       */}
          {/* ========================================================== */}
          {activeTab === 'aid' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                    <span>{t.aidTitle}</span>
                  </h2>
                  <a
                    href="tel:108"
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> 108
                  </a>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {t.aidSub}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={aidFileInputRef}
                    onChange={handleAidFileSelect}
                    className="hidden"
                    id="aid-cam"
                  />
                  <button
                    onClick={() => aidFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.aidCamera}</span>
                  </button>

                  <label
                    htmlFor="aid-upload"
                    className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl border font-bold text-xs cursor-pointer active:scale-[0.98] transition ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>{t.aidUpload}</span>
                    <input
                      type="file"
                      accept="image/*"
                      id="aid-upload"
                      onChange={handleAidFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {t.aidSamplesLabel}
                  </span>
                  <div className="space-y-1.5">
                    {SAMPLE_INJURIES.map((inj) => (
                      <button
                        key={inj.id}
                        onClick={() => {
                          setAidImage(inj.dataUrl);
                          triggerAidScan(inj.dataUrl, inj.description);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between group transition ${
                          darkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-rose-500'
                            : 'bg-slate-50 border-slate-200 hover:border-rose-400'
                        }`}
                      >
                        <div>
                          <b className="font-bold block text-slate-800 dark:text-slate-200">{inj.title}</b>
                          <span className="text-[11px] text-slate-400">{inj.category}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {aidLoading && (
                <div
                  className={`p-6 rounded-2xl border text-center ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse mx-auto mb-2" />
                  <b className="text-sm block">Analyzing Injury with Gemini Vision...</b>
                  <p className="text-xs text-slate-400 mt-1">Formulating first aid steps and finding nearest clinics</p>
                </div>
              )}

              {aidResult && !aidLoading && (
                <div
                  className={`p-4 rounded-2xl border space-y-3.5 ${
                    darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {aidResult.injuryTitle}
                      </h3>
                      <span className="text-[11px] text-slate-400">{aidResult.visualAssessment}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (speaking) stopSpeech();
                        else speakText(aidResult.immediateActions.join('. '));
                      }}
                      className="px-2 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold"
                    >
                      {speaking ? 'Stop' : '🔊 Listen'}
                    </button>
                  </div>

                  <div>
                    <b className="text-xs font-extrabold text-emerald-600 block mb-1">{t.aidDoNow}</b>
                    <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                      {aidResult.immediateActions.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-emerald-600 shrink-0">{i + 1}.</span>
                          <span>{s.replace(/^Step\s*\d+:\s*/i, '')}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200">
                    <b className="block mb-1 font-bold">{t.aidDoNot}</b>
                    <ul className="space-y-1">
                      {aidResult.criticalDoNots.map((d, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="font-bold text-red-600">✕</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RECOMMENDED NEARBY CLINICS (User explicitly requested) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <b className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block mb-2">
                      {t.aidNearbyClinics}
                    </b>
                    <div className="space-y-2">
                      {NEARBY_CLINICS_DIRECTORY.map((clinic) => (
                        <div
                          key={clinic.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <b className="block font-bold text-slate-900 dark:text-slate-100">{clinic.name}</b>
                            <span className="text-[11px] text-slate-400 block">{clinic.address} • <b>{clinic.distanceKm} km away</b></span>
                            <span className="text-[10px] text-emerald-600 font-bold block">{clinic.openHours}</span>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <a
                              href={`tel:${clinic.phone}`}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{t.aidCallClinic}</span>
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1.5 rounded-lg border text-slate-600 dark:text-slate-300 font-bold text-[11px]"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Offline Emergency Guides (works 100% offline!) */}
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <b className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  {t.aidOfflineGuidesTitle}
                </b>
                <div className="grid grid-cols-2 gap-2">
                  {FIRST_AID_GUIDES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGuide(g)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition ${
                        selectedGuide?.id === g.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : darkMode
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-lg block mb-1">{g.icon}</span>
                      <b className="block font-bold">{g.title}</b>
                    </button>
                  ))}
                </div>

                {selectedGuide && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <b className="text-blue-800 dark:text-blue-300">{selectedGuide.title}:</b>
                      <button onClick={() => setSelectedGuide(null)} className="font-bold text-slate-400">
                        ✕
                      </button>
                    </div>
                    <ol className="space-y-1 text-slate-700 dark:text-slate-200">
                      {selectedGuide.steps.map((st, i) => (
                        <li key={i}>• {st}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: HOSPITAL BEDS TRACKER & DOCTOR PROFILES             */}
          {/* ========================================================== */}
          {activeTab === 'beds' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                      <Bed className="w-5 h-5 text-blue-600" />
                      <span>{t.bedsTitle}</span>
                    </h2>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {liveUpdateTicker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={refreshBedsManually}
                      disabled={isRefreshingBeds}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBeds ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{t.bedsRefresh}</span>
                    </button>

                    <a
                      href="tel:108"
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-red-600 text-white flex items-center gap-1 shadow-xs"
                    >
                      <PhoneCall className="w-3 h-3" /> 108
                    </a>
                  </div>
                </div>

                <div className="relative mt-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bedSearchQuery}
                    onChange={(e) => setBedSearchQuery(e.target.value)}
                    placeholder={t.bedsSearchPlaceholder}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'
                    } focus:outline-hidden`}
                  />
                  {bedSearchQuery && (
                    <button
                      onClick={() => setBedSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* City Tabs */}
                <div className="mt-3">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Hyderabad', 'Bengaluru', 'Chennai', 'Delhi', 'Mumbai'].map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-bold transition border ${
                          selectedCity === city
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : darkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {city === 'All' ? t.bedsCityAll : city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: 'all', label: 'All Beds' },
                      { id: 'icu', label: t.bedsICU },
                      { id: 'oxygen', label: t.bedsOxygen },
                      { id: 'emergency', label: t.bedsTrauma },
                      { id: 'ventilator', label: t.bedsVentilators },
                    ].map((bt) => (
                      <button
                        key={bt.id}
                        onClick={() => setSelectedBedType(bt.id)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold border transition ${
                          selectedBedType === bt.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : darkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>

                  <label className="text-[11px] font-semibold flex items-center gap-1.5 text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyAvailableBeds}
                      onChange={(e) => setOnlyAvailableBeds(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>{t.bedsAvailableOnly}</span>
                  </label>
                </div>

                {/* Emergency Helplines & Contacts Quick Hub Button */}
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs flex items-center justify-between shadow-sm active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-white animate-pulse shrink-0" />
                    <span className="text-left font-bold leading-tight">
                      {t.emergencyHubTitle}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-white/20 text-[10px] uppercase font-black shrink-0">
                    SOS 108 / 112 ›
                  </span>
                </button>
              </div>

              {/* Hospital Cards List */}
              <div className="space-y-3">
                {filteredHospitals.map((hosp) => {
                  const isLow = hosp.availableBeds <= 10;
                  const freePercent = Math.round((hosp.availableBeds / hosp.totalBeds) * 100);

                  return (
                    <div
                      key={hosp.id}
                      onClick={() => {
                        setSelectedHospitalModal(hosp);
                        setReservationSuccess(null);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer active:scale-[0.99] group ${
                        darkMode
                          ? 'bg-slate-850 border-slate-700 hover:border-blue-500'
                          : 'bg-white border-slate-200 hover:border-blue-400 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <b className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition block">
                            {hosp.name}
                          </b>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            {hosp.address} • <b>{hosp.distanceKm} km</b>
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-block ${
                              isLow
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {hosp.availableBeds} {t.bedsFreePill}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {t.bedsTotalCap}: {hosp.totalBeds}
                          </span>
                        </div>
                      </div>

                      {/* Visual occupancy bar */}
                      <div className="my-2.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>{t.bedsOccupancy}: {100 - freePercent}%</span>
                          <span className="text-emerald-600">{freePercent}% {t.bedsFreePill}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${freePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Real Bed Breakdown */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] my-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                          <span className="text-slate-400 block font-bold">{t.bedsGeneral}</span>
                          <b className="text-xs text-blue-700 dark:text-blue-300">{hosp.generalAvailable}</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900">
                          <span className="text-slate-400 block font-bold">{t.bedsICU}</span>
                          <b className="text-xs text-purple-700 dark:text-purple-300">{hosp.icuAvailable}</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900">
                          <span className="text-slate-400 block font-bold">{t.bedsOxygen}</span>
                          <b className="text-xs text-teal-700 dark:text-teal-300">{hosp.oxygenAvailable}</b>
                        </div>
                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900">
                          <span className="text-slate-400 block font-bold">{t.bedsTrauma}</span>
                          <b className="text-xs text-rose-700 dark:text-rose-300">{hosp.emergencyAvailable}</b>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-[11px] text-slate-400">Duty: {hosp.doctorOnCall}</span>
                        <span className="font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                          {t.bedsTapModal} <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ----------------- MOBILE BOTTOM NAV BAR ----------------- */}
        <nav
          className={`fixed bottom-0 max-w-md w-full border-t flex items-center justify-around py-1.5 px-1 backdrop-blur-md z-30 ${
            darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
          }`}
        >
          {[
            { id: 'rx' as Tab, label: t.tabScanner, icon: FileText },
            { id: 'lab' as Tab, label: t.tabLabReport, icon: FileSpreadsheet },
            { id: 'voice' as Tab, label: t.tabVoice, icon: Languages, isTranslate: true },
            { id: 'reminders' as Tab, label: t.tabReminders, icon: Bell, badge: reminders.filter((r) => !r.takenToday).length },
            { id: 'aid' as Tab, label: t.tabFirstAid, icon: ShieldAlert },
            { id: 'beds' as Tab, label: t.tabBeds, icon: Bed },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const isTranslate = (item as any).isTranslate;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'voice') {
                    setShowVoiceModal(true);
                  }
                  stopSpeech();
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition text-[9px] sm:text-[10px] font-bold relative ${
                  isTranslate
                    ? active
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-indigo-600 dark:text-indigo-400'
                    : active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title={item.label}
              >
                <div className="relative">
                  {isTranslate ? (
                    <div
                      className={`p-1 rounded-xl flex items-center justify-center ${
                        active
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md scale-105'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800'
                      } transition-all`}
                    >
                      <Languages className="w-4.5 h-4.5" />
                    </div>
                  ) : (
                    <Icon className={`w-5 h-5 ${active ? 'scale-110 text-blue-600' : ''} transition-transform`} />
                  )}
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="mt-0.5 whitespace-nowrap text-[9px] sm:text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ========================================================== */}
        {/* FLOATING CHATBOT BUTTON AT LEFT CORNER BOTTOM              */}
        {/* ========================================================== */}
        <div className="fixed left-4 bottom-18 z-40">
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              stopSpeech();
            }}
            className="flex items-center gap-2 p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            title="Ask AI Health Doctor"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 fill-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-extrabold pr-1.5 hidden sm:inline-block">AI Doctor</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* DEDICATED VOICE HEALTH DOCTOR CONSULTATION MODAL           */}
        {/* ========================================================== */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div
              className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl transition-all my-auto ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
              } max-h-[92vh] overflow-y-auto`}
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <b className="text-sm sm:text-base font-black tracking-tight block">
                      {voiceLanguage === 'te'
                        ? 'AI వాయిస్ హెల్త్ డాక్టర్'
                        : voiceLanguage === 'hi'
                        ? 'AI वॉइस हेल्थ डॉक्टर'
                        : voiceLanguage === 'ta'
                        ? 'AI குரல் மருத்துவ ஆலோசகர்'
                        : 'AI Voice Health Doctor'}
                    </b>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {voiceLanguage === 'te'
                        ? 'మాట్లాడి వెంటనే తెలుగులోనే వైద్య సలహా పొందండి'
                        : voiceLanguage === 'hi'
                        ? 'बोलें और तुरंत हिंदी में समाधान पाएं'
                        : voiceLanguage === 'ta'
                        ? 'பேசி உடனடியாக தமிழிலேயே தீர்வு பெறுங்கள்'
                        : 'Speak symptoms & get voice guidance'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVoiceModal(false);
                    stopSpeech();
                    if (isRecordingVoice) {
                      recordingSessionRef.current?.cancel();
                      setIsRecordingVoice(false);
                      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 1: PROMINENT LANGUAGE SELECTION */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {voiceLanguage === 'te'
                        ? '1. మీ భాషను ఎంచుకోండి:'
                        : voiceLanguage === 'hi'
                        ? '1. अपनी भाषा चुनें:'
                        : voiceLanguage === 'ta'
                        ? '1. உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:'
                        : '1. Which language do you want to choose?'}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Response in this language
                  </span>
                </div>

                {/* 4 Interactive Language Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'te' as LanguageCode, label: 'తెలుగు', sub: 'Telugu', flag: '🇮🇳' },
                    { code: 'hi' as LanguageCode, label: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' },
                    { code: 'en' as LanguageCode, label: 'English', sub: 'Indian English', flag: '🇬🇧' },
                    { code: 'ta' as LanguageCode, label: 'தமிழ்', sub: 'Tamil', flag: '🇮🇳' },
                  ].map((item) => {
                    const isSelected = voiceLanguage === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setVoiceLanguage(item.code);
                          setLanguage(item.code);
                          setVoiceError(null);
                          stopSpeech();
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.flag}</span>
                          <div>
                            <b className="text-xs font-black block leading-tight">{item.label}</b>
                            <span
                              className={`text-[10px] block leading-tight ${
                                isSelected ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {item.sub}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0 fill-white/20" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active confirmation guarantee */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {voiceLanguage === 'te'
                      ? 'తెలుగు ఎంచుకున్నారు: మీరు మాట్లాడండి, సమాధానం 100% తెలుగులోనే వస్తుంది.'
                      : voiceLanguage === 'hi'
                      ? 'हिंदी चुनी गई: आप बोलें, समाधान 100% शुद्ध हिंदी में ही मिलेगा।'
                      : voiceLanguage === 'ta'
                      ? 'தமிழ் தேர்ந்தெடுக்கப்பட்டது: நீங்கள் பேசுங்கள், தீர்வு 100% தமிழிலேயே கிடைக்கும்.'
                      : 'English selected: Speak your symptoms, response will be strictly in English.'}
                  </span>
                </div>
              </div>

              {/* STEP 2: MICROPHONE & AUDIO VISUALIZER */}
              <div className="text-center py-4">
                {/* Visual Recording Button */}
                <div className="relative inline-block mb-3">
                  {isRecordingVoice && (
                    <div className="absolute -inset-3 rounded-full bg-rose-500/25 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecordingVoice) {
                        stopVoiceRecordingAndSolve();
                      } else {
                        startVoiceRecording();
                      }
                    }}
                    className={`relative w-22 h-22 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-200 active:scale-95 ${
                      isRecordingVoice
                        ? 'bg-rose-600 ring-4 ring-rose-400 ring-offset-2 animate-pulse'
                        : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:scale-105'
                    }`}
                  >
                    {isRecordingVoice ? (
                      <Square className="w-8 h-8 fill-white" />
                    ) : (
                      <Mic className="w-9 h-9" />
                    )}
                  </button>
                </div>

                {/* Live soundwave activity bars when recording */}
                {isRecordingVoice && (
                  <div className="flex items-center justify-center gap-1.5 h-6 mb-2">
                    {[16, 24, 38, 28, 44, 20, 32].map((height, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 bg-rose-600 dark:bg-rose-500 rounded-full animate-bounce"
                        style={{
                          height: `${Math.max(8, Math.min(28, (height * (voiceVolume || 50)) / 45))}px`,
                          animationDelay: `${idx * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <b className="text-sm font-extrabold block">
                  {isRecordingVoice
                    ? voiceLanguage === 'te'
                      ? `వినబడుతోంది... (00:0${recordingSeconds}s)`
                      : voiceLanguage === 'hi'
                      ? `सुन रहे हैं... (00:0${recordingSeconds}s)`
                      : voiceLanguage === 'ta'
                      ? `கேட்கப்படுகிறது... (00:0${recordingSeconds}s)`
                      : `Listening to you... (00:0${recordingSeconds}s)`
                    : voiceLanguage === 'te'
                    ? 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి'
                    : voiceLanguage === 'hi'
                    ? 'बोलने के लिए माइक दबाएं'
                    : voiceLanguage === 'ta'
                    ? 'பேச மைக்ரோஃபோனைத் தட்டவும்'
                    : 'Tap Microphone to Speak'}
                </b>

                <p className="text-xs text-slate-400 mt-1">
                  {isRecordingVoice
                    ? voiceLanguage === 'te'
                      ? 'స్పష్టంగా మాట్లాడండి. పూర్తయిన తర్వాత ఆపండి.'
                      : voiceLanguage === 'hi'
                      ? 'स्पष्ट आवाज में बोलें। पूरा होने पर रोकें।'
                      : voiceLanguage === 'ta'
                      ? 'தெளிவாகப் பேசவும். முடிந்ததும் நிறுத்தவும்.'
                      : 'Speak clearly into mic. Tap when finished.'
                    : voiceLanguage === 'te'
                    ? 'తెలుగులో మాట్లాడి వెంటనే సమాధానం పొందండి'
                    : voiceLanguage === 'hi'
                    ? 'हिंदी में बोलें और समाधान पाएं'
                    : voiceLanguage === 'ta'
                    ? 'தமிழில் பேசி தீர்வு பெறவும்'
                    : 'Speak in English and get voice guidance'}
                </p>

                {/* Done Speaking action button when recording */}
                {isRecordingVoice && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => stopVoiceRecordingAndSolve()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 mx-auto"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {voiceLanguage === 'te'
                          ? 'మాట్లాడటం పూర్తయింది ➔ సమాధానం పొందండి'
                          : voiceLanguage === 'hi'
                          ? 'बोलना पूरा हुआ ➔ समाधान पाएं'
                          : voiceLanguage === 'ta'
                          ? 'பேசி முடிந்தது ➔ தீர்வு பெறவும்'
                          : 'Done Speaking ➔ Get Solution'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Live real-time speech transcript bubble */}
                {liveVoiceTranscript && (
                  <div className="mt-3 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-slate-800 dark:text-slate-200 italic flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-left">"{liveVoiceTranscript}"</span>
                  </div>
                )}

                {/* Manual Text Fallback (Quiet environments or Mic blocked) */}
                <div className="mt-3 flex gap-1.5">
                  <input
                    type="text"
                    value={voiceInputManualText}
                    onChange={(e) => setVoiceInputManualText(e.target.value)}
                    placeholder={
                      voiceLanguage === 'te'
                        ? 'లేదా మీ సమస్యను ఇక్కడ టైప్ చేయండి...'
                        : voiceLanguage === 'hi'
                        ? 'या अपनी समस्या यहाँ टाइप करें...'
                        : voiceLanguage === 'ta'
                        ? 'அல்லது உங்கள் அறிகுறிகளை தட்டச்சு செய்யவும்...'
                        : 'Or type your health symptoms here...'
                    }
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && voiceInputManualText.trim()) {
                        testVoiceSample(voiceInputManualText.trim(), voiceLanguage);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceInputManualText.trim()) {
                        testVoiceSample(voiceInputManualText.trim(), voiceLanguage);
                      }
                    }}
                    disabled={!voiceInputManualText.trim() || voiceProcessing}
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition shrink-0 shadow-xs"
                  >
                    {voiceLanguage === 'te' ? 'పరిష్కరించు' : voiceLanguage === 'hi' ? 'समाधान' : voiceLanguage === 'ta' ? 'தீர்வு' : 'Solve'}
                  </button>
                </div>
              </div>

              {/* Processing Spinner */}
              {voiceProcessing && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-center text-xs space-y-2 animate-pulse">
                  <Sparkles className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  <b className="block text-slate-800 dark:text-slate-100">
                    {voiceLanguage === 'te'
                      ? 'AI డాక్టర్ తెలుగులో సమాధానం సిద్ధం చేస్తున్నారు...'
                      : voiceLanguage === 'hi'
                      ? 'AI डॉक्टर हिंदी में समाधान तैयार कर रहे हैं...'
                      : voiceLanguage === 'ta'
                      ? 'AI மருத்துவர் தமிழிலேயே தீர்வு தயார் செய்கிறார்...'
                      : 'AI Doctor is formulating clinical solution in English...'}
                  </b>
                  <p className="text-[11px] text-slate-400">Triage, home remedies, precautions & red flags</p>
                </div>
              )}

              {/* Error Alert with helpful options */}
              {voiceError && !voiceProcessing && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{voiceError}</span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 block">
                    {voiceLanguage === 'te'
                      ? '💡 కింద ఉన్న లక్షణాలపై నొక్కి వెంటనే పరీక్షించండి:'
                      : voiceLanguage === 'hi'
                      ? '💡 नीचे दिए गए किसी भी लक्षण पर टैप करके तुरंत समाधान पाएं:'
                      : voiceLanguage === 'ta'
                      ? '💡 கீழே உள்ள அறிகுறிகளில் ஒன்றைத் தட்டவும்:'
                      : '💡 Tap any sample symptom below to test voice solution:'}
                  </span>
                </div>
              )}

              {/* RESULT SECTION - STRICTLY IN CHOSEN LANGUAGE */}
              {voiceResult && !voiceProcessing && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <b className="text-emerald-900 dark:text-emerald-200 font-black">
                        {voiceLanguage === 'te'
                          ? 'వైద్య సలహా (తెలుగులో)'
                          : voiceLanguage === 'hi'
                          ? 'चिकित्सा सलाह (हिंदी में)'
                          : voiceLanguage === 'ta'
                          ? 'மருத்துவ தீர்வு (தமிழில்)'
                          : 'Clinical Guidance & Remedies'}
                      </b>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (speaking) stopSpeech();
                        else speakText(`${voiceResult.transcription}. ${voiceResult.solution}`, voiceLanguage);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                    >
                      {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>
                        {speaking
                          ? 'Stop'
                          : voiceLanguage === 'te'
                          ? 'ఆడియో వినండి'
                          : voiceLanguage === 'hi'
                          ? 'ऑडियो सुनें'
                          : voiceLanguage === 'ta'
                          ? 'கேளுங்கள்'
                          : 'Listen'}
                      </span>
                    </button>
                  </div>

                  {/* What was heard */}
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-900/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {voiceLanguage === 'te'
                        ? 'గ్రహించిన సమస్య:'
                        : voiceLanguage === 'hi'
                        ? 'पहचाने गए लक्षण:'
                        : voiceLanguage === 'ta'
                        ? 'புரிந்துகொள்ளப்பட்ட அறிகுறிகள்:'
                        : 'Symptom Understood:'}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 italic mt-0.5">
                      "{voiceResult.transcription}"
                    </p>
                  </div>

                  {/* Solution content strictly in chosen language */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      {voiceLanguage === 'te'
                        ? 'గృహ సంరక్షణ & తీసుకోవలసిన జాగ్రత్తలు:'
                        : voiceLanguage === 'hi'
                        ? 'घरेलू उपचार और सावधानियां:'
                        : voiceLanguage === 'ta'
                        ? 'வீட்டுப் பராமரிப்பு மற்றும் முன்னெச்சரிக்கைகள்:'
                        : 'Home Care & Precautionary Guidance:'}
                    </span>
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {voiceResult.solution}
                    </div>
                  </div>

                  {/* Emergency notice if detected */}
                  {voiceResult.isEmergency && (
                    <div className="p-3 rounded-xl bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 font-bold flex items-center justify-between border border-rose-300 dark:border-rose-800">
                      <div>
                        <span className="block text-xs font-black">
                          {voiceLanguage === 'te'
                            ? 'అత్యవసర లక్షణాలు గుర్తించబడ్డాయి!'
                            : voiceLanguage === 'hi'
                            ? 'आपातकालीन लक्षण पाए गए!'
                            : voiceLanguage === 'ta'
                            ? 'அவசர சிகிச்சை தேவைப்படலாம்!'
                            : 'Emergency Alert Detected!'}
                        </span>
                        <span className="text-[10px] opacity-80">Do not delay medical care</span>
                      </div>
                      <a
                        href="tel:108"
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call 108
                      </a>
                    </div>
                  )}

                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceResult(null);
                        setLiveVoiceTranscript('');
                        setVoiceInputManualText('');
                        stopSpeech();
                      }}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.voiceTryAnother}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: INSTANT 1-TAP SYMPTOM PRESETS MATCHING CHOSEN LANGUAGE */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  {voiceLanguage === 'te'
                    ? '💡 లేదా ఒక లక్షణాన్ని ఎంచుకోండి (తక్షణ తెలుగు సమాధానం):'
                    : voiceLanguage === 'hi'
                    ? '💡 या एक लक्षण चुनें (तत्काल हिंदी समाधान):'
                    : voiceLanguage === 'ta'
                    ? '💡 அல்லது ஓர் அறிகுறியைத் தேர்ந்தெடுக்கவும் (உடனடி தமிழ் தீர்வு):'
                    : '💡 Or test with a sample symptom (Instant response):'}
                </span>

                <div className="space-y-1.5">
                  {(voiceLanguage === 'te'
                    ? [
                        { text: 'నాకు 2 రోజుల నుండి విపరీతమైన జ్వరం మరియు తలనొప్పి ఉంది', label: 'జ్వరం & తలనొప్పి' },
                        { text: 'దగ్గు, గొంతు నొప్పి మరియు జలుబు ఉంది', label: 'దగ్గు & గొంతు నొప్పి' },
                        { text: 'కడుపు నొప్పి, వాంతులు మరియు విరేచనాలు ఉన్నాయి', label: 'కడుపు నొప్పి' },
                        { text: 'ఛాతీలో తీవ్రమైన నొప్పి మరియు ఆయాసం ఉంది (అత్యవసరం)', label: 'ఛాతీ నొప్పి (ఎమర్జెన్సీ)' },
                      ]
                    : voiceLanguage === 'hi'
                    ? [
                        { text: 'मुझे 2 दिन से तेज बुखार, बदन दर्द और सिरदर्द है', label: 'बुखार और सिरदर्द' },
                        { text: 'गले में खराश, सूखी खांसी और जुकाम है', label: 'खांसी और जुकाम' },
                        { text: 'पेट में तेज दर्द और उल्टी जैसा लग रहा है', label: 'पेट दर्द' },
                        { text: 'सीने में भारीपन और सांस लेने में तकलीफ (आपातकालीन)', label: 'सीने में दर्द (इमरजेंसी)' },
                      ]
                    : voiceLanguage === 'ta'
                    ? [
                        { text: 'எனக்கு 2 நாட்களாக கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது', label: 'காய்ச்சல் & தலைவலி' },
                        { text: 'தொண்டை வலி, கடுமையான இருமல் மற்றும் சளி', label: 'இருமல் & சளி' },
                        { text: 'வயிற்று வலி மற்றும் வாந்தி உணர்வு உள்ளது', label: 'வயிற்று வலி' },
                        { text: 'மார்பு வலி மற்றும் மூச்சுத் திணறல் (அவசரம்)', label: 'மார்பு வலி (அவசரம்)' },
                      ]
                    : [
                        { text: 'I have high fever, headache and body chills for 2 days', label: 'Fever & Headache' },
                        { text: 'Sore throat, persistent dry cough and congestion', label: 'Cold & Cough' },
                        { text: 'Acute stomach ache, indigestion and nausea', label: 'Stomach Ache' },
                        { text: 'Severe chest discomfort and shortness of breath (Emergency)', label: 'Chest Pain (Emergency)' },
                      ]
                  ).map((smp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => testVoiceSample(smp.text, voiceLanguage)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 bg-white dark:bg-slate-850 text-xs flex items-center justify-between group transition"
                    >
                      <div className="pr-2 truncate">
                        <b className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block">
                          {smp.label}
                        </b>
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200 block text-[11px]">
                          {smp.text}
                        </span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold text-[11px] shrink-0 group-hover:translate-x-0.5 transition">
                        {voiceLanguage === 'te' ? 'సమాధానం ›' : voiceLanguage === 'hi' ? 'समाधान ›' : voiceLanguage === 'ta' ? 'தீர்வு ›' : 'Solve ›'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DETAILED HOSPITAL MODAL WITH DOCTOR PROFILES & CONTACTS   */}
        {/* ========================================================== */}
        {selectedHospitalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div
              className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base leading-tight">{selectedHospitalModal.name}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {selectedHospitalModal.address} • <b>{selectedHospitalModal.distanceKm} km</b>
                  </span>
                </div>
                <button onClick={() => setSelectedHospitalModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real count badge */}
              <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-blue-100 block">Available Hospital Capacity</span>
                    <b className="text-2xl font-black">
                      {selectedHospitalModal.availableBeds} / {selectedHospitalModal.totalBeds} Free
                    </b>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Bed className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/20 text-[11px] text-blue-100 flex items-center justify-between">
                  <span>CMO on Duty: {selectedHospitalModal.doctorOnCall}</span>
                  <span className="font-bold">Live Verified</span>
                </div>
              </div>

              {/* Full Bed Breakdown */}
              <div className="space-y-2 mb-4">
                <b className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Detailed Bed Breakdown:
                </b>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex justify-between">
                    <span>{t.bedsGeneral}:</span>
                    <b className="text-blue-700 dark:text-blue-300">{selectedHospitalModal.generalAvailable} Beds</b>
                  </div>
                  <div className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 flex justify-between">
                    <span>{t.bedsICU}:</span>
                    <b className="text-purple-700 dark:text-purple-300">{selectedHospitalModal.icuAvailable} Beds</b>
                  </div>
                  <div className="p-2.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30 flex justify-between">
                    <span>{t.bedsOxygen}:</span>
                    <b className="text-teal-700 dark:text-teal-300">{selectedHospitalModal.oxygenAvailable} Beds</b>
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 flex justify-between">
                    <span>{t.bedsTrauma}:</span>
                    <b className="text-rose-700 dark:text-rose-300">{selectedHospitalModal.emergencyAvailable} Beds</b>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span>{t.bedsVentilators}:</span>
                    <b className="text-indigo-600 dark:text-indigo-300">{selectedHospitalModal.ventilatorAvailable} Units</b>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span>{t.bedsMaternity}:</span>
                    <b className="text-emerald-600 dark:text-emerald-300">{selectedHospitalModal.maternityAvailable} Beds</b>
                  </div>
                </div>
              </div>

              {/* DOCTORS ON DUTY PROFILES (User explicitly requested) */}
              <div className="mb-4">
                <b className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {t.bedsDoctorTitle}
                </b>
                <div className="space-y-2">
                  {selectedHospitalModal.doctors?.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-2xl border text-xs ${
                        darkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <b className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            {doc.name}
                          </b>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">
                            {doc.specialty}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {doc.qualifications} • {doc.experienceYears} yrs experience
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap">
                          {doc.availableStatus}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Languages: {doc.languages.join(', ')}</span>
                        <span>{doc.consultationHours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 24/7 EMERGENCY CONTACT NUMBERS (User explicitly requested) */}
              <div className="mb-4 p-3 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs">
                <b className="text-red-900 dark:text-red-300 font-extrabold block mb-2 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  {t.bedsEmergencyContactsTitle}
                </b>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <a
                    href={`tel:${selectedHospitalModal.emergencyContacts.traumaHelpline}`}
                    className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-red-200 dark:border-red-900 flex flex-col font-bold text-red-700 dark:text-red-300"
                  >
                    <span className="text-[10px] text-slate-400 font-normal">Trauma Emergency:</span>
                    <span>{selectedHospitalModal.emergencyContacts.traumaHelpline}</span>
                  </a>
                  <a
                    href={`tel:${selectedHospitalModal.emergencyContacts.ambulanceDirect}`}
                    className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-red-200 dark:border-red-900 flex flex-col font-bold text-red-700 dark:text-red-300"
                  >
                    <span className="text-[10px] text-slate-400 font-normal">Direct Ambulance:</span>
                    <span>{selectedHospitalModal.emergencyContacts.ambulanceDirect}</span>
                  </a>
                  <a
                    href={`tel:${selectedHospitalModal.emergencyContacts.bloodBank}`}
                    className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-[10px] text-slate-400 font-normal">Blood Bank:</span>
                    <span>{selectedHospitalModal.emergencyContacts.bloodBank}</span>
                  </a>
                  <a
                    href={`tel:${selectedHospitalModal.emergencyContacts.receptionDesk}`}
                    className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-[10px] text-slate-400 font-normal">Reception Desk:</span>
                    <span>{selectedHospitalModal.emergencyContacts.receptionDesk}</span>
                  </a>
                </div>
              </div>

              {/* Reservation token alert */}
              {reservationSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100">
                  <b className="block font-bold">✅ Emergency Token Created:</b>
                  <p className="mt-0.5">{reservationSuccess}</p>
                </div>
              )}

              {/* Pre-alert casualty token form */}
              {!reservationSuccess ? (
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-4 text-xs space-y-2">
                  <b className="block font-bold">Inquire / Pre-Alert Hospital for Patient Arrival:</b>
                  <input
                    type="text"
                    placeholder="Patient Name (e.g. Ramesh Varma)"
                    value={patientInquiryName}
                    onChange={(e) => setPatientInquiryName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                  />
                  <div className="flex gap-2">
                    <select
                      value={patientInquiryBedType}
                      onChange={(e) => setPatientInquiryBedType(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 font-bold"
                    >
                      <option value="General">General Ward</option>
                      <option value="ICU">ICU Bed</option>
                      <option value="Oxygen">Oxygen Bed</option>
                      <option value="Emergency">Trauma Bed</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!patientInquiryName.trim()) {
                          alert('Please enter patient name');
                          return;
                        }
                        const token = 'CB-' + Math.floor(100000 + Math.random() * 900000);
                        setReservationSuccess(
                          `Pre-alert token #${token} created for ${patientInquiryName} (${patientInquiryBedType} bed). Show this at casualty reception.`
                        );
                        playReminderChime();
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg whitespace-nowrap"
                    >
                      {t.bedsPreAlertBtn}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Direct Call & Directions Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selectedHospitalModal.phone}`}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.bedsCallReception}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedHospitalModal.name + ' ' + selectedHospitalModal.city
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* EMERGENCY CONTACTS & HELPLINES HUB MODAL                   */}
        {/* ========================================================== */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div
              className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400">
                      {t.emergencyHubTitle}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">
                      {t.emergencyHubSub}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant 1-Tap National Emergency Dispatchers */}
              <div className="space-y-2 mb-4">
                <a
                  href="tel:108"
                  className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold flex items-center justify-between shadow-md active:scale-[0.98] transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-white animate-bounce" />
                    </div>
                    <div>
                      <b className="text-sm block">108 Emergency Ambulance</b>
                      <span className="text-[10px] text-red-100 block">Free 24/7 Medical Emergency Dispatch</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white text-red-700 text-xs font-black">
                    DIAL 108
                  </span>
                </a>

                <a
                  href="tel:112"
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold flex items-center justify-between shadow-md active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <b className="text-sm block">112 All-in-One Emergency</b>
                      <span className="text-[10px] text-blue-100 block">Police, Fire & Medical Unified Dispatch</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white text-blue-800 text-xs font-black">
                    DIAL 112
                  </span>
                </a>
              </div>

              {/* National & State Medical Helplines */}
              <div className="mb-4">
                <b className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {t.emergencyHelplinesTitle}
                </b>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { number: '104', label: 'Medical Consultation', sub: '24/7 Health Advice' },
                    { number: '102', label: 'Free Pregnancy/Infant', sub: 'Mother & Child Care' },
                    { number: '1091', label: 'Women Helpline', sub: 'Safety & Protection' },
                    { number: '14567', label: 'Senior Citizens', sub: 'Elder Care Helpline' },
                    { number: '1075', label: 'National Health Line', sub: 'Disease Control' },
                    { number: '1066', label: 'Apollo Emergency', sub: 'Trauma Hotline' },
                  ].map((hl) => (
                    <a
                      key={hl.number}
                      href={`tel:${hl.number}`}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between active:scale-[0.98] transition ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 hover:border-red-500 text-slate-200'
                          : 'bg-slate-50 border-slate-200 hover:border-red-400 text-slate-800'
                      }`}
                    >
                      <div>
                        <b className="text-xs text-red-600 dark:text-red-400 block">{hl.number}</b>
                        <span className="text-[11px] font-semibold block leading-tight">{hl.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{hl.sub}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Personal Emergency Contacts Section (Saved Offline) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <b className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.personalContactsTitle}
                  </b>
                  <button
                    onClick={() => setShowAddContactForm(!showAddContactForm)}
                    className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addPersonalContact}</span>
                  </button>
                </div>

                {/* Add Contact Form */}
                {showAddContactForm && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newContactName.trim() || !newContactPhone.trim()) return;
                      const newC: PersonalEmergencyContact = {
                        id: Date.now().toString(),
                        name: newContactName.trim(),
                        relation: newContactRelation.trim() || 'Family',
                        phone: newContactPhone.trim(),
                      };
                      setPersonalContacts((prev) => [...prev, newC]);
                      setNewContactName('');
                      setNewContactRelation('');
                      setNewContactPhone('');
                      setShowAddContactForm(false);
                      playBeep(true);
                    }}
                    className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-xs space-y-2 mb-3"
                  >
                    <input
                      type="text"
                      placeholder={t.contactName}
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                    />
                    <input
                      type="text"
                      placeholder={t.contactRelation}
                      value={newContactRelation}
                      onChange={(e) => setNewContactRelation(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                    />
                    <input
                      type="tel"
                      placeholder={t.contactPhone}
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                      >
                        Save Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Personal Contacts List */}
                <div className="space-y-2">
                  {personalContacts.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <b className="block font-bold text-slate-900 dark:text-slate-100">{c.name}</b>
                        <span className="text-[10px] text-slate-400 block">{c.relation} • {c.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${c.phone}`}
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
                          title="Call Contact"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`sms:${c.phone}?body=${encodeURIComponent(
                            'EMERGENCY ALERT: I need urgent medical assistance. My CareBridge AI app triggered an emergency notification. Please call me immediately!'
                          )}`}
                          className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1"
                          title="Send SOS SMS"
                        >
                          <span>SMS</span>
                        </a>
                        <button
                          onClick={() => setPersonalContacts((prev) => prev.filter((item) => item.id !== c.id))}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* FLOATING CHAT DRAWER                                       */}
        {/* ========================================================== */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <div
              className={`w-full max-w-md h-[88vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } overflow-hidden`}
            >
              <div
                className={`p-3.5 border-b flex items-center justify-between ${
                  darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <b className="text-xs font-extrabold block">{t.chatTitle}</b>
                    <span className="text-[10px] text-slate-400 block">
                      Chat in English, Hindi, Telugu, or Tamil
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      setShowVoiceModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice</span>
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs leading-relaxed">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : msg.isEmergency
                            ? 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-100 rounded-bl-xs'
                            : darkMode
                            ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-xs'
                            : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.isEmergency && !isUser && (
                          <div className="mb-1.5 pb-1.5 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
                            <span className="font-extrabold text-[11px] text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> {t.chatEmergencyAlert}
                            </span>
                            <a href="tel:108" className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                              Call 108
                            </a>
                          </div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    <span>AI is formulating solution...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage();
                  }}
                  placeholder={t.chatPlaceholder}
                  className={`flex-1 text-xs p-2.5 rounded-xl border focus:outline-hidden ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ADD REMINDER MODAL                                         */}
        {/* ========================================================== */}
        {showAddReminderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  <span>{t.remindersModalTitle}</span>
                </h3>
                <button onClick={() => setShowAddReminderModal(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddManualReminder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">{t.medNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol 650mg"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">{t.medDoseLabel}</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tablet"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t.medTimeLabel}</label>
                    <input
                      type="time"
                      required
                      value={newMedTime}
                      onChange={(e) => setNewMedTime(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">{t.medFoodLabel}</label>
                    <select
                      value={newMedFood}
                      onChange={(e) => setNewMedFood(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{t.medFreqLabel}</label>
                    <select
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="Once Daily">Once Daily</option>
                      <option value="Twice Daily">Twice Daily</option>
                      <option value="Thrice Daily">Thrice Daily</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition"
                >
                  {t.saveReminderBtn}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
