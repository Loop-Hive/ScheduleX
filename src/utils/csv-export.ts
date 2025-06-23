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
  } else {
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
  }

  return csv;
}
