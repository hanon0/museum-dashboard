import { roles } from "../data/museumSchema.js";
import {
  accentStyle,
  cardClass,
  formatNumber,
  getArtworkName,
  getRecordKey,
  getToday,
} from "../utils/museum.js";

function LoanTimeline({ database, openRecord }) {
  const loans = database.Borrowe_from;
  const timestamps = loans.map((loan) => Date.parse(loan.borrowDate));
  const minDate = Math.min(...timestamps);
  const maxDate = Date.parse(getToday());
  const span = maxDate - minDate || 1;

  return (
    <div className="space-y-2">
      {loans.map((loan) => {
        const start = ((Date.parse(loan.borrowDate) - minDate) / span) * 100;
        const endDate = loan.returnDate
          ? Date.parse(loan.returnDate)
          : maxDate;
        const end = ((endDate - minDate) / span) * 100;
        const artwork = database.Art_object.find(
          (item) => item.id === loan.Art_object_id,
        );

        return (
          <div
            key={getRecordKey("Borrowe_from", loan)}
            className="flex items-center gap-3 text-xs"
          >
            <button
              className="w-44 shrink-0 truncate text-left"
              onClick={() => openRecord("Art_object", artwork)}
            >
              {getArtworkName(database, loan.Art_object_id)} → {loan.Museum_name}
            </button>
            <div className="relative h-5 flex-1 rounded bg-[var(--bg)]">
              <div
                title={`${loan.borrowDate} → ${loan.returnDate || "active"}`}
                className={`absolute h-5 rounded ${
                  loan.returnDate ? "opacity-50" : "animate-pulse"
                }`}
                style={{
                  left: `${start}%`,
                  width: `${Math.max(end - start, 2)}%`,
                  ...accentStyle,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-[var(--muted)]">
        Pulsing bar = active loan (returnDate is NULL)
      </p>
    </div>
  );
}

export default function Overview({ database, widgets, openRecord, alerts }) {
  const activeLoans = database.Borrowe_from.filter(
    (loan) => !loan.returnDate,
  ).length;
  const totalValue = database.Art_object.reduce(
    (sum, artwork) => sum + artwork.price,
    0,
  );
  const artistValues = Object.entries(
    database.Art_object.reduce((totals, artwork) => {
      totals[artwork.Artist_name] =
        (totals[artwork.Artist_name] || 0) + artwork.price;
      return totals;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxArtistValue = artistValues[0]?.[1] || 1;
  const roleColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];
  const roleCounts = roles.map((role) => database[role].length);
  const roleTotal = roleCounts.reduce((sum, count) => sum + count, 0) || 1;
  const donutSegments = roleCounts
    .map((count, index) => {
      const start =
        (roleCounts
          .slice(0, index)
          .reduce((sum, roleCount) => sum + roleCount, 0) /
          roleTotal) *
        100;
      const end =
        (roleCounts
          .slice(0, index + 1)
          .reduce((sum, roleCount) => sum + roleCount, 0) /
          roleTotal) *
        100;
      return `${roleColors[index]} ${start}% ${end}%`;
    })
    .join(",");

  return (
    <div className="space-y-4">
      {widgets.kpi && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Artworks", database.Art_object.length],
            ["Collection value", `${formatNumber(totalValue)} $`],
            ["Active loans", activeLoans],
            ["Visitors", database.Visitor.length],
          ].map(([label, value]) => (
            <div key={label} className={cardClass}>
              <p className="text-sm text-[var(--muted)]">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {widgets.value && (
          <div className={`${cardClass} lg:col-span-2`}>
            <h3 className="mb-3 font-semibold">Collection value by artist</h3>
            <div className="space-y-2">
              {artistValues.map(([artist, value]) => (
                <div
                  key={artist}
                  className="flex items-center gap-3 text-xs"
                >
                  <span className="w-28 shrink-0 truncate">{artist}</span>
                  <div className="h-4 flex-1 rounded bg-[var(--bg)]">
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `${(value / maxArtistValue) * 100}%`,
                        ...accentStyle,
                      }}
                    />
                  </div>
                  <span className="w-20 text-right">{formatNumber(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {widgets.roles && (
          <div className={cardClass}>
            <h3 className="mb-3 font-semibold">Staff by role</h3>
            <div className="flex items-center gap-4">
              <div
                className="h-28 w-28 rounded-full"
                style={{
                  background: `conic-gradient(${donutSegments})`,
                  mask: "radial-gradient(circle 32px, transparent 98%, #000 100%)",
                  WebkitMask:
                    "radial-gradient(circle 32px, transparent 98%, #000 100%)",
                }}
              />
              <ul className="space-y-1 text-xs">
                {roles.map((role, index) => (
                  <li key={role}>
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ background: roleColors[index] }}
                    />
                    {role} ({roleCounts[index]})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {widgets.timeline && (
        <div className={cardClass}>
          <h3 className="mb-3 font-semibold">Loan timeline</h3>
          <LoanTimeline database={database} openRecord={openRecord} />
        </div>
      )}

      {widgets.alerts && (
        <div className={cardClass}>
          <h3 className="mb-3 font-semibold">
            Data integrity alerts{" "}
            <span className="text-xs text-[var(--muted)]">
              ({alerts.length})
            </span>
          </h3>
          {alerts.length ? (
            <ul className="space-y-1.5">
              {alerts.map((alert, index) => (
                <li key={`${alert.table}-${index}`}>
                  <button
                    className="w-full rounded-lg bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-600"
                    onClick={() => openRecord(alert.table, alert.row)}
                  >
                    ⚠️ {alert.message}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-500">
              All EER rules satisfied ✓
            </p>
          )}
        </div>
      )}
    </div>
  );
}
