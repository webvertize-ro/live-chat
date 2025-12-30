export function formatDate(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString(undefined, options);
}
