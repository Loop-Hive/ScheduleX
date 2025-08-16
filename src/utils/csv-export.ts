// Utility to generate CSV based on number of registers selected
import { CardInterface, Days } from '../types/cards';

export function generateRegisterCSV(registers: { name: string, cards: CardInterface[] }[]): string {
  const dayKeys: (keyof Days)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let csv = '';

  const isSingleRegister = registers.length === 1;

  if (isSingleRegister) {
    const register = registers[0];
    csv += `${register.name}\n\n`;

    // First, add all subjects with their scheduled time slots
    dayKeys.forEach((dayKey, i) => {
      const subjectRows: string[] = [];
      register.cards.forEach(card => {
        const slots = card.days[dayKey] || [];
        slots.forEach(slot => {
          subjectRows.push(`${card.title},${slot.start},${slot.end},${slot.roomName || ''}`);
        });
      });

      if (subjectRows.length > 0) {
        csv += `Day: ${dayNames[i]}\n`;
        csv += `Subject,Start Time,End Time,Room\n`;
        csv += subjectRows.join('\n') + '\n\n';
      }
    });

    // Add a section for subjects without any time slots
    const subjectsWithoutSlots = register.cards.filter(card => {
      return dayKeys.every(dayKey => {
        const slots = card.days[dayKey] || [];
        return slots.length === 0;
      });
    });

    if (subjectsWithoutSlots.length > 0) {
      csv += `Subjects Without Time Slots\n`;
      csv += `Subject,Start Time,End Time,Room\n`;
      subjectsWithoutSlots.forEach(card => {
        csv += `${card.title},Not Scheduled,Not Scheduled,Not Assigned\n`;
      });
      csv += '\n';
    }
  } else {
    // Handle multiple registers
    dayKeys.forEach((dayKey, i) => {
      let daySection = `,Day: ${dayNames[i]}\n`;

      registers.forEach(register => {
        const subjectRows: string[] = [];
        register.cards.forEach(card => {
          const slots = card.days[dayKey] || [];
          slots.forEach(slot => {
            subjectRows.push(`,${card.title},${slot.start},${slot.end},${slot.roomName || ''}`);
          });
        });

        if (subjectRows.length > 0) {
          daySection += `${register.name},Subject,Start Time,End Time,Room\n`;
          daySection += subjectRows.join('\n') + '\n\n';
        }
      });

      if (daySection.trim()) {
        csv += daySection;
      }
    });

    // Add sections for subjects without time slots for each register
    registers.forEach(register => {
      const subjectsWithoutSlots = register.cards.filter(card => {
        return dayKeys.every(dayKey => {
          const slots = card.days[dayKey] || [];
          return slots.length === 0;
        });
      });

      if (subjectsWithoutSlots.length > 0) {
        csv += `,${register.name} - Subjects Without Time Slots\n`;
        csv += `,Subject,Start Time,End Time,Room\n`;
        subjectsWithoutSlots.forEach(card => {
          csv += `,${card.title},Not Scheduled,Not Scheduled,Not Assigned\n`;
        });
        csv += '\n';
      }
    });
  }

  return csv;
}
