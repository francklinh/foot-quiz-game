import { useEffect, useMemo, useRef, useState } from "react";

type AutocompleteInputProps = {
  suggestions: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minChars?: number; // Nouveau paramètre
};

export function AutocompleteInput({
  suggestions,
  onSelect,
  disabled,
  placeholder = "Tape une réponse…",
  className = "",
  minChars = 2, // Par défaut 2, mais on passe 3 depuis Top10
}: AutocompleteInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Filtrage (case-insensitive) + tri simple
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Ne filtre que si on a au moins minChars caractères
    if (!q || q.length < minChars) return [];
    return suggestions
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, suggestions, minChars]);

  // Ouvre/ferme le menu suivant l'entrée
  useEffect(() => {
    if (disabled) return setOpen(false);
    setOpen(filtered.length > 0);
    setActiveIndex(filtered.length ? 0 : -1);
  }, [filtered.length, disabled]);

  // Validation commune
  function validate(value: string) {
    if (!value.trim()) return;
    onSelect(value.trim());
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key === "Enter") {
      validate(query);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const value = filtered[activeIndex] ?? query;
      validate(value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => filtered.length && setOpen(true)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Partie terminée" : placeholder}
        className={`border px-3 py-2 rounded w-full ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="ac-listbox"
        role="combobox"
        autoComplete="off"
      />

      {open && (
        <ul
          id="ac-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow"
        >
          {filtered.map((item, idx) => (
            <li
              key={item}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => validate(item)}
              className={`px-3 py-2 cursor-pointer ${
                idx === activeIndex ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              <Highlight query={query} text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Highlight({ query, text }: { query: string; text: string }) {
  const q = query.trim();
  if (!q) return <span>{text}</span>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <span>{text}</span>;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <span>
      {before}
      <strong>{match}</strong>
      {after}
    </span>
  );
}