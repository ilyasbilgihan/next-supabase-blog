export default function readableDate(date) {
  return new Date(date).toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
