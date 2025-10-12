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

// Comprehensive Devanagari (Hindi) to English transliteration map
const devanagariToEnglish = {
  // Vowels
  'अ': 'A', 'आ': 'A', 'इ': 'I', 'ई': 'I', 'उ': 'U', 'ऊ': 'U',
  'ए': 'E', 'ऐ': 'AI', 'ओ': 'O', 'औ': 'AU',
  'ऋ': 'RI', 'ॠ': 'RI',
  // Consonants
  'क': 'K', 'ख': 'KH', 'ग': 'G', 'घ': 'GH', 'ङ': 'NG',
  'च': 'CH', 'छ': 'CHH', 'ज': 'J', 'झ': 'JH', 'ञ': 'NY',
  'ट': 'T', 'ठ': 'TH', 'ड': 'D', 'ढ': 'DH', 'ण': 'N',
  'त': 'T', 'थ': 'TH', 'द': 'D', 'ध': 'DH', 'न': 'N',
  'प': 'P', 'फ': 'PH', 'ब': 'B', 'भ': 'BH', 'म': 'M',
  'य': 'Y', 'र': 'R', 'ल': 'L', 'व': 'V', 'W': 'V',
  'श': 'SH', 'ष': 'SH', 'स': 'S', 'ह': 'H',
  'क़': 'Q', 'ख़': 'KH', 'ग़': 'GH', 'ज़': 'Z', 'झ़': 'ZH', 'फ़': 'F',
  // Matras (vowel signs)
  'ा': 'A', 'ि': 'I', 'ी': 'I', 'ु': 'U', 'ू': 'U',
  'े': 'E', 'ै': 'AI', 'ो': 'O', 'ौ': 'AU',
  'ृ': 'RI', 'ॄ': 'RI',
  // Special characters
  'ं': 'N', 'ः': 'H', '्': '', 'ँ': 'N',
  // Numbers (Devanagari)
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

// Common Hindi name patterns for better matching (most common spellings)
const commonHindiWords = {
  // Surnames
  'कुमार': 'KUMAR',
  'सिंह': 'SINGH',
  'शर्मा': 'SHARMA',
  'वर्मा': 'VERMA',
  'गुप्ता': 'GUPTA',
  'यादव': 'YADAV',
  'पाण्डेय': 'PANDEY',
  'पांडे': 'PANDEY',
  'पांडेय': 'PANDEY',
  'त्रिपाठी': 'TRIPATHI',
  'द्विवेदी': 'DWIVEDI',
  'मिश्रा': 'MISHRA',
  'मिश्र': 'MISHRA',
  'राय': 'RAI',
  'चौधरी': 'CHAUDHARY',
  'चौधरी': 'CHAUDHRY',
  'श्रीवास्तव': 'SRIVASTAVA|SHRIVASTAVA|SRIVAST',
  'प्रकाश': 'PRAKASH',
  'चंद्र': 'CHANDRA',
  'चन्द्र': 'CHANDRA',
  'राज': 'RAJ',
  'देव': 'DEV',
  'दास': 'DAS',
  'दुबे': 'DUBEY',
  'दूबे': 'DUBEY',
  'तिवारी': 'TIWARI',
  'पटेल': 'PATEL',
  'ठाकुर': 'THAKUR',
  'शुक्ला': 'SHUKLA',
  // First Names (multiple spelling variations)
  'आशीष': 'AASHEESH|ASHISH|ASHI',
  'आशीश': 'AASHEESH|ASHISH|ASHI',
  'राजेश': 'RAJESH|RAJEESH',
  'विजय': 'VIJAY|VIJEY',
  'मनोज': 'MANOJ|MANUJ',
  'संजय': 'SANJAY|SANJEY',
  'अजय': 'AJAY|AJEY',
  'विनय': 'VINAY|VINEY',
  'शंकर': 'SHANKAR|SHANKER',
  'ओम': 'OM',
  'काम': 'KAMLESH|KAMAL',
  'कमलेश': 'KAMLESH'
};

// Check if text contains Hindi characters
export function containsHindi(text) {
  if (!text) return false;
  // Devanagari Unicode range: 0900–097F
  return /[\u0900-\u097F]/.test(text);
}

// Transliterate Hindi text to English (returns all spelling variations)
export function transliterateHindiToEnglish(text) {
  if (!text) return '';
  
  let result = text;
  let hasVariations = false;
  
  // First, check for common whole words (better accuracy)
  // Replace with all variations using special marker
  Object.entries(commonHindiWords).forEach(([hindi, english]) => {
    if (result.includes(hindi)) {
      const regex = new RegExp(hindi, 'g');
      result = result.replace(regex, `{${english}}`);
      if (english.includes('|')) {
        hasVariations = true;
      }
    }
  });
  
  // Then transliterate remaining characters
  result = result.split('').map(char => {
    if (char === '{' || char === '}') return char;
    return devanagariToEnglish[char] || char;
  }).join('');
  
  result = result.toUpperCase().trim();
  
  // If we have variations, return the first one (most common spelling)
  // The search function will handle checking all variations
  result = result.replace(/\{([^}]+)\}/g, (match, content) => {
    return content.split('|')[0]; // Return first variation
  });
  
  return result;
}

// Get all spelling variations for a transliterated name
export function getAllSpellingVariations(text) {
  if (!text) return [text];
  
  let result = text;
  const variations = [[]];
  
  // Replace Hindi words with their variations
  Object.entries(commonHindiWords).forEach(([hindi, english]) => {
    if (result.includes(hindi)) {
      const regex = new RegExp(hindi, 'g');
      result = result.replace(regex, `{${english}}`);
    }
  });
  
  // Transliterate remaining characters
  result = result.split('').map(char => {
    if (char === '{' || char === '}') return char;
    return devanagariToEnglish[char] || char;
  }).join('');
  
  result = result.toUpperCase().trim();
  
  // Extract all variations
  const parts = result.split(/(\{[^}]+\})/);
  const allVariations = [];
  
  function generateCombinations(index, current) {
    if (index >= parts.length) {
      allVariations.push(current.trim());
      return;
    }
    
    const part = parts[index];
    if (part.startsWith('{') && part.endsWith('}')) {
      const options = part.slice(1, -1).split('|');
      options.forEach(option => {
        generateCombinations(index + 1, current + ' ' + option);
      });
    } else {
      generateCombinations(index + 1, current + ' ' + part);
    }
  }
  
  generateCombinations(0, '');
  
  return allVariations.length > 0 ? allVariations : [result];
}

// Normalize name for searching (handles both scripts)
export function normalizeName(name) {
  if (!name) return '';
  
  let normalized = name.trim().toUpperCase();
  
  // If contains Hindi, transliterate to English
  if (containsHindi(name)) {
    normalized = transliterateHindiToEnglish(name);
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
  transliterateHindiToEnglish,
  getAllSpellingVariations,
  bilingualSearch
};

