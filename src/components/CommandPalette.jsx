import { useMemo, useState } from "react";
import { schema } from "../data/museumSchema.js";
import {
  cardClass,
  getArtworkName,
  getRecordKey,
  inputClass,
} from "../utils/museum.js";

export default function CommandPalette({
  database,
  openRecord,
  goToView,
  onClose,
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query) return [];

    const searchTerm = query.toLowerCase();
    const matches = Object.keys(schema)
      .filter((table) => table.toLowerCase().includes(searchTerm))
      .map((table) => ({ navigationTarget: table }));

    for (const table of Object.keys(schema)) {
      database[table].forEach((row) => {
        if (
          JSON.stringify(Object.values(row))
            .toLowerCase()
            .includes(searchTerm)
        ) {
          matches.push({ table, row });
        }
      });
    }

    return matches.slice(0, 9);
  }, [query, database]);

  const selectResult = (result) => {
    if (result.navigationTarget) {
      goToView(result.navigationTarget);
    } else {
      openRecord(result.table, result.row);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24"
      onClick={onClose}
    >
      <div
        className={`${cardClass} w-full max-w-lg`}
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          className={`${inputClass} w-full`}
          placeholder="Search tables, artworks, people..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-2 space-y-1">
          {results.map((result, index) => (
            <button
              key={index}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--bg)]"
              onClick={() => selectResult(result)}
            >
              {result.navigationTarget
                ? `→ Go to ${result.navigationTarget}`
                : `${result.table}: ${
                    result.table === "Art_object"
                      ? getArtworkName(database, result.row.id)
                      : getRecordKey(result.table, result.row)
                  }`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
