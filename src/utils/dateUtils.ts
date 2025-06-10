import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (
  date: string | Date | undefined,
  formatStr: string = 'dd/MM/yyyy',
  defaultValue: string = 'N/A'
): string => {
  if (!date) return defaultValue;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
};