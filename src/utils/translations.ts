export type Language = "en" | "hi";

// Campaign slogans - these remain in Hindi for both languages
const HINDI_SLOGANS = {
  candidateName: "श्री अरुण कुमार त्रिपाठी",
  message1: "अधिवक्ताओं की एकता और सम्मान के लिए — कृपया श्री अरुण कुमार त्रिपाठी को सदस्य पद पर अपना अटल समर्थन दें।",
  message2: "अधिवक्ता संरक्षण विधेयक की लड़ाई से लेकर बार सुविधाओं की मांग तक — हर मोर्चे पर अधिवक्ता हितों की दृढ़ रक्षा की है।",
  message3: "भ्रष्टाचार-मुक्त न्याय व्यवस्था और युवा अधिवक्ताओं के सशक्तिकरण के लिए सदैव सक्रिय और प्रतिबद्ध रहे हैं।",
  message4: "आपका पहला मत — एक मजबूत, संयुक्त और सम्मानित बार की नींव बने।"
};

const ENGLISH_SLOGANS = {
  candidateName: "Mr. Arun Kumar Tripathi",
  message1: "For unity and respect of all advocates — please give your strong support to Mr. Arun Kumar Tripathi for Member position.",
  message2: "From the fight for the Lawyer Protection Act to the demand for better Bar facilities — he has always stood for advocate welfare.",
  message3: "Committed to a corruption-free justice system and the empowerment of young lawyers.",
  message4: "Your first vote will build a strong, united, and respected Bar."
};

