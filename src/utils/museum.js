import { roles, schema, subtypes } from "../data/museumSchema.js";

export const cardClass =
  "rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4";
export const inputClass =
  "rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none";
export const accentStyle = { background: "var(--accent)" };

export const formatNumber = (value) => Number(value).toLocaleString();
export const getToday = () => new Date().toISOString().slice(0, 10);

export function getRecordKey(table, row) {
  return schema[table].pk.map((key) => row[key]).join("|");
}

export function getArtworkSubtype(database, artworkId) {
  return subtypes.find((table) =>
    database[table].some((row) => row.Art_object_id === artworkId),
  );
}

export function getArtworkName(database, artworkId) {
  const subtype = getArtworkSubtype(database, artworkId);
  const artwork = subtype
    ? database[subtype].find((row) => row.Art_object_id === artworkId)
    : null;

  return artwork?.Name ?? `Object #${artworkId}`;
}

export function getIntegrityAlerts(database) {
  const alerts = [];

  database.Art_object.forEach((artwork) => {
    if ((artwork.Visitor_ssn == null) !== (artwork.idseller == null)) {
      alerts.push({
        table: "Art_object",
        row: artwork,
        message: `${getArtworkName(database, artwork.id)} has ${
          artwork.Visitor_ssn == null
            ? "a seller but no buyer"
            : "a buyer but no seller"
        } (rule: both or neither)`,
      });
    }

    if (!getArtworkSubtype(database, artwork.id)) {
      alerts.push({
        table: "Art_object",
        row: artwork,
        message: `Object #${artwork.id} has no Painting/Statue/Sculpture row (total specialization)`,
      });
    }
  });

  database.Employee.forEach((employee) => {
    const hasRole = roles.some((role) =>
      database[role].some((record) => record.Employee_ssn === employee.ssn),
    );

    if (!hasRole) {
      alerts.push({
        table: "Employee",
        row: employee,
        message: `${employee.fname} ${employee.Lname} has no role (total specialization)`,
      });
    }
  });

  database.Visitor.forEach((visitor) => {
    if (visitor.idguide == null) {
      alerts.push({
        table: "Visitor",
        row: visitor,
        message: `${visitor.fname} ${visitor.Lname} has no guide (1,1)`,
      });
    }
  });

  database.Borrowe_from.forEach((loan) => {
    if (loan.returnDate && loan.returnDate < loan.borrowDate) {
      alerts.push({
        table: "Borrowe_from",
        row: loan,
        message: `Loan of ${getArtworkName(database, loan.Art_object_id)} returns before it starts`,
      });
    }
  });

  return alerts;
}

export function getRecordReferences(database, table, row) {
  const references = [];

  for (const [relatedTable, definition] of Object.entries(schema)) {
    for (const column of definition.cols) {
      if (column.fk?.[0] !== table) continue;

      const hasReference = database[relatedTable].some(
        (relatedRow) => relatedRow[column.k] === row[column.fk[1]],
      );

      if (hasReference) references.push(`${relatedTable}.${column.k}`);
    }
  }

  return references;
}
