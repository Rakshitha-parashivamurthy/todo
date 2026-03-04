import { isToday, isTomorrow, isPast, isFuture, format, isValid } from 'date-fns';

export const getDateLabel = (dateStr: string | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (!isValid(date)) return null;
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
};

export const isOverdue = (dateStr: string | null) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (!isValid(date)) return false;
  
  return isPast(date) && !isToday(date);
};

export const isUpcoming = (dateStr: string | null) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (!isValid(date)) return false;

  return isFuture(date) || isToday(date);
};