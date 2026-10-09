export type LanguageCode = 'en' | 'hi' | 'te' | 'ta';

export interface AppTranslations {
  appName: string;
  tagline: string;
  sosButton: string;
  speakHeroTitle: string;
  speakHeroSub: string;
  speakButton: string;
  offlineModeNotice: string;
  
  // Navigation tabs
  tabScanner: string;
  tabLabReport: string;
  tabVoice: string;
  tabReminders: string;
  tabFirstAid: string;
  tabBeds: string;

  // Prescription Scanner
  rxTitle: string;
  rxSub: string;
  rxCamera: string;
  rxUpload: string;
  rxSamplesLabel: string;
  rxDecodedHeader: string;
  rxExplanation: string;
  rxAddAllReminders: string;
  rxListenAudio: string;
  rxStopAudio: string;
  rxScanNew: string;
  rxReadingStatus: string;
  rxFoodRelation: string;
  rxDosage: string;
  rxTiming: string;
  rxDuration: string;

  // Lab Report Analyser
  labTitle: string;
  labSub: string;
  labScanCamera: string;
  labUpload: string;
  labSampleLabel: string;
  labAnalyzingStatus: string;
  labResultHeader: string;
  labTestName: string;
  labValue: string;
  labRange: string;
  labStatus: string;
  labNormal: string;
  labLow: string;
  labHigh: string;
  labCritical: string;
  labDietAdvice: string;
  labDoctorQuestions: string;

  // Reminders
  remindersTitle: string;
  remindersSub: string;
  remindersAddBtn: string;
  remindersAdherence: string;
  remindersTestChime: string;
  remindersEmpty: string;
  remindersModalTitle: string;
  medNameLabel: string;
  medDoseLabel: string;
  medTimeLabel: string;
  medFoodLabel: string;
  medFreqLabel: string;
  saveReminderBtn: string;

  // First Aid
  aidTitle: string;
  aidSub: string;
  aidCamera: string;
  aidUpload: string;
  aidSamplesLabel: string;
  aidDoNow: string;
  aidDoNot: string;
  aidRedFlags: string;
  aidNearbyClinics: string;
  aidCallClinic: string;
  aidDirections: string;
  aidOfflineGuidesTitle: string;

  // Hospital Beds & Doctors
  bedsTitle: string;
  bedsSub: string;
  bedsSearchPlaceholder: string;
  bedsCityAll: string;
  bedsAvailableOnly: string;
  bedsFreePill: string;
  bedsTotalCap: string;
  bedsOccupancy: string;
  bedsGeneral: string;
  bedsICU: string;
  bedsOxygen: string;
  bedsTrauma: string;
  bedsVentilators: string;
  bedsMaternity: string;
  bedsRefresh: string;
  bedsTapModal: string;
  bedsDoctorTitle: string;
  bedsEmergencyContactsTitle: string;
  bedsPreAlertBtn: string;
  bedsPreAlertSuccess: string;
  bedsCallReception: string;

  // Voice Doctor Modal
  voiceModalTitle: string;
  voiceModalSub: string;
  voiceListening: string;
  voiceTapToSpeak: string;
  voiceVolumeLevel: string;
  voiceFormulating: string;
  voiceHeardLabel: string;
  voiceSolutionLabel: string;
  voiceSamplesTitle: string;
  voiceChooseLangPrompt: string;
  voiceGetSolutionBtn: string;
  voiceDoneSpeaking: string;
  voiceTryAnother: string;

  // Floating Chatbot
  chatTitle: string;
  chatPlaceholder: string;
  chatDoctorPrompt: string;
  chatEmergencyAlert: string;

  // Emergency Hub & Contacts
  emergencyHubTitle: string;
  emergencyHubSub: string;
  emergencyHelplinesTitle: string;
  personalContactsTitle: string;
  addPersonalContact: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
  callNow: string;
  sendSosSms: string;
  offlineHandbookTitle: string;
  offlineLabHandbookTitle: string;
}

