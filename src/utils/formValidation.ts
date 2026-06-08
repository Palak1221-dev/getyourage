export const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  );
};

export const validateBirthDate = (year: number, month: number, day: number): string | null => {
  if (!year || !month || !day) return "Please enter a complete date.";
  
  const dob = new Date(year, month - 1, day);
  const now = new Date();
  const minYear = now.getFullYear() - 130;
  
  if (year < minYear) return `Please enter a year after ${minYear}.`;
  if (dob > now) return "Birth date cannot be in the future.";
  
  if (!isValidDate(year, month, day)) return "Please enter a valid date.";
  
  return null;
};
