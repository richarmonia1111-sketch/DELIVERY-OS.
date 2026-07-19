import type {
  Tariff, ServiceTypeConfig, TariffZoneRate, TariffEstablishmentRate,
  TariffTimeModifier, TariffBusinessRate, TariffPromotion,
  TariffBreakdown, TariffBreakdownItem, TariffSimulatorInput,
} from '../types';

interface TariffData {
  tariffs: Tariff[];
  serviceTypes: ServiceTypeConfig[];
  zoneRates: TariffZoneRate[];
  establishmentRates: TariffEstablishmentRate[];
  timeModifiers: TariffTimeModifier[];
  businessRates: TariffBusinessRate[];
  promotions: TariffPromotion[];
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}

export function calculateTariff(input: TariffSimulatorInput, data: TariffData): TariffBreakdown {
  const items: TariffBreakdownItem[] = [];
  let total = 0;

  // 1. Business client — use tiered business rates if applicable
  if (input.isBusinessClient && input.businessDeliveryCount > 0) {
    const businessRate = data.businessRates
      .filter((r) => r.isActive && r.deliveryCount === input.businessDeliveryCount)
      .sort((a, b) => b.deliveryCount - a.deliveryCount)[0];
    if (businessRate) {
      total += businessRate.price;
      items.push({ label: `Negocio afiliado: ${businessRate.deliveryCount} entrega(s)`, amount: businessRate.price, type: 'business' });
    } else {
      const fallback = data.businessRates.filter((r) => r.isActive).sort((a, b) => a.deliveryCount - b.deliveryCount)[0];
      if (fallback) {
        total += fallback.price;
        items.push({ label: `Negocio afiliado: ${fallback.deliveryCount} entrega(s)`, amount: fallback.price, type: 'business' });
      }
    }
  } else {
    // 2. Base price from service type config
    const serviceType = data.serviceTypes.find(
      (s) => s.isActive && (input.serviceTypeConfigId ? s.id === input.serviceTypeConfigId : true),
    );
    const basePrice = serviceType?.basePrice ?? 35;
    total += basePrice;
    items.push({ label: serviceType?.name ?? 'Entrega base', amount: basePrice, type: 'base' });

    // 3. Zone rate override
    if (input.zoneId) {
      const activeTariff = data.tariffs.find((t) => t.isActive);
      if (activeTariff) {
        const zoneRate = data.zoneRates.find(
          (r) => r.tariffId === activeTariff.id && r.zoneId === input.zoneId,
        );
        if (zoneRate) {
          total = zoneRate.price;
          items.push({ label: 'Tarifa por zona', amount: zoneRate.price, type: 'zone' });
        }
      }
    }

    // 4. Establishment count adjustment
    if (input.establishmentCount > 1) {
      const activeTariff = data.tariffs.find((t) => t.isActive);
      if (activeTariff) {
        const estRate = data.establishmentRates
          .filter((r) => r.tariffId === activeTariff.id && r.establishmentCount === input.establishmentCount)
          .sort((a, b) => b.establishmentCount - a.establishmentCount)[0];
        if (estRate) {
          const baseItem = items.find((i) => i.type === 'base' || i.type === 'zone');
          if (baseItem) {
            total -= baseItem.amount;
            total += estRate.price;
            baseItem.label = `${baseItem.label} (${input.establishmentCount} establecimientos)`;
            baseItem.amount = estRate.price;
          } else {
            total += estRate.price;
            items.push({ label: `${input.establishmentCount} establecimientos`, amount: estRate.price, type: 'establishment' });
          }
        }
      }
    }

    // 5. Time modifier
    const activeTimeModifier = data.timeModifiers.find(
      (m) => m.isActive && isTimeInRange(input.timeOfDay, m.startTime, m.endTime),
    );
    if (activeTimeModifier && activeTimeModifier.amount > 0) {
      let modifierAmount = 0;
      if (activeTimeModifier.amountType === 'fixed') {
        modifierAmount = activeTimeModifier.amount;
      } else {
        modifierAmount = Math.round((total * activeTimeModifier.amount) / 100);
      }
      if (activeTimeModifier.modifierType === 'surcharge') {
        total += modifierAmount;
        items.push({ label: activeTimeModifier.name, amount: modifierAmount, type: 'time' });
      } else {
        total -= modifierAmount;
        items.push({ label: `${activeTimeModifier.name} (-)`, amount: -modifierAmount, type: 'time' });
      }
    }
  }

  // 6. Promotions
  const activePromos = data.promotions.filter((p) => p.isActive);
  for (const promo of activePromos) {
    let applies = false;
    switch (promo.promoType) {
      case 'first_free':
        applies = input.isFirstOrder;
        break;
      case 'discount':
        applies = true;
        break;
      case 'zone_discount':
        applies = input.zoneId === promo.zoneId;
        break;
      case 'date_discount': {
        const now = new Date().toISOString().split('T')[0];
        applies = (!promo.startDate || promo.startDate <= now) && (!promo.endDate || promo.endDate >= now);
        break;
      }
    }
    if (applies && (promo.maxUses === null || promo.usesCount < promo.maxUses)) {
      let discountAmount = 0;
      if (promo.discountType === 'fixed') {
        discountAmount = Math.min(promo.discountAmount, total);
      } else {
        discountAmount = Math.round((total * promo.discountAmount) / 100);
      }
      if (promo.promoType === 'first_free') {
        discountAmount = total;
      }
      total -= discountAmount;
      items.push({ label: promo.name, amount: -discountAmount, type: 'promotion' });
    }
  }

  total = Math.max(0, total);
  return { total, items };
}

export function formatBreakdown(breakdown: TariffBreakdown): string {
  return breakdown.items
    .map((i) => `${i.label}: ${i.amount >= 0 ? '+' : ''}$${i.amount}`)
    .join('\n');
}
