// Google-like color palette with background and text color pairs
const GoogleColorPalette = [
  { bg: '#ffedd5', text: '#a14220', preview: '#fed7aa' }, // Orange - slightly darker orange
  { bg: '#dcfce7', text: '#327b4d', preview: '#bbf7d0' }, // Green - slightly darker green
  { bg: '#e0e7ff', text: '#6d6bc0', preview: '#c7d2fe' }, // Indigo - slightly darker indigo
  { bg: '#fef9c3', text: '#905d1f', preview: '#fef08a' }, // Yellow - slightly darker yellow
  { bg: '#fce7f3', text: '#a21caf', preview: '#f9a8d4' }, // Pink - slightly darker pink
  { bg: '#f0f9ff', text: '#0369a1', preview: '#dbeafe' }, // Sky Blue - slightly darker sky blue
  { bg: '#f7fee7', text: '#4d7c0f', preview: '#ecfccb' }, // Lime - slightly darker lime
  { bg: '#fdf4ff', text: '#9333ea', preview: '#f3e8ff' }, // Purple - slightly darker purple
  { bg: '#fef2f2', text: '#dc2626', preview: '#fecaca' }, // Red - slightly darker red
  { bg: '#f0fdf4', text: '#16a34a', preview: '#dcfce7' }, // Emerald - slightly darker emerald
  { bg: '#fffbeb', text: '#d97706', preview: '#fef3c7' }, // Amber - slightly darker amber
  { bg: '#f8fafc', text: '#475569', preview: '#e2e8f0' }, // Slate - slightly darker slate
];

// Legacy Tagcolors for backward compatibility (now using background colors from GoogleColorPalette)
const Tagcolors = GoogleColorPalette.map(color => color.bg);

// Function to get text color for a given background color
const getTextColorForBackground = (backgroundColor: string): string => {
  const colorPair = GoogleColorPalette.find(pair => pair.bg === backgroundColor);
  return colorPair ? colorPair.text : '#333333'; // Default dark text if color not found
};

// Function to get preview color for a given background color (for picker UI)
const getPreviewColorForBackground = (backgroundColor: string): string => {
  const colorPair = GoogleColorPalette.find(pair => pair.bg === backgroundColor);
  return colorPair ? colorPair.preview : '#475569'; // Default dark preview color if not found
};

export { Tagcolors, GoogleColorPalette, getTextColorForBackground, getPreviewColorForBackground };