export const TRANSLATIONS: Record<LanguageCode, AppTranslations> = {
  en: {
    appName: 'CareBridge AI',
    tagline: 'Simple Healthcare & Emergency Companion',
    sosButton: 'SOS 108',
    speakHeroTitle: 'Speak Your Health Problem',
    speakHeroSub: 'Tap to speak in English, Hindi, Telugu or Tamil for instant AI solutions',
    speakButton: '🎙️ Speak',
    offlineModeNotice: 'Offline Mode: Emergency guides, medicine reminders & hospital contacts are ready',

    tabScanner: 'Prescription',
    tabLabReport: 'Lab Report',
    tabVoice: 'Translate',
    tabReminders: 'Reminders',
    tabFirstAid: 'First Aid',
    tabBeds: 'Beds & Doctors',

    rxTitle: 'Prescription & Medicine AI Scanner',
    rxSub: 'Snap doctor slips or medicine packs. We explain doses simply and set alarms.',
    rxCamera: 'Camera Scan',
    rxUpload: 'Upload Photo',
    rxSamplesLabel: '💡 Test with sample prescriptions:',
    rxDecodedHeader: 'Prescription Decoded',
    rxExplanation: 'Simple Explanation:',
    rxAddAllReminders: 'Add All to Medicine Reminders',
    rxListenAudio: 'Listen Instructions',
    rxStopAudio: 'Stop Audio',
    rxScanNew: 'Scan Another',
    rxReadingStatus: 'Reading Doctor handwriting with Gemini Vision...',
    rxFoodRelation: 'Food Relation',
    rxDosage: 'Dosage',
    rxTiming: 'Timing',
    rxDuration: 'Duration',

    labTitle: 'Lab Report & Blood Test AI Analyser',
    labSub: 'Upload blood tests, CBC, Lipid profile, or Thyroid reports to understand your values simply.',
    labScanCamera: 'Scan Lab Slip',
    labUpload: 'Upload Lab Report',
    labSampleLabel: '💡 Test with sample lab reports:',
    labAnalyzingStatus: 'Analyzing Blood Report & Reference Ranges...',
    labResultHeader: 'Lab Report Analysis & Health Insights',
    labTestName: 'Test Name',
    labValue: 'Result',
    labRange: 'Normal Range',
    labStatus: 'Status',
    labNormal: 'Normal',
    labLow: 'Low',
    labHigh: 'High',
    labCritical: 'Critical Alert',
    labDietAdvice: 'Dietary & Lifestyle Advice:',
    labDoctorQuestions: 'Questions to Ask Your Doctor:',

    remindersTitle: 'Medicine Reminders',
    remindersSub: 'Daily dosage schedule and adherence tracker',
    remindersAddBtn: 'Add Medicine',
    remindersAdherence: "Today's Adherence",
    remindersTestChime: 'Test Chime Sound',
    remindersEmpty: 'No active medicine reminders. Tap "+ Add" or scan a prescription above.',
    remindersModalTitle: 'Add Medicine Reminder',
    medNameLabel: 'Medicine Name',
    medDoseLabel: 'Dosage',
    medTimeLabel: 'Alarm Time',
    medFoodLabel: 'Food Relation',
    medFreqLabel: 'Frequency',
    saveReminderBtn: 'Save Reminder',

    aidTitle: 'Visual First Aid AI Scanner',
    aidSub: 'Photograph burns, cuts, or bites for immediate step-by-step triage guidance.',
    aidCamera: 'Snap Injury',
    aidUpload: 'Upload Photo',
    aidSamplesLabel: '💡 Test with sample injury photos:',
    aidDoNow: 'Immediate Actions (Do Now):',
    aidDoNot: 'Critical DO NOTS (Avoid Mistakes):',
    aidRedFlags: 'When to Call Emergency / Red Flags:',
    aidNearbyClinics: '🏥 Recommended Nearby Clinics & Trauma Centers:',
    aidCallClinic: 'Call Clinic',
    aidDirections: 'Get Directions',
    aidOfflineGuidesTitle: 'Offline Emergency Certified Guides:',

    bedsTitle: 'Live Hospital Beds & Doctor Directory',
    bedsSub: 'Real capacity counters, doctor profiles on duty, and emergency helplines',
    bedsSearchPlaceholder: 'Search hospital, doctor, area, or specialty (e.g. Apollo, Jubilee, ICU)...',
    bedsCityAll: 'All Cities',
    bedsAvailableOnly: 'Show Available Beds Only',
    bedsFreePill: 'Free Beds',
    bedsTotalCap: 'Total Capacity',
    bedsOccupancy: 'Bed Occupancy',
    bedsGeneral: 'General',
    bedsICU: 'ICU',
    bedsOxygen: 'Oxygen',
    bedsTrauma: 'Trauma',
    bedsVentilators: 'Ventilators',
    bedsMaternity: 'Maternity',
    bedsRefresh: 'Refresh Live Beds',
    bedsTapModal: 'Tap for Doctor Profiles & Emergency Helplines',
    bedsDoctorTitle: 'Doctors on Duty & Specialists:',
    bedsEmergencyContactsTitle: '24/7 Emergency Contacts & Helplines:',
    bedsPreAlertBtn: 'Pre-Alert Emergency Casualty',
    bedsPreAlertSuccess: 'Casualty arrival alert generated',
    bedsCallReception: 'Call Reception Desk',

    voiceModalTitle: 'Voice Health Consultation Doctor',
    voiceModalSub: 'Speak in your language for immediate medical diagnosis & home remedies',
    voiceListening: 'Listening to you... Tap to Stop',
    voiceTapToSpeak: 'Tap Microphone to Speak Your Health Problem',
    voiceVolumeLevel: 'Volume Level',
    voiceFormulating: 'Formulating Medical Solution...',
    voiceHeardLabel: 'What was heard:',
    voiceSolutionLabel: 'AI Doctor Solution & Home Remedies:',
    voiceSamplesTitle: '💡 Or tap a symptom to test voice solution:',
    voiceChooseLangPrompt: 'Which language do you want your solution in?',
    voiceGetSolutionBtn: 'Get Solution in',
    voiceDoneSpeaking: 'Done Speaking ➔',
    voiceTryAnother: 'Ask Another Question',

    chatTitle: 'CareBridge AI Doctor',
    chatPlaceholder: 'Ask any health question in your language...',
    chatDoctorPrompt: 'Chat with AI Doctor',
    chatEmergencyAlert: 'EMERGENCY ALERT',

    emergencyHubTitle: 'Emergency Helplines & SOS Contacts',
    emergencyHubSub: '1-tap access to National emergency dispatchers and saved family numbers',
    emergencyHelplinesTitle: '24/7 National & Medical Helplines:',
    personalContactsTitle: 'My Family & Doctor Emergency Contacts (Offline):',
    addPersonalContact: 'Add Contact',
    contactName: 'Contact Name',
    contactRelation: 'Relationship (e.g. Spouse, Doctor, Sister)',
    contactPhone: 'Mobile Number',
    callNow: 'Call Now',
    sendSosSms: 'Send SOS SMS',
    offlineHandbookTitle: 'Offline Emergency First-Aid Guides',
    offlineLabHandbookTitle: 'Offline Normal Blood Test Reference Handbook',
  },

  hi: {
    appName: 'केयरब्रिज AI',
    tagline: 'सरल स्वास्थ्य एवं आपातकालीन साथी',
    sosButton: 'आपातकाल 108',
    speakHeroTitle: 'अपनी बीमारी बोलकर बताएं',
    speakHeroSub: 'हिंदी, तेलुगु, अंग्रेजी या तमिल में बोलें और तुरंत समाधान पाएं',
    speakButton: '🎙️ बोलें',
    offlineModeNotice: 'ऑफ़लाइन मोड: आपातकालीन गाइड, दवा रिमाइंडर और अस्पताल सूची उपलब्ध है',

    tabScanner: 'पर्चा स्कैनर',
    tabLabReport: 'लैब रिपोर्ट',
    tabVoice: 'अनुवाद',
    tabReminders: 'दवा रिमाइंडर',
    tabFirstAid: 'प्राथमिक उपचार',
    tabBeds: 'बेड और डॉक्टर',

    rxTitle: 'डॉक्टर पर्चा एवं दवा AI स्कैनर',
    rxSub: 'डॉक्टर का पर्चा या दवा का पैकेट स्कैन करें। हम सरल भाषा में खुराक समझाएंगे।',
    rxCamera: 'कैमरा स्कैन',
    rxUpload: 'फोटो अपलोड',
    rxSamplesLabel: '💡 नमूना पर्चे से टेस्ट करें:',
    rxDecodedHeader: 'पर्चे का सरल विवरण',
    rxExplanation: 'सरल व्याख्या:',
    rxAddAllReminders: 'सभी दवाएं रिमाइंडर में जोड़ें',
    rxListenAudio: 'निर्देश सुनें',
    rxStopAudio: 'ऑडियो रोकें',
    rxScanNew: 'नया पर्चा स्कैन करें',
    rxReadingStatus: 'जेमिनी विज़न से डॉक्टर की लिखावट पढ़ी जा रही है...',
    rxFoodRelation: 'भोजन संबंध',
    rxDosage: 'खुराक',
    rxTiming: 'समय',
    rxDuration: 'अवधि',

    labTitle: 'लैब रिपोर्ट एवं ब्लड टेस्ट AI विश्लेषक',
    labSub: 'ब्लड टेस्ट, सीबीसी, लिपिड या थायरॉयड रिपोर्ट अपलोड करें और परिणाम सरल हिंदी में समझें।',
    labScanCamera: 'लैब पर्चा स्कैन करें',
    labUpload: 'रिपोर्ट अपलोड करें',
    labSampleLabel: '💡 नमूना लैब रिपोर्ट से जांचें:',
    labAnalyzingStatus: 'ब्लड रिपोर्ट और सामान्य सीमाओं का विश्लेषण हो रहा है...',
    labResultHeader: 'लैब रिपोर्ट विश्लेषण एवं स्वास्थ्य सलाह',
    labTestName: 'टेस्ट का नाम',
    labValue: 'परिणाम',
    labRange: 'सामान्य सीमा',
    labStatus: 'स्थिति',
    labNormal: 'सामान्य',
    labLow: 'कम',
    labHigh: 'अधिक',
    labCritical: 'गंभीर चेतावनी',
    labDietAdvice: 'आहार एवं जीवनशैली सलाह:',
    labDoctorQuestions: 'डॉक्टर से पूछे जाने वाले सवाल:',

    remindersTitle: 'दवा रिमाइंडर एवं अलार्म',
    remindersSub: 'दैनिक दवा कार्यक्रम और लेने का रिकॉर्ड',
    remindersAddBtn: 'दवा जोड़ें',
    remindersAdherence: 'आज का दवा पालन',
    remindersTestChime: 'अलार्म घंटी बजाएं',
    remindersEmpty: 'कोई सक्रिय रिमाइंडर नहीं है। "+ जोड़ें" पर टैप करें या ऊपर पर्चा स्कैन करें।',
    remindersModalTitle: 'दवा रिमाइंडर जोड़ें',
    medNameLabel: 'दवा का नाम',
    medDoseLabel: 'खुराक',
    medTimeLabel: 'समय',
    medFoodLabel: 'भोजन संबंध',
    medFreqLabel: 'आवृत्ति',
    saveReminderBtn: 'रिमाइंडर सहेजें',

    aidTitle: 'दृश्य प्राथमिक उपचार AI स्कैनर',
    aidSub: 'जलने, कटने या कीड़े के काटने की फोटो खींचकर तुरंत प्राथमिक उपचार कदम पाएं।',
    aidCamera: 'चोट की फोटो लें',
    aidUpload: 'फोटो अपलोड करें',
    aidSamplesLabel: '💡 नमूना चोट फोटो से जांचें:',
    aidDoNow: 'तुरंत किए जाने वाले कदम (अभी करें):',
    aidDoNot: 'क्या न करें (खतरनाक गलतियां):',
    aidRedFlags: 'अस्पताल कब जाएं / खतरे के संकेत:',
    aidNearbyClinics: '🏥 अनुशंसित नजदीकी क्लीनिक एवं ट्रॉमा सेंटर:',
    aidCallClinic: 'क्लीनिक को कॉल करें',
    aidDirections: 'रास्ता देखें',
    aidOfflineGuidesTitle: 'ऑफ़लाइन प्रमाणित आपातकालीन गाइड:',

    bedsTitle: 'लाइव अस्पताल बेड एवं डॉक्टर सूची',
    bedsSub: 'वास्तविक बेड संख्या, ड्यूटी पर डॉक्टर प्रोफाइल और आपातकालीन हेल्पलाइन',
    bedsSearchPlaceholder: 'अस्पताल, डॉक्टर, क्षेत्र या विभाग खोजें (जैसे अपोलो, आईसीयू)...',
    bedsCityAll: 'सभी शहर',
    bedsAvailableOnly: 'केवल खाली बेड वाले अस्पताल दिखाएं',
    bedsFreePill: 'खाली बेड',
    bedsTotalCap: 'कुल क्षमता',
    bedsOccupancy: 'बेड व्यस्तता',
    bedsGeneral: 'सामान्य',
    bedsICU: 'आईसीयू',
    bedsOxygen: 'ऑक्सीजन',
    bedsTrauma: 'ट्रॉमा',
    bedsVentilators: 'वेंटिलेटर',
    bedsMaternity: 'प्रसूति',
    bedsRefresh: 'लाइव बेड रीफ्रेश करें',
    bedsTapModal: 'डॉक्टर प्रोफाइल और हेल्पलाइन देखने के लिए टैप करें',
    bedsDoctorTitle: 'ड्यूटी पर डॉक्टर एवं विशेषज्ञ:',
    bedsEmergencyContactsTitle: '24/7 आपातकालीन नंबर और हेल्पलाइन:',
    bedsPreAlertBtn: 'इमरजेंसी कैजुअल्टी को पूर्व-सूचना दें',
    bedsPreAlertSuccess: 'अस्पताल अलर्ट टोकन तैयार किया गया',
    bedsCallReception: 'रिसेप्शन पर कॉल करें',

    voiceModalTitle: 'वॉयस हेल्थ डॉक्टर परामर्श',
    voiceModalSub: 'अपनी भाषा में बोलें और तुरंत बीमारी का कारण और घरेलू उपाय पाएं',
    voiceListening: 'सुन रहे हैं... रोकने के लिए टैप करें',
    voiceTapToSpeak: 'अपनी समस्या बोलने के लिए माइक दबाएं',
    voiceVolumeLevel: 'आवाज स्तर',
    voiceFormulating: 'डॉक्टर समाधान तैयार कर रहे हैं...',
    voiceHeardLabel: 'जो सुना गया:',
    voiceSolutionLabel: 'AI डॉक्टर समाधान एवं घरेलू उपाय:',
    voiceSamplesTitle: '💡 या टेस्ट करने के लिए लक्षण पर टैप करें:',
    voiceChooseLangPrompt: 'आपको समाधान किस भाषा में चाहिए?',
    voiceGetSolutionBtn: 'समाधान प्राप्त करें',
    voiceDoneSpeaking: 'बोलना समाप्त ➔',
    voiceTryAnother: 'कोई अन्य सवाल पूछें',

    chatTitle: 'केयरब्रिज AI डॉक्टर',
    chatPlaceholder: 'अपनी भाषा में कोई भी स्वास्थ्य सवाल पूछें...',
    chatDoctorPrompt: 'AI डॉक्टर से बात करें',
    chatEmergencyAlert: 'आपातकालीन चेतावनी',

    emergencyHubTitle: 'आपातकालीन हेल्पलाइन एवं संकटकालीन संपर्क',
    emergencyHubSub: 'राष्ट्रीय आपातकालीन सेवाओं और सहेजे गए परिजनों के नंबरों पर तुरंत संपर्क करें',
    emergencyHelplinesTitle: '24/7 राष्ट्रीय एवं चिकित्सा हेल्पलाइन:',
    personalContactsTitle: 'मेरे परिजन एवं पारिवारिक डॉक्टर संपर्क (ऑफ़लाइन उपलब्ध):',
    addPersonalContact: 'नया संपर्क जोड़ें',
    contactName: 'व्यक्ति का नाम',
    contactRelation: 'संबंध (उदा. जीवनसाथी, डॉक्टर, बहन)',
    contactPhone: 'मोबाइल नंबर',
    callNow: 'कॉल करें',
    sendSosSms: 'SOS संदेश भेजें',
    offlineHandbookTitle: 'ऑफ़लाइन प्रमाणित प्राथमिक उपचार गाइड',
    offlineLabHandbookTitle: 'ऑफ़लाइन सामान्य ब्लड टेस्ट संदर्भ पुस्तिका',
  },

  te: {
    appName: 'కేర్‌బ్రిడ్జ్ AI',
    tagline: 'సులభమైన ఆరోగ్య & అత్యవసర సహచరుడు',
    sosButton: 'అత్యవసరం 108',
    speakHeroTitle: 'మీ ఆరోగ్య సమస్యను మాట్లాడి చెప్పండి',
    speakHeroSub: 'తెలుగు, హిందీ, ఇంగ్లీష్ లేదా తమిళంలో మాట్లాడి వెంటనే AI పరిష్కారం పొందండి',
    speakButton: '🎙️ మాట్లాడండి',
    offlineModeNotice: 'ఆఫ్‌లైన్ మోడ్: అత్యవసర గైడ్‌లు, మందుల రిమైండర్లు & ఆసుపత్రి నంబర్లు అందుబాటులో ఉన్నాయి',

    tabScanner: 'ప్రిస్క్రిప్షన్',
    tabLabReport: 'ల్యాబ్ రిపోర్ట్',
    tabVoice: 'అనువాదం',
    tabReminders: 'రిమైండర్లు',
    tabFirstAid: 'ప్రథమ చికిత్స',
    tabBeds: 'బెడ్స్ & వైద్యులు',

    rxTitle: 'ప్రిస్క్రిప్షన్ & మందుల AI స్కానర్',
    rxSub: 'డాక్టర్ చీటీ లేదా మందుల ప్యాకెట్ ఫోటో తీయండి. మోతాదు మరియు వేళలను సులభంగా వివరిస్తాము.',
    rxCamera: 'కెమెరా స్కాన్',
    rxUpload: 'ఫోటో అప్‌లోడ్',
    rxSamplesLabel: '💡 నమూనా ప్రిస్క్రిప్షన్‌తో పరీక్షించండి:',
    rxDecodedHeader: 'ప్రిస్క్రిప్షన్ వివరాలు',
    rxExplanation: 'సులభమైన వివరణ:',
    rxAddAllReminders: 'అన్ని మందులను రిమైండర్లలో చేర్చండి',
    rxListenAudio: 'సూచనలు వినండి',
    rxStopAudio: 'ఆడియో ఆపు',
    rxScanNew: 'కొత్త ప్రిస్క్రిప్షన్ స్కాన్',
    rxReadingStatus: 'జెమిని విజన్ డాక్టర్ చేతివ్రాతను చదువుతోంది...',
    rxFoodRelation: 'ఆహార సంబంధం',
    rxDosage: 'మోతాదు',
    rxTiming: 'సమయం',
    rxDuration: 'వ్యవధి',

    labTitle: 'ల్యాబ్ రిపోర్ట్ & బ్లడ్ టెస్ట్ AI విశ్లేషణ',
    labSub: 'రక్త పరీక్షలు, CBC, లిపిడ్ లేదా థైరాయిడ్ రిపోర్టులను అప్‌లోడ్ చేసి మీ ఫలితాలను సులభంగా అర్థం చేసుకోండి.',
    labScanCamera: 'ల్యాబ్ చీటీ స్కాన్',
    labUpload: 'రిపోర్ట్ అప్‌లోడ్ చేయండి',
    labSampleLabel: '💡 నమూనా ల్యాబ్ రిపోర్టుతో పరీక్షించండి:',
    labAnalyzingStatus: 'రక్త పరీక్ష మరియు సాధారణ పరిమితులను విశ్లేషిస్తోంది...',
    labResultHeader: 'ల్యాబ్ రిపోర్ట్ విశ్లేషణ & ఆరోగ్య సలహాలు',
    labTestName: 'పరీక్ష పేరు',
    labValue: 'ఫలితం',
    labRange: 'సాధారణ పరిమితి',
    labStatus: 'స్థితి',
    labNormal: 'సాధారణం',
    labLow: 'తక్కువ',
    labHigh: 'ఎక్కువ',
    labCritical: 'తీవ్రమైన హెచ్చరిక',
    labDietAdvice: 'ఆహారం & జీవనశైలి సలహాలు:',
    labDoctorQuestions: 'డాక్టర్‌ను అడగవలసిన ప్రశ్నలు:',

    remindersTitle: 'మందుల రిమైండర్లు & అలారాలు',
    remindersSub: 'రోజువారీ మందుల సమయాలు మరియు తీసుకున్న రికార్డు',
    remindersAddBtn: 'మందును చేర్చండి',
    remindersAdherence: 'నేటి మందుల పురోగతి',
    remindersTestChime: 'రిమైండర్ శబ్దాన్ని పరీక్షించండి',
    remindersEmpty: 'ప్రస్తుతం రిమైండర్లు లేవు. "+ చేర్చండి" పై నొక్కండి లేదా పైన ప్రిస్క్రిప్షన్ స్కాన్ చేయండి.',
    remindersModalTitle: 'మందుల రిమైండర్ చేర్చండి',
    medNameLabel: 'మందు పేరు',
    medDoseLabel: 'మోతాదు',
    medTimeLabel: 'సమయం',
    medFoodLabel: 'ఆహార సంబంధం',
    medFreqLabel: 'ఫ్రీక్వెన్సీ',
    saveReminderBtn: 'రిమైండర్ సేవ్ చేయండి',

    aidTitle: 'విజువల్ ప్రథమ చికిత్స AI స్కానర్',
    aidSub: 'కాలిన గాయాలు, కోతలు లేదా కీటకాల కాటు ఫోటో తీసి తక్షణ ప్రథమ చికిత్స పొందండి.',
    aidCamera: 'గాయం ఫోటో తీయండి',
    aidUpload: 'ఫోటో అప్‌లోడ్',
    aidSamplesLabel: '💡 నమూనా గాయం ఫోటోతో పరీక్షించండి:',
    aidDoNow: 'తక్షణమే చేయవలసిన చర్యలు (ఇప్పుడే చేయండి):',
    aidDoNot: 'చేయకూడనివి (ప్రమాదకరమైన తప్పులు):',
    aidRedFlags: 'ఆసుపత్రికి ఎప్పుడు వెళ్ళాలి / హెచ్చరికలు:',
    aidNearbyClinics: '🏥 సిఫార్సు చేయబడిన సమీప క్లినిక్‌లు & ట్రామా సెంటర్లు:',
    aidCallClinic: 'క్లినిక్‌కు కాల్ చేయండి',
    aidDirections: 'దారి తెలుసుకోండి',
    aidOfflineGuidesTitle: 'ఆఫ్‌లైన్ ప్రామాణిక అత్యవసర గైడ్‌లు:',

    bedsTitle: 'లైవ్ ఆసుపత్రి బెడ్స్ & వైద్యుల డైరెక్టరీ',
    bedsSub: 'నిజమైన బెడ్ల సంఖ్య, విధుల్లో ఉన్న వైద్యుల ప్రొఫైల్స్ & అత్యవసర హెల్ప్‌లైన్లు',
    bedsSearchPlaceholder: 'ఆసుపత్రి, డాక్టర్, ప్రాంతం లేదా విభాగాన్ని వెతకండి (ఉదా. అపోలో, ICU)...',
    bedsCityAll: 'అన్ని నగరాలు',
    bedsAvailableOnly: 'ఖాళీ బెడ్లు ఉన్న ఆసుపత్రులు మాత్రమే చూపించు',
    bedsFreePill: 'ఖాళీ బెడ్లు',
    bedsTotalCap: 'మొత్తం సామర్థ్యం',
    bedsOccupancy: 'బెడ్ ఆక్యుపెన్సీ',
    bedsGeneral: 'జనరల్',
    bedsICU: 'ICU',
    bedsOxygen: 'ఆక్సిజన్',
    bedsTrauma: 'ట్రామా',
    bedsVentilators: 'వెంటిలేటర్లు',
    bedsMaternity: 'ప్రసూతి',
    bedsRefresh: 'లైవ్ బెడ్స్ రిఫ్రెష్ చేయండి',
    bedsTapModal: 'వైద్యుల ప్రొఫైల్స్ & హెల్ప్‌లైన్ల కోసం తాకండి',
    bedsDoctorTitle: 'విధుల్లో ఉన్న వైద్యులు & నిపుణులు:',
    bedsEmergencyContactsTitle: '24/7 అత్యవసర నంబర్లు & హెల్ప్‌లైన్లు:',
    bedsPreAlertBtn: 'అత్యవసర క్యాజువాలిటీకి ముందస్తు సమాచారం ఇవ్వండి',
    bedsPreAlertSuccess: 'క్యాజువాలిటీ అలర్ట్ టోకెన్ సిద్ధమైంది',
    bedsCallReception: 'రిసెప్షన్‌కు కాల్ చేయండి',

    voiceModalTitle: 'వాయిస్ హెల్త్ డాక్టర్ కన్సల్టేషన్',
    voiceModalSub: 'మీ భాషలో మాట్లాడండి మరియు తక్షణ వైద్య పరిష్కారం మరియు ఇంటి చిట్కాలు పొందండి',
    voiceListening: 'వింటున్నాము... ఆపడానికి నొక్కండి',
    voiceTapToSpeak: 'మీ సమస్యను మాట్లాడటానికి మైక్ నొక్కండి',
    voiceVolumeLevel: 'వాల్యూమ్ స్థాయి',
    voiceFormulating: 'డాక్టర్ పరిష్కారం సిద్ధం చేస్తున్నారు...',
    voiceHeardLabel: 'వినబడినది:',
    voiceSolutionLabel: 'AI డాక్టర్ పరిష్కారం & గృహ చిట్కాలు:',
    voiceSamplesTitle: '💡 లేదా పరీక్షించడానికి లక్షణాన్ని ఎంచుకోండి:',
    voiceChooseLangPrompt: 'మీకు ఏ భాషలో సమాధానం కావాలి?',
    voiceGetSolutionBtn: 'సమాధానం పొందండి',
    voiceDoneSpeaking: 'మాట్లాడటం పూర్తయింది ➔',
    voiceTryAnother: 'మరొక ప్రశ్న అడగండి',

    chatTitle: 'కేర్‌బ్రిడ్జ్ AI డాక్టర్',
    chatPlaceholder: 'మీ భాషలో ఏదైనా ఆరోగ్య ప్రశ్న అడగండి...',
    chatDoctorPrompt: 'AI డాక్టర్‌తో మాట్లాడండి',
    chatEmergencyAlert: 'అత్యవసర హెచ్చరిక',

    emergencyHubTitle: 'అత్యవసర హెల్ప్‌లైన్లు & SOS కాంటాక్ట్‌లు',
    emergencyHubSub: 'జాతీయ అత్యవసర రెస్పాండర్లు మరియు కుటుంబ సభ్యుల నంబర్లకు తక్షణ కాల్ సౌకర్యం',
    emergencyHelplinesTitle: '24/7 జాతీయ & వైద్య హెల్ప్‌లైన్లు:',
    personalContactsTitle: 'నా కుటుంబ సభ్యులు & డాక్టర్ కాంటాక్ట్‌లు (ఆఫ్‌లైన్ లభ్యం):',
    addPersonalContact: 'కాంటాక్ట్ చేర్చండి',
    contactName: 'వ్యక్తి పేరు',
    contactRelation: 'సంబంధం (ఉదా. భాగస్వామి, డాక్టర్, సోదరి)',
    contactPhone: 'మొబైల్ నంబర్',
    callNow: 'కాల్ చేయండి',
    sendSosSms: 'SOS మెసేజ్ పంపండి',
    offlineHandbookTitle: 'ఆఫ్‌లైన్ ప్రామాణిక ప్రథమ చికిత్స గైడ్‌లు',
    offlineLabHandbookTitle: 'ఆఫ్‌లైన్ సాధారణ రక్త పరీక్ష పరిమితుల గైడ్',
  },

  ta: {
    appName: 'கேர்பிரிட்ஜ் AI',
    tagline: 'எளிய சுகாதார மற்றும் அவசர கால துணைவன்',
    sosButton: 'அவசரம் 108',
    speakHeroTitle: 'உங்கள் உடல்நலப் பிரச்சனையை பேசி தெரிவிக்கவும்',
    speakHeroSub: 'தமிழ், தெலுங்கு, இந்தி அல்லது ஆங்கிலத்தில் பேசி உடனடி AI தீர்வைப் பெறுங்கள்',
    speakButton: '🎙️ பேசுங்கள்',
    offlineModeNotice: 'ஆஃப்லைன் முறை: அவசர வழிகாட்டிகள், மருந்து நினைவூட்டல் & மருத்துவமனை எண்கள் தயார்',

    tabScanner: 'மருந்து சீட்டு',
    tabLabReport: 'லேப் ரிப்போர்ட்',
    tabVoice: 'மொழிபெயர்ப்பு',
    tabReminders: 'நினைவூட்டல்',
    tabFirstAid: 'முதலுதவி',
    tabBeds: 'படுக்கை & மருத்துவர்கள்',

    rxTitle: 'மருந்துச் சீட்டு & மருந்துகள் AI ஸ்கேனர்',
    rxSub: 'மருத்துவர் சீட்டு அல்லது மருந்து அட்டையை ஸ்கேன் செய்யுங்கள். எளிய தமிழில் மருந்தளவு மற்றும் நேரத்தை விளக்குகிறோம்.',
    rxCamera: 'கேமரா ஸ்கேன்',
    rxUpload: 'புகைப்படம் பதிவேற்று',
    rxSamplesLabel: '💡 மாதிரி மருந்துச் சீட்டுடன் சோதிக்கவும்:',
    rxDecodedHeader: 'மருந்துச் சீட்டு விளக்கம்',
    rxExplanation: 'எளிய விளக்கம்:',
    rxAddAllReminders: 'அனைத்து மருந்துகளையும் நினைவூட்டலில் சேர்க்கவும்',
    rxListenAudio: 'வழிகாட்டுதலைக் கேட்கவும்',
    rxStopAudio: 'ஆடியோ நிறுத்து',
    rxScanNew: 'புதிய ஸ்கேன்',
    rxReadingStatus: 'ஜெமினி விஷன் மருத்துவரின் கையெழுத்தை படிக்கிறது...',
    rxFoodRelation: 'உணவு முறை',
    rxDosage: 'மருந்தளவு',
    rxTiming: 'நேரம்',
    rxDuration: 'கால அளவு',

    labTitle: 'லேப் ரிப்போர்ட் & இரத்தப் பரிசோதனை AI பகுப்பாய்வி',
    labSub: 'இரத்தப் பரிசோதனை, CBC, லிப்பிட் அல்லது தைராய்டு அறிக்கைகளை பதிவேற்றி உங்கள் முடிவுகளை எளிதாகப் புரிந்து கொள்ளுங்கள்.',
    labScanCamera: 'லேப் சீட்டு ஸ்கேன்',
    labUpload: 'அறிக்கையை பதிவேற்று',
    labSampleLabel: '💡 மாதிரி லேப் அறிக்கையுடன் சோதிக்கவும்:',
    labAnalyzingStatus: 'இரத்தப் பரிசோதனை மற்றும் இயல்பான அளவுகள் பகுப்பாய்வு செய்யப்படுகிறது...',
    labResultHeader: 'லேப் அறிக்கை பகுப்பாய்வு & மருத்துவ ஆலோசனைகள்',
    labTestName: 'பரிசோதனை பெயர்',
    labValue: 'முடிவு',
    labRange: 'இயல்பான அளவு',
    labStatus: 'நிலை',
    labNormal: 'இயல்பானது',
    labLow: 'குறைவு',
    labHigh: 'அதிகம்',
    labCritical: 'அவசர எச்சரிக்கை',
    labDietAdvice: 'உணவு & வாழ்க்கை முறை ஆலோசனைகள்:',
    labDoctorQuestions: 'மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்:',

    remindersTitle: 'மருந்து நினைவூட்டல்கள் & அலாரங்கள்',
    remindersSub: 'தினசரி மருந்து அட்டவணை மற்றும் உட்கொண்ட பதிவு',
    remindersAddBtn: 'மருந்து சேர்',
    remindersAdherence: 'இன்றைய மருந்து உட்கொள்ளல்',
    remindersTestChime: 'அலார ஒலியை சோதிக்கவும்',
    remindersEmpty: 'நினைவூட்டல்கள் எதுவும் இல்லை. "+ சேர்" அழுத்தவும் அல்லது மேலே மருந்துச் சீட்டை ஸ்கேன் செய்யவும்.',
    remindersModalTitle: 'மருந்து நினைவூட்டல் சேர்க்கவும்',
    medNameLabel: 'மருந்தின் பெயர்',
    medDoseLabel: 'அளவு',
    medTimeLabel: 'நேரம்',
    medFoodLabel: 'உணவு முறை',
    medFreqLabel: 'அதிர்வெண்',
    saveReminderBtn: 'சேமிக்கவும்',

    aidTitle: 'காட்சி முதலுதவி AI ஸ்கேனர்',
    aidSub: 'தீக்காயம், வெட்டுக்காயம் அல்லது பூச்சிக் கடியை புகைப்படம் எடுத்து உடனடி முதலுதவி பெறுங்கள்.',
    aidCamera: 'காயத்தை படம் பிடி',
    aidUpload: 'புகைப்படம் பதிவேற்று',
    aidSamplesLabel: '💡 மாதிரி காயம் புகைப்படத்துடன் சோதிக்கவும்:',
    aidDoNow: 'உடனடி நடவடிக்கைகள் (இப்போதே செய்யவும்):',
    aidDoNot: 'செய்யக்கூடாதவை (தவிர்க்க வேண்டிய தவறுகள்):',
    aidRedFlags: 'மருத்துவமனைக்கு எப்போது செல்ல வேண்டும் / எச்சரிக்கைகள்:',
    aidNearbyClinics: '🏥 பரிந்துரைக்கப்பட்ட அருகிலுள்ள கிளினிக்குகள் & அதிர்ச்சி மையங்கள்:',
    aidCallClinic: 'கிளினிக்கை அழைக்கவும்',
    aidDirections: 'வழிசெலுத்தல்',
    aidOfflineGuidesTitle: 'ஆஃப்லைன் சான்றளிக்கப்பட்ட அவசர வழிகாட்டிகள்:',

    bedsTitle: 'நேரலை மருத்துவமனை படுக்கைகள் & மருத்துவர் விபரம்',
    bedsSub: 'நேரடி படுக்கை எண்ணிக்கை, பணியிலுள்ள மருத்துவர் விவரங்கள் & அவசர எண்கள்',
    bedsSearchPlaceholder: 'மருத்துவமனை, மருத்துவர் அல்லது பகுதியை தேடுங்கள் (எ.கா. அப்பல்லோ, ICU)...',
    bedsCityAll: 'அனைத்து நகரங்கள்',
    bedsAvailableOnly: 'காலியான படுக்கைகள் உள்ளவை மட்டும்',
    bedsFreePill: 'காலி படுக்கைகள்',
    bedsTotalCap: 'மொத்த கொள்ளளவு',
    bedsOccupancy: 'படுக்கை நிரம்பல்',
    bedsGeneral: 'பொது வார்டு',
    bedsICU: 'ICU',
    bedsOxygen: 'ஆக்ஸிஜன்',
    bedsTrauma: 'அதிர்ச்சி வார்டு',
    bedsVentilators: 'வென்டிலேட்டர்கள்',
    bedsMaternity: 'மகப்பேறு',
    bedsRefresh: 'நேரலை படுக்கைகளை புதுப்பிக்கவும்',
    bedsTapModal: 'மருத்துவர் விபரம் & அவசர எண்களுக்கு தட்டவும்',
    bedsDoctorTitle: 'பணியிலுள்ள மருத்துவர்கள் & நிபுணர்கள்:',
    bedsEmergencyContactsTitle: '24/7 அவசர எண்கள் & உதவி எண்கள்:',
    bedsPreAlertBtn: 'அவசர சிகிச்சை பிரிவுக்கு முன்கூட்டியே தகவல் அனுப்பு',
    bedsPreAlertSuccess: 'அவசர டோக்கன் உருவாக்கப்பட்டது',
    bedsCallReception: 'வரவேற்பறையை அழைக்கவும்',

    voiceModalTitle: 'குரல்வழி மருத்துவ ஆலோசனை',
    voiceModalSub: 'உங்கள் மொழியில் பேசி உடனடி மருத்துவ தீர்வு மற்றும் வீட்டு வைத்தியங்களைப் பெறுங்கள்',
    voiceListening: 'கேட்கிறது... நிறுத்த தட்டவும்',
    voiceTapToSpeak: 'உங்கள் பிரச்சனையைக் கூற மைக்கை அழுத்தவும்',
    voiceVolumeLevel: 'ஒலி அளவு',
    voiceFormulating: 'மருத்துவர் ஆலோசனை தயாராகிறது...',
    voiceHeardLabel: 'கேட்கப்பட்ட செய்தி:',
    voiceSolutionLabel: 'AI மருத்துவர் தீர்வு & வீட்டு வைத்தியம்:',
    voiceSamplesTitle: '💡 அல்லது பரிசோதிக்க அறிகுறிகளைத் தட்டவும்:',
    voiceChooseLangPrompt: 'எந்த மொழியில் தீர்வு வேண்டும்?',
    voiceGetSolutionBtn: 'தீர்வு பெறவும்',
    voiceDoneSpeaking: 'பேசி முடிந்தது ➔',
    voiceTryAnother: 'மற்றொரு கேள்வியைக் கேளுங்கள்',

    chatTitle: 'கேர்பிரிட்జ్ AI மருத்துவர்',
    chatPlaceholder: 'உங்கள் மொழியில் எந்தவொரு மருத்துவக் கேள்வியையும் கேளுங்கள்...',
    chatDoctorPrompt: 'AI மருத்துவரிடம் பேசுங்கள்',
    chatEmergencyAlert: 'அவசர எச்சரிக்கை',

    emergencyHubTitle: 'அவசர உதவி எண்கள் & SOS தொடர்புகள்',
    emergencyHubSub: 'தேசிய அவசர பிரிவுகள் மற்றும் சேமிக்கப்பட்ட குடும்ப எண்களுக்கு உடனடி தொடர்பு',
    emergencyHelplinesTitle: '24/7 தேசிய மற்றும் மருத்துவ உதவி எண்கள்:',
    personalContactsTitle: 'எனது குடும்பத்தினர் & மருத்துவர் தொடர்புகள் (ஆஃப்லைனில் கிடைக்கும்):',
    addPersonalContact: 'தொடர்பை சேர்',
    contactName: 'பெயர்',
    contactRelation: 'உறவுமுறை (எ.கா. மனைவி, மருத்துவர், சகோதரி)',
    contactPhone: 'மொபைல் எண்',
    callNow: 'அழைக்கவும்',
    sendSosSms: 'SOS செய்தி அனுப்பு',
    offlineHandbookTitle: 'ஆஃப்லைன் சான்றளிக்கப்பட்ட முதலுதவி வழிகாட்டிகள்',
    offlineLabHandbookTitle: 'ஆஃப்லைன் இரத்தப் பரிசோதனை இயல்புநிலை வழிகாட்டி',
  },
};
