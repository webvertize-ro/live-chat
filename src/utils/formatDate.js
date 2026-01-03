export function formatDate(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  return date.toLocaleDateString('ro-Ro', options);
}
