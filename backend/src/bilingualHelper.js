// Bilingual helper for English/Hindi search support

// District mappings - English to Hindi (75 Official UP Districts)
export const districtMappings = {
  'AGRA': 'आगरा',
  'ALIGARH': 'अलीगढ़',
  'ALLAHABAD': 'इलाहाबाद',
  'PRAYAGRAJ': 'प्रयागराज',
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
  'NOIDA': 'नोएडा',
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
  'KANPUR': 'कानपुर',
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

// Create reverse mapping (Hindi to English)
const hindiToEnglishDistricts = {};
Object.entries(districtMappings).forEach(([english, hindi]) => {
  hindiToEnglishDistricts[hindi] = english;
});

// Normalize district name to handle both English and Hindi
export function normalizeDistrict(district) {
  if (!district) return '';
  
  const normalized = district.trim().toUpperCase();
  
  // If it's in English, return as is
  if (districtMappings[normalized]) {
    return normalized;
  }
  
  // If it's in Hindi, convert to English
  if (hindiToEnglishDistricts[district.trim()]) {
    return hindiToEnglishDistricts[district.trim()];
  }
  
  // Try to find partial match
  const lowerInput = normalized.toLowerCase();
  for (const [english, hindi] of Object.entries(districtMappings)) {
    if (english.toLowerCase().includes(lowerInput) || 
        hindi.includes(district.trim())) {
      return english;
    }
  }
  
  return normalized;
}

// Get bilingual district list for frontend
export function getBilingualDistricts() {
  return Object.entries(districtMappings).map(([english, hindi]) => ({
    english,
    hindi,
    display: `${hindi} (${english})`,
    value: english
  }));
}

// Common Hindi name patterns and transliterations
const hindiToEnglishPatterns = {
  'कुमार': 'KUMAR',
  'सिंह': 'SINGH',
  'शर्मा': 'SHARMA',
  'वर्मा': 'VERMA',
  'गुप्ता': 'GUPTA',
  'यादव': 'YADAV',
  'पाण्डेय': 'PANDEY',
  'पांडे': 'PANDEY',
  'त्रिपाठी': 'TRIPATHI',
  'द्विवेदी': 'DWIVEDI',
  'मिश्रा': 'MISHRA',
  'राय': 'RAI',
  'चौधरी': 'CHAUDHARY',
  'श्रीवास्तव': 'SRIVASTAVA',
  'प्रकाश': 'PRAKASH',
  'चंद्र': 'CHANDRA',
  'राज': 'RAJ',
  'देव': 'DEV',
  'दास': 'DAS'
};

// Check if text contains Hindi characters
export function containsHindi(text) {
  if (!text) return false;
  // Devanagari Unicode range: 0900–097F
  return /[\u0900-\u097F]/.test(text);
}

// Normalize name for searching (handles both scripts)
export function normalizeName(name) {
  if (!name) return '';
  
  let normalized = name.trim().toUpperCase();
  
  // If contains Hindi, try to transliterate common patterns
  if (containsHindi(name)) {
    Object.entries(hindiToEnglishPatterns).forEach(([hindi, english]) => {
      normalized = normalized.replace(new RegExp(hindi, 'g'), english);
    });
  }
  
  return normalized;
}

// Search function that handles bilingual input
export function bilingualSearch(searchTerm, dataArray, field) {
  if (!searchTerm || !dataArray) return [];
  
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isHindiInput = containsHindi(searchTerm);
  
  return dataArray.filter(item => {
    const fieldValue = item[field] ? item[field].toString() : '';
    const normalizedField = fieldValue.toLowerCase();
    
    // Direct match
    if (normalizedField.includes(normalizedSearch)) {
      return true;
    }
    
    // If Hindi input, also check transliterated version
    if (isHindiInput) {
      const transliterated = normalizeName(searchTerm).toLowerCase();
      if (normalizedField.includes(transliterated)) {
        return true;
      }
    }
    
    return false;
  });
}

export default {
  districtMappings,
  normalizeDistrict,
  getBilingualDistricts,
  containsHindi,
  normalizeName,
  bilingualSearch
};