export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      voterCheck: "Check Registration",
      contact: "Contact"
    },
    // Landing Phone Capture
    phoneCapture: {
      title: "Get Important Election Updates",
      subtitle: "Enter your phone number to receive campaign updates",
      phonePlaceholder: "Enter your phone number",
      submitButton: "Continue",
      skipButton: "Skip and Continue to Website"
    },
    // Phone Prompt (Before Search)
    phonePrompt: {
      title: "Stay Connected",
      message: "Please provide your phone number to receive important campaign updates. You can also skip this step.",
      phonePlaceholder: "Enter your phone number",
      submitButton: "Submit & Search",
      skipButton: "Skip & Search"
    },
    // Hero Section - English messages
    hero: {
      mainTitle: "Bar Council of Uttar Pradesh - Check Voter Registration",
      candidateName: ENGLISH_SLOGANS.candidateName,
      message1: ENGLISH_SLOGANS.message1,
      message2: ENGLISH_SLOGANS.message2,
      message3: ENGLISH_SLOGANS.message3,
      message4: ENGLISH_SLOGANS.message4,
      searchTitle: "Check Your Voter Registration Status"
    },
    // Search Section
    search: {
      tabEnrollment: "By Enrollment",
      tabNameDistrict: "By Name & District",
      enrollmentLabel: "Enter your Enrollment Number",
      enrollmentPlaceholder: "e.g., UP10579/13",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      districtLabel: "Select District",
      districtPlaceholder: "Select your district",
      searchButton: "Search 🔍",
      searching: "Searching...",
      clearButton: "Clear"
    },
    // Results - Updated Messages
    results: {
      registered: "You are a registered voter! Now, in this fight for the rights and respect of lawyers, please make Shri Arun Kumar Tripathi victorious with your first preference (1) vote.",
      notRegistered: "Your name is not in the voter list.",
      notRegisteredContact: "For any assistance or information, please contact Shri Arun Kumar Tripathi at this number:",
      contactNumber: "9721777720",
      callButton: "Call Now",
      enrollmentNumber: "Enrollment Number",
      copNumber: "COP Number",
      address: "Address",
      searchAgain: "Search Again",
      joinWhatsApp: "Join our WhatsApp group for every election update",
      joinWhatsAppButton: "Join our WhatsApp group for every election update"
    },
    // Contact & Footer
    contact: {
      title: "Contact Us",
      phone: "Phone",
      whatsapp: "WhatsApp",
      joinCampaign: "Join Shri Arun Tripathi's Campaign",
      joinSubtitle: "For regular updates and communication, please contact us.",
      whatsappUpdate: "Join us on WhatsApp for updates and communication",
      contactNumbers: "Contact Numbers",
      followUs: "Follow Us on Social Media"
    },
    // Footer
    footer: {
      rights: "© 2026 Shri Arun Kumar Tripathi Campaign. All rights reserved."
    }
  },
  hi: {
    // Navigation
    nav: {
      home: "होम",
      voterCheck: "पंजीकरण जांचें",
      contact: "संपर्क करें"
    },
    // Landing Phone Capture
    phoneCapture: {
      title: "चुनाव सम्बंधित महत्वपूर्ण अपडेट्स पाने के लिए",
      subtitle: "अपना फ़ोन नंबर दर्ज करें",
      phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
      submitButton: "आगे बढ़ें",
      skipButton: "बिना नंबर दिए वेबसाइट पर जाएं"
    },
    // Phone Prompt (Before Search)
    phonePrompt: {
      title: "जुड़े रहें",
      message: "कृपया महत्वपूर्ण अभियान अपडेट्स प्राप्त करने के लिए अपना फ़ोन नंबर प्रदान करें। आप इस चरण को छोड़ भी सकते हैं।",
      phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
      submitButton: "सबमिट करें और खोजें",
      skipButton: "छोड़ें और खोजें"
    },
    // Hero Section - Hindi messages
    hero: {
      mainTitle: "बार कौंसिल ऑफ उत्तर प्रदेश - वोटर रजिस्ट्रेशन जांचें",
      candidateName: HINDI_SLOGANS.candidateName,
      message1: HINDI_SLOGANS.message1,
      message2: HINDI_SLOGANS.message2,
      message3: HINDI_SLOGANS.message3,
      message4: HINDI_SLOGANS.message4,
      searchTitle: "अपना वोटर रजिस्ट्रेशन स्टेटस जांचें"
    },
    // Search Section
    search: {
      tabEnrollment: "एनरोलमेंट से",
      tabNameDistrict: "नाम व जिले से",
      enrollmentLabel: "अपना एनरोलमेंट नंबर दर्ज करें",
      enrollmentPlaceholder: "उदा., UP10579/13",
      nameLabel: "पूरा नाम",
      namePlaceholder: "अपना पूरा नाम दर्ज करें",
      districtLabel: "जिला चुनें",
      districtPlaceholder: "अपना जिला चुनें",
      searchButton: "खोजें 🔍",
      searching: "खोज रहे हैं...",
      clearButton: "साफ़ करें"
    },
    // Results - Updated Messages
    results: {
      registered: "आप एक पंजीकृत मतदाता हैं! अब अधिवक्ताओं के हक़ और सम्मान की इस लड़ाई में, अपना बहुमूल्य वोट देकर श्री अरुण कुमार त्रिपाठी को प्रथम वरीयता (1) पर विजयी बनाने की कृपा करें।",
      notRegistered: "आपका नाम मतदाता सूची में नहीं है।",
      notRegisteredContact: "किसी भी सहायता या जानकारी के लिए, कृपया श्री अरुण कुमार त्रिपाठी से इस नंबर पर संपर्क करें:",
      contactNumber: "9721777720",
      callButton: "कॉल करें",
      enrollmentNumber: "एनरोलमेंट नंबर",
      copNumber: "COP नंबर",
      address: "पता",
      searchAgain: "पुनः खोजें",
      joinWhatsApp: "चुनाव की हर अपडेट के लिए हमारा व्हाट्सएप ग्रुप ज्वाइन करें",
      joinWhatsAppButton: "चुनाव की हर अपडेट के लिए हमारा व्हाट्सएप ग्रुप ज्वाइन करें"
    },
    // Contact & Footer
    contact: {
      title: "संपर्क करें",
      phone: "फ़ोन",
      whatsapp: "WhatsApp",
      joinCampaign: "श्री अरुण त्रिपाठी जी के अभियान से जुड़ें",
      joinSubtitle: "नियमित अपडेट पाने और संवाद करने के लिए, कृपया हमसे संपर्क करें।",
      whatsappUpdate: "अपडेट्स और संवाद के लिए व्हाट्सएप पर जुड़ें",
      contactNumbers: "संपर्क नंबर",
      followUs: "सोशल मीडिया पर फॉलो करें"
    },
    // Footer
    footer: {
      rights: "© 2026 श्री अरुण कुमार त्रिपाठी अभियान। सर्वाधिकार सुरक्षित।"
    }
  }
};

