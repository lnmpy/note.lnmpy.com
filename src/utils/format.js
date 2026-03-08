export function formatNumber(num) {
    if (num === null || num === undefined || num === '') {
        return { str: '', intPart: '', decPart: '' };
    }

    const n = Number(num);
    if (isNaN(n) || (typeof num === 'string' && num.trim() === '')) {
        return { str: num.toString(), intPart: num.toString(), decPart: '' };
    }

    // round to avoid precision issues
    let rounded = Math.round(n * 10000) / 10000;
    let str = rounded.toString();
    let parts = str.split('.');
    let intPart = parts[0];
    let decPart = parts.length > 1 ? '.' + parts[1] : '';

    // default comma mode: standard grouping by 3
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return { str: intPart + decPart, intPart, decPart };
}
