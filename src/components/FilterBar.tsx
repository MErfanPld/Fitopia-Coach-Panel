/**
 * Unified search + filter toolbar for Coach Panel lists.
 */

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="filter-bar space-y-3">
      {children}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "جستجو…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-field">
      <Search size={18} className="search-field-icon" aria-hidden />
      <input
        className="field search-field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="search"
        enterKeyHint="search"
      />
      {value ? (
        <button
          type="button"
          className="search-field-clear"
          onClick={() => onChange("")}
          aria-label="پاک کردن"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="filter-chips hide-scrollbar" role="tablist">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            className={`filter-chip ${active ? "filter-chip-active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterSelects({ children }: { children: ReactNode }) {
  return <div className="filter-selects">{children}</div>;
}

export function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="filter-select-wrap">
      {label ? <span className="filter-select-label">{label}</span> : null}
      <select
        className="field filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
