/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UidRarity, UidRecord } from '../types';

// Helper to check frequencies of digits in a string
export function analyzeRarity(uid: string): UidRarity {
  const counts: Record<string, number> = {};
  for (const char of uid) {
    counts[char] = (counts[char] || 0) + 1;
  }
  
  const maxFreq = Math.max(...Object.values(counts));
  
  if (maxFreq >= 6) return UidRarity.MYTHIC;
  if (maxFreq === 5) return UidRarity.LEGENDARY;
  if (maxFreq === 4) return UidRarity.EPIC;
  if (maxFreq === 3) return UidRarity.RARE;
  
  // For maximum frequency 2, check if any contiguous duplicates exist
  let hasContiguous = false;
  for (let i = 0; i < uid.length - 1; i++) {
    if (uid[i] === uid[i + 1]) {
      hasContiguous = true;
      break;
    }
  }
  
  return hasContiguous ? UidRarity.UNCOMMON : UidRarity.COMMON;
}

// Generate an authentic UID matching the target rarity of 12 digits, starting with 160
export function craftUidOfRarity(rarity: UidRarity): string {
  const prefix = "160"; // Required prefix of 3 digits
  const suffixLength = 9; // Remaining digits needed

  const getRandomDigit = () => Math.floor(Math.random() * 10).toString();

  if (rarity === UidRarity.MYTHIC) {
    // 6+ repeating digits. Let's make 6 or 7 repeating digits.
    const repeatDigit = getRandomDigit();
    const count = 6 + Math.floor(Math.random() * 3); // 6, 7 or 8 digits
    let digits = Array(suffixLength).fill('');
    
    // Fill the repeat count
    let placed = 0;
    while (placed < count - 1) { // -1 because the repeat digit might already exist or we need to place it in suffix
      const idx = Math.floor(Math.random() * suffixLength);
      if (digits[idx] === '') {
        digits[idx] = repeatDigit;
        placed++;
      }
    }
    
    // Fill the rest with random digits
    for (let i = 0; i < suffixLength; i++) {
      if (digits[i] === '') {
        digits[i] = getRandomDigit();
      }
    }
    return prefix + digits.join('');
  }

  if (rarity === UidRarity.LEGENDARY) {
    // Exactly 5 repeating digits in total
    const repeatDigit = getRandomDigit();
    let digits = Array(suffixLength).fill('');
    
    // We need 5 total. One might be in "160" (e.g. if repeating 1, 6 or 0). 
    // Let's assume we place 4 or 5 repeating digits in the suffix.
    const neededInSuffix = prefix.includes(repeatDigit) ? 4 : 5;
    
    let placed = 0;
    while (placed < neededInSuffix) {
      const idx = Math.floor(Math.random() * suffixLength);
      if (digits[idx] === '') {
        digits[idx] = repeatDigit;
        placed++;
      }
    }
    
    // Fill rest with other digits, ensuring we don't accidentally create more repeats
    for (let i = 0; i < suffixLength; i++) {
      if (digits[i] === '') {
        let attempts = 0;
        let d = getRandomDigit();
        while ((d === repeatDigit) && attempts < 10) {
          d = getRandomDigit();
          attempts++;
        }
        digits[i] = d;
      }
    }
    return prefix + digits.join('');
  }

  if (rarity === UidRarity.EPIC) {
    // Exactly 4 repeating digits in total
    const repeatDigit = getRandomDigit();
    let digits = Array(suffixLength).fill('');
    
    const neededInSuffix = prefix.includes(repeatDigit) ? 3 : 4;
    
    let placed = 0;
    while (placed < neededInSuffix) {
      const idx = Math.floor(Math.random() * suffixLength);
      if (digits[idx] === '') {
        digits[idx] = repeatDigit;
        placed++;
      }
    }
    
    for (let i = 0; i < suffixLength; i++) {
      if (digits[i] === '') {
        let attempts = 0;
        let d = getRandomDigit();
        while ((d === repeatDigit) && attempts < 10) {
          d = getRandomDigit();
          attempts++;
        }
        digits[i] = d;
      }
    }
    return prefix + digits.join('');
  }

  if (rarity === UidRarity.RARE) {
    // Exactly 3 repeating digits in total
    const repeatDigit = getRandomDigit();
    let digits = Array(suffixLength).fill('');
    
    const neededInSuffix = prefix.includes(repeatDigit) ? 2 : 3;
    
    let placed = 0;
    while (placed < neededInSuffix) {
      const idx = Math.floor(Math.random() * suffixLength);
      if (digits[idx] === '') {
        digits[idx] = repeatDigit;
        placed++;
      }
    }
    
    for (let i = 0; i < suffixLength; i++) {
      if (digits[i] === '') {
        let attempts = 0;
        let d = getRandomDigit();
        while ((d === repeatDigit) && attempts < 10) {
          d = getRandomDigit();
          attempts++;
        }
        digits[i] = d;
      }
    }
    return prefix + digits.join('');
  }

  if (rarity === UidRarity.UNCOMMON) {
    // Maximum frequency 2, featuring adjacent duplicate (e.g. '22')
    let found = false;
    let attempts = 0;
    while (!found && attempts < 100) {
      attempts++;
      let suffix = '';
      for (let i = 0; i < suffixLength; i++) {
        suffix += getRandomDigit();
      }
      
      const combined = prefix + suffix;
      // Inject contiguous pair
      const insertIdx = 3 + Math.floor(Math.random() * 7); // insert in suffix
      const dupDigit = combined[insertIdx];
      const modifiedSuffix = suffix.slice(0, insertIdx - 3) + dupDigit + suffix.slice(insertIdx - 3 + 1);
      const testUid = prefix + modifiedSuffix;
      
      if (analyzeRarity(testUid) === UidRarity.UNCOMMON) {
        return testUid;
      }
    }
  }

  // DEFAULT/COMMON: Max freq 2, no contiguous identical numbers
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    let suffix = '';
    for (let i = 0; i < suffixLength; i++) {
      suffix += getRandomDigit();
    }
    const testUid = prefix + suffix;
    
    // Verify it is Common (no contiguous repeats, max freq <= 2)
    if (analyzeRarity(testUid) === UidRarity.COMMON) {
      return testUid;
    }
  }
  
  // Fallback simple clean
  return "160" + "123456789".split('').sort(() => Math.random() - 0.5).join('');
}

