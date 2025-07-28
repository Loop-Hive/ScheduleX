import { 
  convertToUTM, 
  convertTo24Hrs, 
  formatToHHMM, 
  convertToStartSeconds 
} from '../../../src/utils/functions';

describe('Time Utility Functions', () => {
  describe('convertToUTM', () => {
    it('converts 24-hour to 12-hour AM format', () => {
      expect(convertToUTM('09:30')).toBe('09:30 AM');
      expect(convertToUTM('00:00')).toBe('12:00 AM');
      expect(convertToUTM('11:59')).toBe('11:59 AM');
    });

    it('converts 24-hour to 12-hour PM format', () => {
      expect(convertToUTM('13:45')).toBe('01:45 PM');
      expect(convertToUTM('12:00')).toBe('12:00 PM');
      expect(convertToUTM('23:59')).toBe('11:59 PM');
    });

    it('handles edge cases correctly', () => {
      expect(convertToUTM('00:30')).toBe('12:30 AM');
      expect(convertToUTM('12:30')).toBe('12:30 PM');
    });
  });

  describe('convertTo24Hrs', () => {
    it('converts AM times correctly', () => {
      expect(convertTo24Hrs('09:30', true)).toBe('9:30');
      expect(convertTo24Hrs('12:00', true)).toBe('00:00');
      expect(convertTo24Hrs('01:15', true)).toBe('1:15');
    });

    it('converts PM times correctly', () => {
      expect(convertTo24Hrs('01:30', false)).toBe('13:30');
      expect(convertTo24Hrs('12:00', false)).toBe('12:00');
      expect(convertTo24Hrs('11:45', false)).toBe('23:45');
    });

    it('handles noon and midnight correctly', () => {
      expect(convertTo24Hrs('12:00', true)).toBe('00:00'); // 12 AM = 00:00
      expect(convertTo24Hrs('12:00', false)).toBe('12:00'); // 12 PM = 12:00
    });
  });

  describe('formatToHHMM', () => {
    it('formats date to HH:MM correctly', () => {
      const date = new Date('2024-01-15T09:05:30');
      expect(formatToHHMM(date.toString())).toBe('09:05');
    });

    it('handles single digit hours and minutes', () => {
      const date = new Date('2024-01-15T03:07:30');
      expect(formatToHHMM(date.toString())).toBe('03:07');
    });

    it('handles double digit hours and minutes', () => {
      const date = new Date('2024-01-15T23:59:30');
      expect(formatToHHMM(date.toString())).toBe('23:59');
    });
  });

  describe('convertToStartSeconds', () => {
    it('converts time to seconds correctly', () => {
      expect(convertToStartSeconds('00:00')).toBe(0);
      expect(convertToStartSeconds('01:00')).toBe(3600);
      expect(convertToStartSeconds('00:30')).toBe(1800);
      expect(convertToStartSeconds('23:59')).toBe(86340);
    });

    it('handles complex time calculations', () => {
      expect(convertToStartSeconds('12:30')).toBe(45000); // 12*3600 + 30*60
      expect(convertToStartSeconds('09:15')).toBe(33300); // 9*3600 + 15*60
    });

    it('handles edge cases', () => {
      expect(convertToStartSeconds('24:00')).toBe(86400); // 24 hours
      expect(convertToStartSeconds('00:01')).toBe(60); // 1 minute
    });
  });
});