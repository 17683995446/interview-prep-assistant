export function highlightText(text: string, searchQuery?: string) {
  if (!searchQuery) return text;
  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
  return parts;
}
