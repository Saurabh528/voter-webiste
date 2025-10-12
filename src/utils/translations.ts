export type Language = "en" | "hi";

// Campaign slogans - these remain in Hindi for both languages
const HINDI_SLOGANS = {
  candidateName: "श्री अरुण कुमार त्रिपाठी",
  primarySlogan: "अधिवक्ता एकता और सम्मान के लिए, श्री अरुण कुमार त्रिपाठी को सदस्य पद पर अपना समर्थन दें। मोहर लगाएं वरीयता (1) पर।",
  secondarySlogan: "आपका समर्थन, विजय का आधार। प्रथम वरीयता (1) पर मुहर इस बार।"
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
    // Hero Section - Slogans remain in Hindi
    hero: {
      mainTitle: "Bar Council of Uttar Pradesh - Check Voter Registration",
      candidateName: HINDI_SLOGANS.candidateName,
      primarySlogan: HINDI_SLOGANS.primarySlogan,
      secondarySlogan: HINDI_SLOGANS.secondarySlogan,
      searchTitle: "Check Your Voter Registration Status"
    },
    // Search Section
    search: {
      tabEnrollment: "Search by Enrollment Number",
      tabNameDistrict: "Search by Name and District",
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
      contactNumber: "9415451856",
      enrollmentNumber: "Enrollment Number",
      copNumber: "COP Number",
      address: "Address",
      searchAgain: "Search Again",
      joinWhatsApp: "Join our WhatsApp group for every election update",
      joinWhatsAppButton: "चुनाव की हर अपडेट के लिए हमारा व्हाट्सएप ग्रुप ज्वाइन करें"
    },
    // Contact & Footer
    contact: {
      title: "Contact Us",
      phone: "Phone",
      whatsapp: "WhatsApp",
      joinCampaign: "श्री अरुण त्रिपाठी जी के अभियान से जुड़ें",
      joinSubtitle: "नियमित अपडेट पाने और संवाद करने के लिए, कृपया हमसे संपर्क करें।",
      whatsappUpdate: "अपडेट्स और संवाद के लिए व्हाट्सएप पर जुड़ें",
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
    // Hero Section - Slogans in Hindi
    hero: {
      mainTitle: "बार कौंसिल ऑफ उत्तर प्रदेश - वोटर रजिस्ट्रेशन जांचें",
      candidateName: HINDI_SLOGANS.candidateName,
      primarySlogan: HINDI_SLOGANS.primarySlogan,
      secondarySlogan: HINDI_SLOGANS.secondarySlogan,
      searchTitle: "अपना वोटर रजिस्ट्रेशन स्टेटस जांचें"
    },
    // Search Section
    search: {
      tabEnrollment: "एनरोलमेंट नंबर से खोजें",
      tabNameDistrict: "नाम और जिले से खोजें",
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
      registered: "आप एक पंजीकृत मतदाता हैं! अब वकीलों के हक़ और सम्मान की इस लड़ाई में, अपना बहुमूल्य वोट देकर श्री अरुण कुमार त्रिपाठी को प्रथम वरीयता (1) पर विजयी बनाने की कृपा करें।",
      notRegistered: "आपका नाम मतदाता सूची में नहीं है।",
      notRegisteredContact: "किसी भी सहायता या जानकारी के लिए, कृपया श्री अरुण कुमार त्रिपाठी से इस नंबर पर संपर्क करें:",
      contactNumber: "9415451856",
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

// UP Districts (75 official districts - fallback if API fails)
export const upDistricts = [
  "AGRA", "ALIGARH", "ALLAHABAD", "PRAYAGRAJ", "AMBEDKAR NAGAR", "AMETHI", "AMROHA", "AURAIYA", "AYODHYA", "AZAMGARH",
  "BAGHPAT", "BAHRAICH", "BALLIA", "BALRAMPUR", "BANDA", "BARABANKI", "BAREILLY", "BASTI", "BHADOHI", "BIJNOR", "BUDAUN", "BULANDSHAHR",
  "CHANDAULI", "CHITRAKOOT",
  "DEORIA",
  "ETAH", "ETAWAH",
  "FARRUKHABAD", "FATEHPUR", "FIROZABAD",
  "GAUTAM BUDDHA NAGAR", "NOIDA", "GHAZIABAD", "GHAZIPUR", "GONDA", "GORAKHPUR",
  "HAMIRPUR", "HAPUR", "HARDOI", "HATHRAS",
  "JALAUN", "JAUNPUR", "JHANSI",
  "KANNAUJ", "KANPUR DEHAT", "KANPUR NAGAR", "KANPUR", "KASGANJ", "KAUSHAMBI", "KUSHINAGAR",
  "LAKHIMPUR KHERI", "LALITPUR", "LUCKNOW",
  "MAHARAJGANJ", "MAHOBA", "MAINPURI", "MATHURA", "MAU", "MEERUT", "MIRZAPUR", "MORADABAD", "MUZAFFARNAGAR",
  "PILIBHIT", "PRATAPGARH",
  "RAEBARELI", "RAMPUR",
  "SAHARANPUR", "SAMBHAL", "SANT KABIR NAGAR", "SHAHJAHANPUR", "SHAMLI", "SHRAVASTI", "SIDDHARTHNAGAR", "SITAPUR", "SONBHADRA", "SULTANPUR",
  "UNNAO",
  "VARANASI"
];