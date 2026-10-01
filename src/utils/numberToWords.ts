/**
 * Converts a numeric amount to Pakistani Rupee currency words
 * e.g. 5200 -> "Five Thousand Two Hundred Rupees Only"
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  if (isNaN(num)) return '';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n: number): string {
    let out = '';
    if (n >= 100) {
      out += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      out += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    } else if (n > 0) {
      out += a[n] + ' ';
    }
    return out.trim();
  }

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);

  let result = '';
  if (crores > 0) {
    result += convertGroup(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    result += convertGroup(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    result += convertGroup(thousands) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertGroup(remainder) + ' ';
  }

  return (result.trim() + ' Rupees Only');
}
