"use client";

import { useState } from "react";

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
};

// 常用 emoji 分類
const EMOJI_CATEGORIES = {
  餐飲: ["🍽️", "🍔", "🍕", "🍜", "🍱", "🍰", "☕", "🍺", "🥤", "🍎", "🍌", "🍇"],
  交通: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛴", "🚲"],
  購物: ["🛍️", "🛒", "💳", "👜", "👕", "👔", "👗", "👠", "👟", "🧢", "⌚", "📱"],
  娛樂: ["🎮", "🎬", "🎤", "🎧", "🎨", "🎭", "🎪", "🎯", "🎲", "🃏", "🀄", "🎰"],
  醫療: ["🏥", "💊", "💉", "🩺", "🦷", "👁️", "🧬", "🔬", "⚕️", "🏩", "🚑", "🩹"],
  教育: ["📚", "📖", "📝", "✏️", "📐", "📏", "📊", "📈", "🎓", "🏫", "📌", "📎"],
  收入: ["💰", "💵", "💴", "💶", "💷", "💸", "💳", "📈", "💼", "🏦", "🎁", "🎉"],
  其他: ["📝", "📋", "📄", "📃", "📑", "🔖", "🏷️", "💡", "🔔", "📢", "📣", "📯"]
};

export function EmojiPicker({ value, onChange, placeholder = "選擇 emoji" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={2}
          className="flex-1 min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 flex-shrink-0"
        >
          😀
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                <div key={category}>
                  <h4 className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {category}
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="rounded-md p-2 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

