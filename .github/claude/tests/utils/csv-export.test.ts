import { generateRegisterCSV } from '../../../src/utils/csv-export';
import { CardInterface } from '../../../src/types/cards';

describe('CSV Export Utility', () => {
  const mockCard: CardInterface = {
    id: 1,
    title: 'Mathematics',
    present: 10,
    total: 12,
    target_percentage: 80,
    tagColor: '#FF5733',
    days: {
      mon: [{ start: '09:00', end: '10:00', roomName: 'Room 101' }],
      tue: [{ start: '11:00', end: '12:00', roomName: 'Room 102' }],
      wed: [],
      thu: [],
      fri: [{ start: '14:00', end: '15:00', roomName: null }],
      sat: [],
      sun: []
    },
    cardRegister: 1,
    hasLimit: false,
    limitFreq: 0,
    limitType: 'daily'
  };

  const mockRegister = {
    name: 'Semester VI',
    cards: [mockCard]
  };

  describe('Single Register Export', () => {
    it('generates CSV for single register correctly', () => {
      const csv = generateRegisterCSV([mockRegister]);
      
      expect(csv).toContain('Semester VI');
      expect(csv).toContain('Day: Monday');
      expect(csv).toContain('Subject,Start Time,End Time,Room');
      expect(csv).toContain('Mathematics,09:00,10:00,Room 101');
    });

    it('handles empty rooms correctly', () => {
      const csv = generateRegisterCSV([mockRegister]);
      expect(csv).toContain('Mathematics,14:00,15:00,');
    });

    it('excludes days without classes', () => {
      const csv = generateRegisterCSV([mockRegister]);
      expect(csv).not.toContain('Day: Wednesday');
      expect(csv).not.toContain('Day: Thursday');
    });
  });

  describe('Multiple Register Export', () => {
    const mockCard2: CardInterface = {
      ...mockCard,
      id: 2,
      title: 'Physics',
      days: {
        ...mockCard.days,
        mon: [{ start: '10:00', end: '11:00', roomName: 'Lab 1' }]
      }
    };

    const mockRegister2 = {
      name: 'Semester V',
      cards: [mockCard2]
    };

    it('generates CSV for multiple registers', () => {
      const csv = generateRegisterCSV([mockRegister, mockRegister2]);
      
      expect(csv).toContain(',Day: Monday');
      expect(csv).toContain('Semester VI,Subject,Start Time,End Time,Room');
      expect(csv).toContain('Semester V,Subject,Start Time,End Time,Room');
      expect(csv).toContain(',Mathematics,09:00,10:00,Room 101');
      expect(csv).toContain(',Physics,10:00,11:00,Lab 1');
    });
  });

  describe('Edge Cases', () => {
    it('handles register with no cards', () => {
      const emptyRegister = { name: 'Empty Register', cards: [] };
      const csv = generateRegisterCSV([emptyRegister]);
      
      expect(csv).not.toContain('Empty Register');
    });

    it('handles card with no time slots', () => {
      const cardWithNoSlots: CardInterface = {
        ...mockCard,
        days: {
          mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
        }
      };
      
      const registerWithEmptyCard = {
        name: 'Test Register',
        cards: [cardWithNoSlots]
      };
      
      const csv = generateRegisterCSV([registerWithEmptyCard]);
      expect(csv).toBe('');
    });

    it('handles multiple slots per day', () => {
      const cardWithMultipleSlots: CardInterface = {
        ...mockCard,
        days: {
          ...mockCard.days,
          mon: [
            { start: '09:00', end: '10:00', roomName: 'Room 101' },
            { start: '11:00', end: '12:00', roomName: 'Room 102' }
          ]
        }
      };
      
      const register = { name: 'Test', cards: [cardWithMultipleSlots] };
      const csv = generateRegisterCSV([register]);
      
      expect(csv).toContain('Mathematics,09:00,10:00,Room 101');
      expect(csv).toContain('Mathematics,11:00,12:00,Room 102');
    });
  });
});