export const themes = [
  { name: 'light', label: 'Light', level: 1 },
  { name: 'dark', label: 'Dark', level: 1 },
  { name: 'haru', label: 'Spring', level: 5 },
  { name: 'natsu', label: 'Summer', level: 10 },
  { name: 'aki', label: 'Autumn', level: 15 },
  { name: 'fuyu', label: 'Winter', level: 20 },
];

export const getUnlockedThemes = (level) => {
  return themes.filter((theme) => theme.level <= level);
};
