export function formatProductName(value: string): string {
  const normalized = value.trim();
  const firstLetterIndex = normalized.search(/[A-Za-zÀ-ÖØ-öø-ÿ]/);

  if (firstLetterIndex < 0) return normalized;

  return (
    normalized.slice(0, firstLetterIndex) +
    normalized[firstLetterIndex].toLocaleUpperCase("pt-PT") +
    normalized.slice(firstLetterIndex + 1)
  );
}
