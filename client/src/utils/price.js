export const VAT_RATE = 0.15;

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const splitVat = (gross) => {
  const base = round2(gross / (1 + VAT_RATE));
  const tax = round2(gross - base);
  return { base, tax };
};