const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const equalSizes = (count: number) => Array<number>(count).fill(100 / count);

export { clamp, equalSizes };
