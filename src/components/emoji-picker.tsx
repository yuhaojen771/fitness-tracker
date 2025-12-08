"use client";

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
};

// 常用 emoji 列表（扁平化所有分類）
const ALL_EMOJIS = [
  // 餐飲
  "🍽️", "🍔", "🍕", "🍜", "🍱", "🍰", "☕", "🍺", "🥤", "🍎", "🍌", "🍇",
  // 交通
  "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛴", "🚲",
  // 購物
  "🛍️", "🛒", "💳", "👜", "👕", "👔", "👗", "👠", "👟", "🧢", "⌚", "📱",
  // 娛樂
  "🎮", "🎬", "🎤", "🎧", "🎨", "🎭", "🎪", "🎯", "🎲", "🃏", "🀄", "🎰",
  // 醫療
  "🏥", "💊", "💉", "🩺", "🦷", "👁️", "🧬", "🔬", "⚕️", "🏩", "🚑", "🩹",
  // 教育
  "📚", "📖", "📝", "✏️", "📐", "📏", "📊", "📈", "🎓", "🏫", "📌", "📎",
  // 收入
  "💰", "💵", "💴", "💶", "💷", "💸", "💳", "📈", "💼", "🏦", "🎁", "🎉",
  // 其他
  "📝", "📋", "📄", "📃", "📑", "🔖", "🏷️", "💡", "🔔", "📢", "📣", "📯"
];

export function EmojiPicker({ value, onChange, placeholder = "選擇 emoji" }: EmojiPickerProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
    >
      <option value="">{placeholder}</option>
      {ALL_EMOJIS.map((emoji) => (
        <option key={emoji} value={emoji}>
          {emoji}
        </option>
      ))}
    </select>
  );
}