// Full mock result generation
const usernamePrefixes = [
  'kingwar', 'cyber', 'anwar', 'ninja', 'shadow', 'phantom', 'hacker', 
  'redglow', 'viper', 'nexus', 'delta', 'glitch', 'apex', 'spectre', 'zero'
];

export function generateSMRUid(generatedBy: string, forceRarity?: UidRarity): UidRecord {
  // 1. Roll rarity
  let rarity = UidRarity.COMMON;
  if (forceRarity) {
    rarity = forceRarity;
  } else {
    const roll = Math.random();
    if (roll < 0.0003) { // 1 : 3000
      rarity = UidRarity.MYTHIC;
    } else if (roll < 0.002) { // 1 : 500
      rarity = UidRarity.LEGENDARY;
    } else if (roll < 0.012) { // 1 : 100
      rarity = UidRarity.EPIC;
    } else if (roll < 0.12) { // Sering
      rarity = UidRarity.RARE;
    } else if (roll < 0.50) { // Sangat sering (~38%)
      rarity = UidRarity.UNCOMMON;
    } else {
      rarity = UidRarity.COMMON;
    }
  }

  // 2. Craft UID of rolled rarity
  const uid = craftUidOfRarity(rarity);

  // 3. Generate credentials matching the user experience
  const prefix = usernamePrefixes[Math.floor(Math.random() * usernamePrefixes.length)];
  const numSuffix = Math.floor(100 + Math.random() * 899);
  const email = `${prefix}${numSuffix}@gmail.com`;
  const password = `${prefix}${numSuffix}`;

  return {
    id: `rec_${Math.random().toString(36).substr(2, 9)}`,
    uid,
    email,
    password,
    rarity,
    generatedBy,
    timestamp: new Date().toISOString()
  };
}

// Generate realistic starting history entries (seeding)
export function generateSeedHistory(count: number = 20): UidRecord[] {
  const result: UidRecord[] = [];
  for (let i = 0; i < count; i++) {
    // Generate some interesting ones but mostly common/uncommon
    const record = generateSMRUid('system_seeder');
    // adjust timestamps to look like they happened over the last few days
    const date = new Date();
    date.setHours(date.getHours() - i * 3 - Math.floor(Math.random() * 5));
    record.timestamp = date.toISOString();
    result.push(record);
  }
  return result;
}
