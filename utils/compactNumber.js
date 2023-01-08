export default function compactNumber(number) {
  return new Intl.NumberFormat('en-UK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}
