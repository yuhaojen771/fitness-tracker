/**
 * BMI 計算與分類工具函數
 */

export type BMICategory = "underweight" | "normal" | "overweight" | "obese";

export interface BMIAnalysis {
  bmi: number;
  category: BMICategory;
  categoryName: string;
  description: string;
  recommendations: string[];
  color: string;
}

/**
 * 計算 BMI
 */
export function calculateBMI(weight: number, height: number): number {
  if (height <= 0 || weight <= 0) return 0;
  return weight / (height * height);
}

/**
 * 分析 BMI 並提供分類與建議
 */
export function analyzeBMI(bmi: number): BMIAnalysis {
  let category: BMICategory;
  let categoryName: string;
  let description: string;
  let recommendations: string[];
  let color: string;

  if (bmi < 18.5) {
    category = "underweight";
    categoryName = "體重過輕";
    description = "你的 BMI 低於正常範圍，可能需要增加體重以達到健康標準。";
    recommendations = [
      "諮詢營養師制定增重計劃",
      "增加健康的高熱量食物攝取",
      "進行適度的肌肉訓練",
      "確保充足的睡眠和休息"
    ];
    color = "blue";
  } else if (bmi < 24) {
    category = "normal";
    categoryName = "正常範圍";
    description = "恭喜！你的 BMI 在健康範圍內，請繼續保持。";
    recommendations = [
      "維持規律的運動習慣",
      "保持均衡飲食",
      "定期追蹤體重變化",
      "維持健康的生活方式"
    ];
    color = "emerald";
  } else if (bmi < 27) {
    category = "overweight";
    categoryName = "體重過重";
    description = "你的 BMI 略高於正常範圍，建議開始控制體重。";
    recommendations = [
      "減少高熱量食物攝取",
      "增加有氧運動頻率",
      "設定合理的減重目標（每週 0.5-1 公斤）",
      "記錄每日飲食和運動"
    ];
    color = "yellow";
  } else {
    category = "obese";
    categoryName = "肥胖";
    description = "你的 BMI 屬於肥胖範圍，建議尋求專業協助制定減重計劃。";
    recommendations = [
      "諮詢醫師或營養師",
      "制定長期減重計劃",
      "結合飲食控制和運動",
      "定期追蹤健康指標"
    ];
    color = "red";
  }

  return {
    bmi,
    category,
    categoryName,
    description,
    recommendations,
    color
  };
}

/**
 * 將公分轉換為公尺
 */
export function cmToMeters(cm: number): number {
  return cm / 100;
}



