import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import { CardInterface, Days, Slots } from '../types/cards';

export interface ImportResult {
  success: boolean;
  cards: Partial<CardInterface>[];
  errors: string[];
}

export interface ParsedCSVRow {
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
  day?: string;
}

export class CSVImportUtility {
  private static dayMapping: { [key: string]: keyof Days } = {
    'sunday': 'sun',
    'monday': 'mon',
    'tuesday': 'tue',
    'wednesday': 'wed',
    'thursday': 'thu',
    'friday': 'fri',
    'saturday': 'sat',
  };

  private static parseTimeSlot(startTime: string, endTime: string, room: string): Slots | null {
    // Handle "Not Scheduled" case
    if (startTime === 'Not Scheduled' || endTime === 'Not Scheduled') {
      return null;
    }

    // Clean and trim the time values, handle potential formatting issues
    let cleanStartTime = startTime.trim();
    let cleanEndTime = endTime.trim();
    
    // Fix common time format issues (e.g., "10:0" -> "10:00")
    cleanStartTime = this.normalizeTimeFormat(cleanStartTime);
    cleanEndTime = this.normalizeTimeFormat(cleanEndTime);
    
    console.log(`Parsing time slot: "${cleanStartTime}" - "${cleanEndTime}" (original: "${startTime}" - "${endTime}")`);

    // Validate time format (HH:MM or H:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(cleanStartTime) || !timeRegex.test(cleanEndTime)) {
      console.log(`Time format validation failed for: "${cleanStartTime}" - "${cleanEndTime}"`);
      return null;
    }

    return {
      start: cleanStartTime,
      end: cleanEndTime,
      roomName: room === 'Not Assigned' || room === '' ? null : room
    };
  }

  // Normalize time format to ensure proper HH:MM format
  private static normalizeTimeFormat(timeStr: string): string {
    // Remove any non-digit and non-colon characters
    const cleaned = timeStr.replace(/[^\d:]/g, '');
    
    // Handle cases like "10:0" -> "10:00"
    const parts = cleaned.split(':');
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padEnd(2, '0').substring(0, 2);
      return `${hours}:${minutes}`;
    }
    
    return cleaned;
  }

  private static initializeEmptyDays(): Days {
    return {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: []
    };
  }

  private static parseCSVContent(csvContent: string): ImportResult {
    const errors: string[] = [];
    const cardsMap = new Map<string, Partial<CardInterface>>();
    let currentDay: keyof Days | null = null;
    let isUnscheduledSection = false;

    console.log('Starting CSV import process...');

    // Split into lines and process
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`Processing ${lines.length} lines`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip register name lines (first line without commas)
      if (i === 0 && !line.includes(',')) {
        console.log('Skipping register name line');
        continue;
      }

      // Check for day headers
      const dayMatch = line.match(/Day:\s*(\w+)/i);
      if (dayMatch) {
        const dayName = dayMatch[1].toLowerCase();
        currentDay = this.dayMapping[dayName] || null;
        console.log(`Found day header: ${dayName} -> ${currentDay}`);
        if (!currentDay) {
          errors.push(`Unknown day: ${dayMatch[1]}`);
        }
        continue;
      }

      // Check for "Subjects Without Time Slots" section
      if (line.toLowerCase().includes('subjects without time slots')) {
        isUnscheduledSection = true;
        currentDay = null;
        console.log('Entering unscheduled section');
        continue;
      }

      // Skip header lines
      if (line.toLowerCase().includes('subject,start time,end time,room') || 
          (line.toLowerCase().includes('subject') && line.toLowerCase().includes('start time'))) {
        console.log('Skipping header line');
        continue;
      }

      // Parse CSV row using a more robust approach
      const columns = this.parseCSVLine(line);
      
      // Handle both single register and multiple register formats
      let subject: string, startTime: string, endTime: string, room: string;
      
      if (columns.length >= 4) {
        // Check if this is a multiple register format (starts with register name)
        if (columns[0] && !columns[0].toLowerCase().includes('day:') && 
            columns[0] !== 'Subject' && currentDay === null && !isUnscheduledSection) {
          continue;
        }

        // Single register format or multiple register data line
        if (columns[0] === '' && columns.length >= 5) {
          // Multiple register format: ,Subject,Start,End,Room
          [, subject, startTime, endTime, room] = columns;
        } else {
          // Single register format: Subject,Start,End,Room
          [subject, startTime, endTime, room] = columns;
        }

        console.log(`Raw parsed data: Subject="${subject}", Start="${startTime}", End="${endTime}", Room="${room}"`);

        if (!subject || subject === 'Subject') continue;

        // Get or create card
        if (!cardsMap.has(subject)) {
          console.log(`Creating new card for subject: ${subject}`);
          cardsMap.set(subject, {
            title: subject,
            days: this.initializeEmptyDays(),
            target_percentage: 75,
            tagColor: '#3b82f6',
            present: 0,
            total: 0,
            markedAt: [],
            hasLimit: false,
            limit: 0,
            limitType: 'with-absent'
          });
        }

        const card = cardsMap.get(subject)!;

        if (isUnscheduledSection) {
          // For unscheduled subjects, we just add them without time slots
          continue;
        }

        if (currentDay) {
          // Parse time slot
          const slot = this.parseTimeSlot(startTime, endTime, room);
          if (slot) {
            card.days![currentDay].push(slot);
            console.log(`Added time slot to ${subject} on ${currentDay}: ${slot.start}-${slot.end}`);
          } else if (startTime !== 'Not Scheduled') {
            const error = `Invalid time format for ${subject}: ${startTime}-${endTime}`;
            errors.push(error);
            console.log('Error:', error);
          }
        }
      }
    }

    // Convert map to array and assign IDs
    const cards = Array.from(cardsMap.values()).map((card, index) => ({
      ...card,
      id: index + 1
    }));

    console.log(`CSV Import completed: ${cards.length} cards created`);
    if (errors.length > 0) {
      console.log('Import errors:', errors);
    }

    return {
      success: errors.length === 0,
      cards,
      errors
    };
  }

  // More robust CSV line parsing to handle quoted values and preserve formatting
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  static async importFromFile(fileUri: string): Promise<ImportResult> {
    try {
      // Read file content
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      return this.parseCSVContent(fileContent);
    } catch (error) {
      return {
        success: false,
        cards: [],
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  static async importFromCSVString(csvContent: string): Promise<ImportResult> {
    return this.parseCSVContent(csvContent);
  }

  static validateImportData(cards: Partial<CardInterface>[]): string[] {
    const errors: string[] = [];
    const usedTitles = new Set<string>();

    cards.forEach((card, index) => {
      // Check for duplicate titles
      if (card.title) {
        if (usedTitles.has(card.title)) {
          errors.push(`Duplicate subject found: ${card.title}`);
        } else {
          usedTitles.add(card.title);
        }
      }

      // Validate time slots don't overlap within same day
      if (card.days) {
        Object.entries(card.days).forEach(([dayKey, slots]) => {
          if (slots && slots.length > 1) {
            // Sort slots by start time
            const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));
            
            for (let i = 0; i < sortedSlots.length - 1; i++) {
              const current = sortedSlots[i];
              const next = sortedSlots[i + 1];
              
              if (current.end > next.start) {
                errors.push(`Overlapping time slots for ${card.title} on ${dayKey}: ${current.start}-${current.end} and ${next.start}-${next.end}`);
              }
            }
          }
        });
      }
    });

    return errors;
  }

  // Convert partial cards to full CardInterface for store integration
  static prepareCardsForStore(cards: Partial<CardInterface>[], existingCards: CardInterface[]): CardInterface[] {
    const startId = existingCards.length > 0 
      ? Math.max(...existingCards.map(c => c.id)) + 1 
      : 0;

    return cards.map((card, index) => ({
      id: startId + index,
      title: card.title || `Untitled Subject ${index + 1}`,
      present: card.present || 0,
      total: card.total || 0,
      target_percentage: card.target_percentage || 75,
      tagColor: card.tagColor || '#3b82f6',
      days: card.days || {
        sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []
      },
      markedAt: card.markedAt || [],
      hasLimit: card.hasLimit || false,
      limit: card.limit || 0,
      limitType: card.limitType || 'with-absent',
    }));
  }
}