// UP Districts - Bilingual mappings (75 official districts - fallback if API fails)
export const districtMappings: Record<string, string> = {
  'AGRA': 'आगरा',
  'ALIGARH': 'अलीगढ़',
  'AMBEDKAR NAGAR': 'अम्बेडकर नगर',
  'AMETHI': 'अमेठी',
  'AMROHA': 'अमरोहा',
  'AURAIYA': 'औरैया',
  'AYODHYA': 'अयोध्या',
  'AZAMGARH': 'आज़मगढ़',
  'BAGHPAT': 'बागपत',
  'BAHRAICH': 'बहराइच',
  'BALLIA': 'बलिया',
  'BALRAMPUR': 'बलरामपुर',
  'BANDA': 'बांदा',
  'BARABANKI': 'बाराबंकी',
  'BAREILLY': 'बरेली',
  'BASTI': 'बस्ती',
  'BHADOHI': 'भदोही',
  'BIJNOR': 'बिजनौर',
  'BUDAUN': 'बदायूं',
  'BULANDSHAHR': 'बुलंदशहर',
  'CHANDAULI': 'चंदौली',
  'CHITRAKOOT': 'चित्रकूट',
  'DEORIA': 'देवरिया',
  'ETAH': 'एटा',
  'ETAWAH': 'इटावा',
  'FARRUKHABAD': 'फर्रुखाबाद',
  'FATEHPUR': 'फतेहपुर',
  'FIROZABAD': 'फिरोजाबाद',
  'GAUTAM BUDDHA NAGAR': 'गौतम बुद्ध नगर',
  'GHAZIABAD': 'गाजियाबाद',
  'GHAZIPUR': 'गाजीपुर',
  'GONDA': 'गोंडा',
  'GORAKHPUR': 'गोरखपुर',
  'HAMIRPUR': 'हमीरपुर',
  'HAPUR': 'हापुड़',
  'HARDOI': 'हरदोई',
  'HATHRAS': 'हाथरस',
  'JALAUN': 'जालौन',
  'JAUNPUR': 'जौनपुर',
  'JHANSI': 'झांसी',
  'KANNAUJ': 'कन्नौज',
  'KANPUR DEHAT': 'कानपुर देहात',
  'KANPUR NAGAR': 'कानपुर नगर',
  'KASGANJ': 'कासगंज',
  'KAUSHAMBI': 'कौशाम्बी',
  'KUSHINAGAR': 'कुशीनगर',
  'LAKHIMPUR KHERI': 'लखीमपुर खीरी',
  'LALITPUR': 'ललितपुर',
  'LUCKNOW': 'लखनऊ',
  'MAHARAJGANJ': 'महाराजगंज',
  'MAHOBA': 'महोबा',
  'MAINPURI': 'मैनपुरी',
  'MATHURA': 'मथुरा',
  'MAU': 'मऊ',
  'MEERUT': 'मेरठ',
  'MIRZAPUR': 'मिर्जापुर',
  'MORADABAD': 'मुरादाबाद',
  'MUZAFFARNAGAR': 'मुज़फ़्फ़रनगर',
  'PILIBHIT': 'पीलीभीत',
  'PRATAPGARH': 'प्रतापगढ़',
  'PRAYAGRAJ': 'प्रयागराज',
  'RAEBARELI': 'रायबरेली',
  'RAMPUR': 'रामपुर',
  'SAHARANPUR': 'सहारनपुर',
  'SAMBHAL': 'संभल',
  'SANT KABIR NAGAR': 'संत कबीर नगर',
  'SHAHJAHANPUR': 'शाहजहांपुर',
  'SHAMLI': 'शामली',
  'SHRAVASTI': 'श्रावस्ती',
  'SIDDHARTHNAGAR': 'सिद्धार्थनगर',
  'SITAPUR': 'सीतापुर',
  'SONBHADRA': 'सोनभद्र',
  'SULTANPUR': 'सुल्तानपुर',
  'UNNAO': 'उन्नाव',
  'VARANASI': 'वाराणसी'
};

// UP Districts array (for backward compatibility)
export const upDistricts = Object.keys(districtMappings);