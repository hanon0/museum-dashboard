import { schema } from "../data/museumSchema.js";
import {
  accentStyle,
  getArtworkName,
  getRecordKey,
} from "../utils/museum.js";
import CellValue from "./CellValue.jsx";

export default function RecordDrawer({
  selection,
  database,
  openRecord,
  onEdit,
  onDelete,
  onClose,
}) {
  const { table, row } = selection;
  const relatedRecords = [];

  for (const [relatedTable, definition] of Object.entries(schema)) {
    definition.cols.forEach((column) => {
      if (column.fk?.[0] !== table) return;

      database[relatedTable]
        .filter((record) => record[column.k] === row[column.fk[1]])
        .forEach((record) =>
          relatedRecords.push({ table: relatedTable, row: record, via: column.k }),
        );
    });
  }

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md space-y-5 overflow-y-auto border-l border-[var(--line)] bg-[var(--card)] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase text-[var(--muted)]">{table}</p>
            <h3 className="text-xl font-semibold">
              {table === "Art_object"
                ? getArtworkName(database, row.id)
                : getRecordKey(table, row)}
            </h3>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {schema[table].cols.map((column) => (
            <div key={column.k}>
              <dt className="text-xs text-[var(--muted)]">{column.k}</dt>
              <dd>
                <CellValue
                  column={column}
                  value={row[column.k]}
                  database={database}
                  openRecord={openRecord}
                />
              </dd>
            </div>
          ))}
        </dl>

        {relatedRecords.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Related records</h4>
            <div className="space-y-1.5">
              {relatedRecords.map(({ table: relatedTable, row: relatedRow, via }) => (
                <button
                  key={relatedTable + getRecordKey(relatedTable, relatedRow)}
                  onClick={() => openRecord(relatedTable, relatedRow)}
                  className="flex w-full justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-left text-sm hover:bg-[var(--bg)]"
                >
                  <span>
                    {relatedTable}:{" "}
                    {relatedTable === "Borrowe_from"
                      ? `${relatedRow.Museum_name} (${relatedRow.borrowDate} → ${
                          relatedRow.returnDate || "now"
                        })`
                      : getRecordKey(relatedTable, relatedRow)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">via {via}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="rounded-xl px-4 py-2 text-sm text-white"
            style={accentStyle}
            onClick={() => onEdit(table, row)}
          >
            Edit
          </button>
          <button
            className="rounded-xl border border-red-400 px-4 py-2 text-sm text-red-500"
            onClick={() => onDelete(table, row)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
