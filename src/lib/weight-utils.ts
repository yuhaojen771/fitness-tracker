/**
 * 體重單位轉換工具函數
 */

export type WeightUnit = "kg" | "lb";

/**
 * 將磅轉換為公斤
 */
export function poundsToKilograms(lb: number): number {
  return lb / 2.20462;
}

/**
 * 將公斤轉換為磅
 */
export function kilogramsToPounds(kg: number): number {
  return kg * 2.20462;
}

/**
 * 格式化體重顯示（根據單位）
 */
export function formatWeight(weight: number, unit: WeightUnit, decimals: number = 1): string {
  if (unit === "lb") {
    const pounds = kilogramsToPounds(weight);
    return `${pounds.toFixed(decimals)} lb`;
  }
  return `${weight.toFixed(decimals)} kg`;
}

/**
 * 根據單位獲取體重輸入範圍
 */
export function getWeightRange(unit: WeightUnit): { min: number; max: number } {
  if (unit === "lb") {
    // 44-1100 磅（約 20-500 公斤）
    return { min: 44, max: 1100 };
  }
  // 20-500 公斤
  return { min: 20, max: 500 };
}



