export type BengaluruPincodeConfig = {
  pincode: string; // Exactly 6 digits: /^[1-9][0-9]{5}$/
  locality: string; // Locality name e.g. "Yeshwanthpur"
  isActive: boolean; // Delivery active / enabled
  chargePaise: number | null; // null = use default Bengaluru rate; 0 = free; >0 = custom fee in paise
  createdAt?: string;
  updatedAt?: string;
};

export type BengaluruDeliverySummary = {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  customRateCount: number;
  defaultRateCount: number;
};

/**
 * Pure calculation function for summary metrics of Bengaluru PIN codes.
 * Safe for execution in both client and server components.
 */
export function getBengaluruDeliverySummary(
  configs: BengaluruPincodeConfig[]
): BengaluruDeliverySummary {
  const totalCount = configs.length;
  let activeCount = 0;
  let inactiveCount = 0;
  let customRateCount = 0;
  let defaultRateCount = 0;

  for (const c of configs) {
    if (c.isActive) {
      activeCount++;
      if (c.chargePaise !== null) {
        customRateCount++;
      } else {
        defaultRateCount++;
      }
    } else {
      inactiveCount++;
    }
  }

  return {
    totalCount,
    activeCount,
    inactiveCount,
    customRateCount,
    defaultRateCount,
  };
}

