import { useState } from "react";
import { schema } from "../data/museumSchema.js";
import {
  accentStyle,
  cardClass,
  getRecordKey,
  inputClass,
} from "../utils/museum.js";

export default function RecordForm({
  table,
  initialRow,
  database,
  onSave,
  onClose,
}) {
  const [values, setValues] = useState(initialRow || {});
  const oldKey = initialRow ? getRecordKey(table, initialRow) : null;

  const submit = () => {
    const row = {};

    for (const column of schema[table].cols) {
      const value = values[column.k];

      if (value === "" || value == null) {
        row[column.k] = null;
      } else if (column.ty === "number") {
        const number = Number(value);
        if (!Number.isFinite(number)) {
          alert(`"${column.k}" must be a valid number`);
          return;
        }
        row[column.k] = number;
      } else {
        row[column.k] = value;
      }
    }

    const missingKey = schema[table].pk.find((key) => row[key] == null);
    if (missingKey) {
      alert(`Primary key "${missingKey}" is required`);
      return;
    }

    onSave(table, row, oldKey);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`${cardClass} w-full max-w-md space-y-3`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-semibold">
          {initialRow ? "Edit" : "Add"} {table}
        </h3>
        {schema[table].cols.map((column) => (
          <label
            key={column.k}
            className="block text-xs text-[var(--muted)]"
          >
            {column.k}
            {schema[table].pk.includes(column.k) ? " 🔑" : ""}
            {column.fk ? (
              <select
                className={`${inputClass} mt-1 w-full`}
                value={values[column.k] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [column.k]: event.target.value,
                  }))
                }
              >
                <option value="">— none —</option>
                {database[column.fk[0]].map((row) => (
                  <option key={row[column.fk[1]]} value={row[column.fk[1]]}>
                    {row[column.fk[1]]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={`${inputClass} mt-1 w-full`}
                type={column.ty}
                value={values[column.k] ?? ""}
                disabled={Boolean(
                  initialRow && schema[table].pk.includes(column.k),
                )}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [column.k]: event.target.value,
                  }))
                }
              />
            )}
          </label>
        ))}
        <div className="flex justify-end gap-2">
          <button className={inputClass} onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-xl px-4 py-2 text-sm text-white"
            style={accentStyle}
            onClick={submit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
