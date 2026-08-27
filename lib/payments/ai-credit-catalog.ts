export const aiCreditPackages = [
  { id: "ai-credits-500-inr", credits: 500, amount: 99, currency: "INR", active: true },
  { id: "ai-credits-1500-inr", credits: 1500, amount: 249, currency: "INR", active: true },
  { id: "ai-credits-5000-inr", credits: 5000, amount: 699, currency: "INR", active: true }
] as const;

export function getAICreditPackage(packageId: string) {
  return aiCreditPackages.find((item) => item.id === packageId && item.active) ?? null;
}
