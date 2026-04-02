import { format, formatDistanceToNow } from 'date-fns';

export function formatILS(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const formatted = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  return showSymbol ? `\u20AA${formatted}` : formatted;
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '—';
  try { return format(new Date(date), formatStr); } catch { return '—'; }
}

export function formatRelativeTime(date) {
  if (!date) return '—';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return '—'; }
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatTerm(months) {
  if (!months) return '—';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} years`;
  return `${years}y ${remainingMonths}m`;
}
