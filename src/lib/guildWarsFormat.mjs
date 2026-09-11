/** @param {number} value */
export const number = value => value.toLocaleString('en-US');
/** @param {number | null} value */
export const percent = value => value == null ? '—' : `${(value * 100).toFixed(1)}%`;
/** @param {number} n @param {number} d */
export const ratio = (n, d) => `${number(n)} / ${number(d)}`;
