const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const equalSizes = (count) => Array(count).fill(100 / count);
export { clamp, equalSizes };
