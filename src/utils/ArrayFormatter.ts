const formatTimetableToMarkdown = (timetable: string[][]): string => {
  if (!timetable || timetable.length === 0) {
    return '';
  }

  const headers = timetable[1] || [];
  const separator = headers.map(() => '---').join('|');
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `|${separator}|`;

  const dataRows = timetable
    .slice(2)
    .map(row => {
      const cleanedRow = row.map(cell => (cell || '').replace(/\n/g, '<br>'));
      return `| ${cleanedRow.join(' | ')} |`;
    })
    .join('\n');

  return `Timetable:\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
};

export {formatTimetableToMarkdown};
