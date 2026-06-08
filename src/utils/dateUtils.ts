export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export const calculateAge = (dob: Date, targetDate: Date = new Date()): AgeResult => {
  let years = targetDate.getFullYear() - dob.getFullYear();
  let months = targetDate.getMonth() - dob.getMonth();
  let days = targetDate.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = targetDate.getTime() - dob.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
};

export const calculateAgeDifference = (date1: Date, date2: Date): AgeResult => {
  const [earlier, later] = date1 < date2 ? [date1, date2] : [date2, date1];
  return calculateAge(earlier, later);
};

export const getNextBirthdayCountdown = (dob: Date) => {
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffMs = nextBirthday.getTime() - today.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return {
    days,
    weekday: nextBirthday.toLocaleDateString('en-US', { weekday: 'long' }),
    ageOnNextBirthday: nextBirthday.getFullYear() - dob.getFullYear(),
  };
};
