export class PricingService {
  calculateFinalPrice(basePrice: number, vatRate: number = 15): number {
    const total = Number(basePrice) * (1 + (Number(vatRate) / 100));
    return parseFloat(total.toFixed(2));
  }
}
