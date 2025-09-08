const locationVariations = {
  // Odisha districts with common misspellings
  'balangir': ['bolangir', 'balangir', 'balangiri', 'bolangiri', 'balangirh', 'bolangirh', 'bongalir', 'bongaliri', 'bongalirh', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir', 'bongalir'],
  'bhubaneswar': ['bhubaneshwar', 'bhubaneshvar', 'bhubanesvar', 'bhubaneshwar', 'bhubaneshvar'],
  'cuttack': ['kattak', 'kattak', 'cuttak', 'kuttack', 'cuttak'],
  'puri': ['puri', 'puri', 'puri'],
  'khordha': ['khurda', 'khorda', 'khurda', 'khorda'],
  'gajapati': ['gajapati', 'gajapati'],
  'ganjam': ['ganjam', 'ganjam'],
  'jagatsinghpur': ['jagatsinghpur', 'jagatsingpur', 'jagatsinghpur'],
  'jajpur': ['jajpur', 'jajpur'],
  'jharsuguda': ['jharsuguda', 'jharsuguda'],
  'kalahandi': ['kalahandi', 'kalahandi'],
  'kandhamal': ['kandhamal', 'kandhamal'],
  'kendrapara': ['kendrapara', 'kendrapara'],
  'kendujhar': ['kendujhar', 'kendujhar', 'keonjhar', 'keonjhar'],
  'malkangiri': ['malkangiri', 'malkangiri'],
  'mayurbhanj': ['mayurbhanj', 'mayurbhanj'],
  'nabarangpur': ['nabarangpur', 'nabarangpur'],
  'nuapada': ['nuapada', 'nuapada'],
  'rayagada': ['rayagada', 'rayagada'],
  'sambalpur': ['sambalpur', 'sambalpur'],
  'subarnapur': ['subarnapur', 'subarnapur'],
  'sundargarh': ['sundargarh', 'sundargarh'],
  
  // States with variations
  'odisha': ['orissa', 'odisha', 'orisa', 'odisa'],
  'west bengal': ['west bengal', 'westbengal', 'wb', 'bengal'],
  'bihar': ['bihar', 'bihar'],
  'jharkhand': ['jharkhand', 'jharkhand'],
  'chhattisgarh': ['chhattisgarh', 'chhatisgarh', 'chattisgarh'],
  'andhra pradesh': ['andhra pradesh', 'andhra', 'ap'],
  'telangana': ['telangana', 'telangana'],
  
  // Common city variations
  'kolkata': ['calcutta', 'kolkata', 'kolkatta'],
  'mumbai': ['bombay', 'mumbai', 'mumbai'],
  'delhi': ['delhi', 'new delhi', 'delhi'],
  'bangalore': ['bengaluru', 'bangalore', 'bangalore'],
  'chennai': ['madras', 'chennai', 'chennai'],
  'hyderabad': ['hyderabad', 'hyderabad'],
  'pune': ['pune', 'pune'],
  'ahmedabad': ['ahmedabad', 'ahmedabad'],
  'jaipur': ['jaipur', 'jaipur'],
  'lucknow': ['lucknow', 'lucknow'],
  'kanpur': ['kanpur', 'kanpur'],
  'nagpur': ['nagpur', 'nagpur'],
  'indore': ['indore', 'indore'],
  'thane': ['thane', 'thane'],
  'bhopal': ['bhopal', 'bhopal'],
  'visakhapatnam': ['vizag', 'visakhapatnam', 'vizag'],
  'pimpri': ['pimpri', 'pimpri'],
  'patna': ['patna', 'patna'],
  'vadodara': ['baroda', 'vadodara', 'baroda'],
  'ludhiana': ['ludhiana', 'ludhiana'],
  'agra': ['agra', 'agra'],
  'nashik': ['nashik', 'nashik'],
  'faridabad': ['faridabad', 'faridabad'],
  'meerut': ['meerut', 'meerut'],
  'rajkot': ['rajkot', 'rajkot'],
  'kalyan': ['kalyan', 'kalyan'],
  'vasai': ['vasai', 'vasai'],
  'varanasi': ['banaras', 'varanasi', 'banaras'],
  'srinagar': ['srinagar', 'srinagar'],
  'aurangabad': ['aurangabad', 'aurangabad'],
  'noida': ['noida', 'noida'],
  'solapur': ['solapur', 'solapur'],
  'hubli': ['hubli', 'hubli'],
  'madurai': ['madurai', 'madurai'],
  'mysore': ['mysuru', 'mysore', 'mysuru'],
  'gulbarga': ['kalaburagi', 'gulbarga', 'kalaburagi'],
  'kochi': ['cochin', 'kochi', 'cochin'],
  'bhavnagar': ['bhavnagar', 'bhavnagar'],
  'salem': ['salem', 'salem'],
  'warangal': ['warangal', 'warangal'],
  'guntur': ['guntur', 'guntur'],
  'bhiwandi': ['bhiwandi', 'bhiwandi'],
  'amravati': ['amravati', 'amravati'],
  'nanded': ['nanded', 'nanded'],
  'kolhapur': ['kolhapur', 'kolhapur'],
  'ulhasnagar': ['ulhasnagar', 'ulhasnagar'],
  'sangli': ['sangli', 'sangli'],
  'malegaon': ['malegaon', 'malegaon'],
  'ulhasnagar': ['ulhasnagar', 'ulhasnagar'],
  'jalgaon': ['jalgaon', 'jalgaon'],
  'akola': ['akola', 'akola'],
  'latur': ['latur', 'latur'],
  'ahmednagar': ['ahmednagar', 'ahmednagar'],
  'ichalkaranji': ['ichalkaranji', 'ichalkaranji'],
  'parbhani': ['parbhani', 'parbhani'],
  'jalna': ['jalna', 'jalna'],
  'bhusawal': ['bhusawal', 'bhusawal'],
  'amalner': ['amalner', 'amalner'],
  'dhule': ['dhule', 'dhule'],
  'chalisgaon': ['chalisgaon', 'chalisgaon'],
  'bhiwani': ['bhiwani', 'bhiwani'],
  'ambala': ['ambala', 'ambala'],
  'yamunanagar': ['yamunanagar', 'yamunanagar'],
  'karnal': ['karnal', 'karnal'],
  'panipat': ['panipat', 'panipat'],
  'hisar': ['hisar', 'hisar'],
  'rohtak': ['rohtak', 'rohtak'],
  'gurgaon': ['gurugram', 'gurgaon', 'gurugram'],
  'sonipat': ['sonipat', 'sonipat'],
  'panchkula': ['panchkula', 'panchkula'],
  'kaithal': ['kaithal', 'kaithal'],
  'kurukshetra': ['kurukshetra', 'kurukshetra'],
  'rewari': ['rewari', 'rewari'],
  'palwal': ['palwal', 'palwal'],
  'narnaul': ['narnaul', 'narnaul'],
  'bahadurgarh': ['bahadurgarh', 'bahadurgarh'],
  'bhiwani': ['bhiwani', 'bhiwani'],
  'mahendragarh': ['mahendragarh', 'mahendragarh'],
  'jind': ['jind', 'jind'],
  'fatehabad': ['fatehabad', 'fatehabad'],
  'sirsa': ['sirsa', 'sirsa'],
  'thanesar': ['thanesar', 'thanesar'],
  'kaithal': ['kaithal', 'kaithal'],
  'narwana': ['narwana', 'narwana'],
  'taraori': ['taraori', 'taraori'],
  'ladwa': ['ladwa', 'ladwa'],
  'pehowa': ['pehowa', 'pehowa'],
  'shahbad': ['shahbad', 'shahbad'],
  'hansi': ['hansi', 'hansi'],
  'narnaul': ['narnaul', 'narnaul'],
  'fatehabad': ['fatehabad', 'fatehabad'],
  'sirsa': ['sirsa', 'sirsa'],
  'thanesar': ['thanesar', 'thanesar'],
  'kaithal': ['kaithal', 'kaithal'],
  'narwana': ['narwana', 'narwana'],
  'taraori': ['taraori', 'taraori'],
  'ladwa': ['ladwa', 'ladwa'],
  'pehowa': ['pehowa', 'pehowa'],
  'shahbad': ['shahbad', 'shahbad'],
  'hansi': ['hansi', 'hansi']
};

// Create reverse mapping for quick lookup
const locationMap = {};
Object.keys(locationVariations).forEach(canonical => {
  locationVariations[canonical].forEach(variation => {
    locationMap[variation.toLowerCase()] = canonical;
  });
});

/**
 * Normalize location name to handle common misspellings and variations
 * @param {string} location - The location string to normalize
 * @returns {string} - Normalized location name
 */
function normalizeLocation(location) {
  if (!location || typeof location !== 'string') {
    return '';
  }
  
  // Convert to lowercase and trim
  const normalized = location.toLowerCase().trim();
  
  // Remove extra spaces and special characters
  const cleaned = normalized.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  
  // Check if we have a mapping for this location
  if (locationMap[cleaned]) {
    return locationMap[cleaned];
  }
  
  // If no exact match, try partial matching
  const partialMatch = findPartialMatch(cleaned);
  if (partialMatch) {
    return partialMatch;
  }
  
  // If no partial match, try fuzzy matching
  const fuzzyMatch = findFuzzyMatch(cleaned, 60); // Lower threshold for creative misspellings
  if (fuzzyMatch) {
    console.log(`🎯 Fuzzy match found: "${cleaned}" → "${fuzzyMatch}"`);
    return fuzzyMatch;
  }
  
  // Return original if no match found
  return cleaned;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Distance between strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len2][len1];
}

