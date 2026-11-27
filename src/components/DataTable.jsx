import { useMemo, useState } from "react";
import { schema } from "../data/museumSchema.js";
import CellValue from "./CellValue.jsx";
import {
  accentStyle,
  cardClass,
  getRecordKey,
  inputClass,
} from "../utils/museum.js";

export default function DataTable({ table, database, openRecord, onAdd }) {
  const columns = schema[table].cols;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const rows = useMemo(() => {
    let filteredRows = database[table].filter((row) =>
      JSON.stringify(Object.values(row))
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

    if (sort) {
      filteredRows = [...filteredRows].sort(
        (a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * sort.direction,
      );
    }

    return filteredRows;
  }, [database, table, query, sort]);

  const visibleColumns = columns.filter(
    (column) => !hiddenColumns.includes(column.k),
  );

  const exportCsv = () => {
    const escapeCsv = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };

    const content = [
      columns.map((column) => escapeCsv(column.k)).join(","),
      ...rows.map((row) =>
        columns.map((column) => escapeCsv(row[column.k])).join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = `${table}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (key) => {
    setHiddenColumns((current) =>
      current.includes(key)
        ? current.filter((hiddenKey) => hiddenKey !== key)
        : [...current, key],
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${inputClass} w-60`}
          placeholder={`Search ${table}...`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="relative">
          <button
            className={inputClass}
            onClick={() => setShowColumnMenu((visible) => !visible)}
          >
            Columns ▾
          </button>
          {showColumnMenu && (
            <div
              className={`${cardClass} absolute z-10 mt-1 w-44 space-y-1 text-sm`}
            >
              {columns.map((column) => (
                <label key={column.k} className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.includes(column.k)}
                    onChange={() => toggleColumn(column.k)}
                  />
                  {column.k}
                </label>
              ))}
            </div>
          )}
        </div>
        <button className={inputClass} onClick={exportCsv}>
          Export CSV
        </button>
        <button
          className="rounded-xl px-4 py-2 text-sm font-medium text-white"
          style={accentStyle}
          onClick={onAdd}
        >
          + Add
        </button>
        <span className="ml-auto text-xs text-[var(--muted)]">
          {rows.length} rows
        </span>
      </div>

      <div className={`${cardClass} overflow-x-auto !p-0`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-[var(--muted)]">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.k}
                  className="cursor-pointer px-4 py-3"
                  onClick={() =>
                    setSort((current) => ({
                      key: column.k,
                      direction:
                        current?.key === column.k
                          ? -current.direction
                          : 1,
                    }))
                  }
                >
                  {column.k}
                  {sort?.key === column.k
                    ? sort.direction > 0
                      ? " ↑"
                      : " ↓"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRecordKey(table, row)}
                className="cursor-pointer border-t border-[var(--line)] hover:bg-[var(--bg)]"
                onClick={() => openRecord(table, row)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.k}
                    className="px-4 py-2.5"
                    onClick={(event) => {
                      if (column.fk) event.stopPropagation();
                    }}
                  >
                    <CellValue
                      column={column}
                      value={row[column.k]}
                      database={database}
                      openRecord={openRecord}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="p-8 text-center text-[var(--muted)]"
                >
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
