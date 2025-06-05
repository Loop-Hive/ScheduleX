// 23:34 -> 11:34 pm string converter

const convertToUTM = (time: string): string => {
  const [hour, minute] = time.split(':').map(t => Number(t));
  const isAM = hour < 12;
  let convertedHour = isAM ? hour : hour === 12 ? hour : hour - 12;
  if (hour === 0) {
    convertedHour = 12;
  }
  return `${convertedHour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;
};

const convertTo24Hrs = (time: string, isAM: boolean): string => {
  const [hour, minute] = time.split(':').map(t => Number(t));
  const convertedHour = isAM
    ? hour === 12
      ? '00'
      : hour
    : hour === 12
    ? hour
    : hour + 12;
  return `${convertedHour}:${minute}`;
};
const formatToHHMM = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const convertToStartSeconds = (time: string): number => {
  const [hour, minute] = time.split(':').map(t => Number(t));
  return hour * 3600 + minute * 60;
};

export {convertToUTM, convertTo24Hrs, formatToHHMM, convertToStartSeconds};