/**
 * Calculate similarity percentage between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
function calculateSimilarity(str1, str2) {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;
}

/**
 * Find fuzzy match for location names using similarity
 * @param {string} location - The location string to match
 * @param {number} threshold - Minimum similarity threshold (default: 70)
 * @returns {string|null} - Matched canonical location or null
 */
function findFuzzyMatch(location, threshold = 70) {
  const locationKeys = Object.keys(locationMap);
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const key of locationKeys) {
    const similarity = calculateSimilarity(location, key);
    
    if (similarity >= threshold && similarity > bestSimilarity) {
      bestMatch = key;
      bestSimilarity = similarity;
    }
  }

  return bestMatch ? locationMap[bestMatch] : null;
}

/**
 * Find partial match for location names
 * @param {string} location - The location string to match
 * @returns {string|null} - Matched canonical location or null
 */
function findPartialMatch(location) {
  const locationKeys = Object.keys(locationMap);
  
  // Try to find a location that contains the input or vice versa
  for (const key of locationKeys) {
    if (key.includes(location) || location.includes(key)) {
      // Check if the match is significant (at least 3 characters)
      if (Math.min(key.length, location.length) >= 3) {
        return locationMap[key];
      }
    }
  }
  
  return null;
}

/**
 * Check if two locations match (considering variations)
 * @param {string} location1 - First location
 * @param {string} location2 - Second location
 * @returns {boolean} - True if locations match
 */
function locationsMatch(location1, location2) {
  const norm1 = normalizeLocation(location1);
  const norm2 = normalizeLocation(location2);
  
  return norm1 === norm2 && norm1 !== '';
}

/**
 * Get all variations for a given location
 * @param {string} location - The location to get variations for
 * @returns {Array} - Array of all variations
 */
function getLocationVariations(location) {
  const normalized = normalizeLocation(location);
  return locationVariations[normalized] || [normalized];
}

/**
 * Find the best matching location from a list
 * @param {string} targetLocation - The location to match
 * @param {Array} locationList - Array of locations to search in
 * @returns {string|null} - Best matching location or null
 */
function findBestMatch(targetLocation, locationList) {
  const normalizedTarget = normalizeLocation(targetLocation);
  
  for (const location of locationList) {
    if (locationsMatch(targetLocation, location)) {
      return location;
    }
  }
  
  return null;
}

module.exports = {
  normalizeLocation,
  locationsMatch,
  getLocationVariations,
  findBestMatch,
  findPartialMatch,
  findFuzzyMatch,
  calculateSimilarity,
  levenshteinDistance,
  locationMap,
  locationVariations
};
