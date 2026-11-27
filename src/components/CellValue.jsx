import { formatNumber } from "../utils/museum.js";

export default function CellValue({
  column,
  value,
  database,
  openRecord,
}) {
  if (value == null || value === "") {
    return <span className="text-[var(--muted)]">—</span>;
  }

  if (column.fk) {
    const [referencedTable, referencedKey] = column.fk;
    const referencedRow = database[referencedTable].find(
      (row) => row[referencedKey] === value,
    );

    return (
      <button
        onClick={() => openRecord(referencedTable, referencedRow)}
        className="underline decoration-dotted"
        style={{ color: "var(--accent)" }}
      >
        {value}
      </button>
    );
  }

  const shouldFormatNumber =
    column.ty === "number" &&
    column.k !== "id" &&
    column.k !== "ssn" &&
    value > 9999;

  return <>{shouldFormatNumber ? formatNumber(value) : String(value)}</>;
}
