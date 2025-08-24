export const themes = [
  { name: 'light', label: 'Light', level: 1 },
  { name: 'dark', label: 'Dark', level: 1 },
  { name: 'haru', label: 'Spring', level: 5 },
  { name: 'natsu', label: 'Summer', level: 5 },
  { name: 'aki', label: 'Autumn', level: 5 },
  { name: 'fuyu', label: 'Winter', level: 5 },
];

export const getUnlockedThemes = (level) => {
  return themes.filter((theme) => theme.level <= level);
};
