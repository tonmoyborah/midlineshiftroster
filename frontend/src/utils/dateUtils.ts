import { format, addDays, subDays, startOfDay, isToday } from "date-fns";

export const formatDate = (date: Date): string => {
  return format(date, "EEE, MMM d, yyyy");
};

export const formatDateShort = (date: Date): string => {
  return format(date, "MMM d, yyyy");
};

export const formatDateISO = (date: Date): string => {
  return format(startOfDay(date), "yyyy-MM-dd");
};

export const getNextDay = (date: Date): Date => {
  return addDays(date, 1);
};

export const getPreviousDay = (date: Date): Date => {
  return subDays(date, 1);
};

export const getDayOfWeek = (date: Date): number => {
  return date.getDay(); // 0=Sunday, 6=Saturday
};

export const isTodayDate = (date: Date): boolean => {
  return isToday(date);
};