// Convenience function for direct use
export const importScheduleFromCSV = async (fileUri: string): Promise<ImportResult> => {
  return CSVImportUtility.importFromFile(fileUri);
};

// Function to handle complete import process with user interaction from CSV content
export const importAndAddToRegisterFromContent = async (
  csvContent: string,
  registerId: number, 
  existingCards: CardInterface[],
  addMultipleCards: (registerId: number, cards: CardInterface[]) => void
): Promise<void> => {
  try {
    const importResult = await CSVImportUtility.importFromCSVString(csvContent);
    
    if (!importResult.success) {
      Alert.alert(
        'Import Failed', 
        `Could not import CSV:\n${importResult.errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate imported data
    const validationErrors = CSVImportUtility.validateImportData(importResult.cards);
    if (validationErrors.length > 0) {
      Alert.alert(
        'Import Warning',
        `Some issues were found:\n${validationErrors.join('\n')}\n\nDo you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              const cards = CSVImportUtility.prepareCardsForStore(importResult.cards, existingCards);
              addMultipleCards(registerId, cards);
              Alert.alert('Success', `Imported ${cards.length} subjects from CSV`);
            }
          }
        ]
      );
      return;
    }

    // Convert and add cards
    const cards = CSVImportUtility.prepareCardsForStore(importResult.cards, existingCards);
    
    if (cards.length === 0) {
      Alert.alert('Import Failed', 'No valid subjects found in CSV file');
      return;
    }

    Alert.alert(
      'Import Schedule',
      `Found ${cards.length} subjects in CSV. Do you want to add them to the current register?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: () => {
            addMultipleCards(registerId, cards);
            Alert.alert('Success', `Imported ${cards.length} subjects successfully!`);
          }
        }
      ]
    );

  } catch (error) {
    Alert.alert(
      'Import Error', 
      `Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
