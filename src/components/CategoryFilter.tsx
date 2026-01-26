"use client";

import { Category, CATEGORIES } from "@/lib/types";

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selected === null
            ? "bg-white text-black"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
            selected === category
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
