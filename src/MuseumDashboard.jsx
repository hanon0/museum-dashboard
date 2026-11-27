import { useEffect, useMemo, useState } from "react";

/* ================= 1) SCHEMA CONFIG (mirrors your physical schema) =================
  Add a table / column here and the table page, form, drawer, search and
   relationship explorer pick it up automatically. fk: [refTable, refColumn] */
const c = (k, ty = "text", fk) => ({ k, ty, fk });
const sub = (extra) => ({ pk: ["Art_object_id"], cols: [c("Art_object_id", "number", ["Art_object", "id"]), ...extra] });
const role = (id) => ({ pk: [id], cols: [c(id, "number"), c("Employee_ssn", "number", ["Employee", "ssn"])] });
const T = {
  Artist: { pk: ["name"], cols: [c("name"), c("country"), c("sex"), c("birthdata", "date"), c("age", "number"), c("style"), c("century")] },
  Art_object: { pk: ["id"], cols: [c("id", "number"), c("price", "number"), c("Artist_name", "text", ["Artist", "name"]), c("Visitor_ssn", "number", ["Visitor", "ssn"]), c("idseller", "number", ["seller", "idseller"])] },
  Painting: sub([c("Name")]),
  Statue: sub([c("height", "number"), c("weight", "number"), c("Name")]),
  Sculpture: sub([c("height", "number"), c("weight", "number"), c("Name")]),
  Employee: { pk: ["ssn"], cols: [c("ssn", "number"), c("fname"), c("Lname"), c("sex"), c("Bdate", "date"), c("address"), c("phone_no"), c("salary", "number")] },
  Manager: role("idManager"), Security: role("idSecurity"), seller: role("idseller"), Tour_guide: role("idTour_guide"),
  Visitor: { pk: ["ssn"], cols: [c("ssn", "number"), c("fname"), c("Lname"), c("idguide", "number", ["Tour_guide", "idTour_guide"])] },
  Museum: { pk: ["name"], cols: [c("name"), c("country")] },
  Borrowe_from: { pk: ["Museum_name", "Art_object_id", "borrowDate"], cols: [c("Museum_name", "text", ["Museum", "name"]), c("Art_object_id", "number", ["Art_object", "id"]), c("borrowDate", "date"), c("returnDate", "date")] },
};
const GROUPS = { Collection: ["Artist", "Art_object", "Painting", "Statue", "Sculpture"], People: ["Employee", "Manager", "Security", "seller", "Tour_guide", "Visitor"], Museums: ["Museum", "Borrowe_from"] };
const ROLES = ["Manager", "Security", "seller", "Tour_guide"], SUBS = ["Painting", "Statue", "Sculpture"];
const ICON = { Painting: "🖼️", Statue: "🗿", Sculpture: "⚱️" };

/* ================= 2) MOCK DATA - replace with fetch() from your API ================= */
const SEED = {
  Artist: [
    { name: "Claude Monet", country: "France", sex: "M", birthdata: "1840-11-14", age: 86, style: "Impressionism", century: "19th" },
    { name: "Auguste Rodin", country: "France", sex: "M", birthdata: "1840-11-12", age: 86, style: "Realism", century: "19th" },
    { name: "Mahmoud Said", country: "Egypt", sex: "M", birthdata: "1897-04-08", age: 129, style: "Modernism", century: "20th" },
    { name: "Frida Kahlo", country: "Mexico", sex: "F", birthdata: "1907-07-06", age: 119, style: "Surrealism", century: "20th" },
    { name: "Michelangelo", country: "Italy", sex: "M", birthdata: "1475-03-06", age: 551, style: "Renaissance", century: "16th" },
  ],
  Art_object: [
    { id: 1, price: 2400000, Artist_name: "Claude Monet", Visitor_ssn: 9001, idseller: 1 },
    { id: 2, price: 3100000, Artist_name: "Auguste Rodin", Visitor_ssn: 9002, idseller: 1 },
    { id: 3, price: 1800000, Artist_name: "Auguste Rodin", Visitor_ssn: null, idseller: null },
    { id: 4, price: 650000, Artist_name: "Mahmoud Said", Visitor_ssn: 9001, idseller: 2 },
    { id: 5, price: 5200000, Artist_name: "Michelangelo", Visitor_ssn: null, idseller: null },
    { id: 6, price: 1500000, Artist_name: "Frida Kahlo", Visitor_ssn: 9003, idseller: null },
    { id: 7, price: 400000, Artist_name: "Auguste Rodin", Visitor_ssn: null, idseller: null },
  ],
  Painting: [{ Art_object_id: 1, Name: "Water Lilies" }, { Art_object_id: 4, Name: "Nile Dawn" }, { Art_object_id: 6, Name: "The Two Fridas" }],
  Statue: [{ Art_object_id: 5, height: 5.17, weight: 5600, Name: "David Study" }],
  Sculpture: [{ Art_object_id: 2, height: 1.8, weight: 700, Name: "The Thinker" }, { Art_object_id: 3, height: 1.8, weight: 450, Name: "The Kiss" }],
  Employee: [
    { ssn: 101, fname: "Omar", Lname: "Khaled", sex: "M", Bdate: "1985-02-11", address: "Cairo", phone_no: "01000000001", salary: 22000 },
    { ssn: 102, fname: "Salma", Lname: "Adel", sex: "F", Bdate: "1992-06-30", address: "Giza", phone_no: "01000000002", salary: 12000 },
    { ssn: 103, fname: "Youssef", Lname: "Nabil", sex: "M", Bdate: "1990-09-01", address: "Cairo", phone_no: "01000000003", salary: 15000 },
    { ssn: 104, fname: "Nour", Lname: "Hassan", sex: "F", Bdate: "1995-12-20", address: "Badr", phone_no: "01000000004", salary: 11000 },
    { ssn: 105, fname: "Ali", Lname: "Mostafa", sex: "M", Bdate: "1988-03-14", address: "Cairo", phone_no: "01000000005", salary: 14500 },
    { ssn: 106, fname: "Dina", Lname: "Fawzy", sex: "F", Bdate: "1994-07-07", address: "Cairo", phone_no: "01000000006", salary: 9000 },
  ],
  Manager: [{ idManager: 1, Employee_ssn: 101 }], Security: [{ idSecurity: 1, Employee_ssn: 102 }],
  seller: [{ idseller: 1, Employee_ssn: 103 }, { idseller: 2, Employee_ssn: 105 }], Tour_guide: [{ idTour_guide: 1, Employee_ssn: 104 }],
  Visitor: [{ ssn: 9001, fname: "Mona", Lname: "Ali", idguide: 1 }, { ssn: 9002, fname: "Karim", Lname: "Hany", idguide: 1 }, { ssn: 9003, fname: "Laila", Lname: "Samir", idguide: 1 }],
  Museum: [{ name: "Louvre", country: "France" }, { name: "Egyptian Museum", country: "Egypt" }, { name: "MoMA", country: "USA" }],
  Borrowe_from: [
    { Museum_name: "Louvre", Art_object_id: 5, borrowDate: "2026-01-15", returnDate: "2026-04-20" },
    { Museum_name: "Louvre", Art_object_id: 1, borrowDate: "2026-03-01", returnDate: "2026-06-01" },
    { Museum_name: "MoMA", Art_object_id: 2, borrowDate: "2026-09-10", returnDate: null },
    { Museum_name: "Egyptian Museum", Art_object_id: 4, borrowDate: "2026-10-01", returnDate: null },
  ],
};

/* ================= helpers ================= */
const TODAY = new Date().toISOString().slice(0, 10);
const fmt = (n) => Number(n).toLocaleString();
const keyOf = (t, r) => T[t].pk.map((k) => r[k]).join("|");
const subOf = (db, id) => SUBS.find((s) => db[s].some((r) => r.Art_object_id === id));
const nameOf = (db, id) => { const s = subOf(db, id); return s ? db[s].find((r) => r.Art_object_id === id).Name : `Object #${id}`; };
const card = "rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4";
const inp = "rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none";
const acc = { background: "var(--accent)" };

/* Integrity checks taken from your EER rules */
function getAlerts(db) {
  const a = [];
  db.Art_object.forEach((o) => {
    if ((o.Visitor_ssn == null) !== (o.idseller == null)) a.push({ t: "Art_object", row: o, msg: `${nameOf(db, o.id)} has ${o.Visitor_ssn == null ? "a seller but no buyer" : "a buyer but no seller"} (rule: both or neither)` });
    if (!subOf(db, o.id)) a.push({ t: "Art_object", row: o, msg: `Object #${o.id} has no Painting/Statue/Sculpture row (total specialization)` });
  });
  db.Employee.forEach((e) => { if (!ROLES.some((r) => db[r].some((x) => x.Employee_ssn === e.ssn))) a.push({ t: "Employee", row: e, msg: `${e.fname} ${e.Lname} has no role (total specialization)` }); });
  db.Visitor.forEach((v) => { if (v.idguide == null) a.push({ t: "Visitor", row: v, msg: `${v.fname} ${v.Lname} has no guide (1,1)` }); });
  db.Borrowe_from.forEach((b) => { if (b.returnDate && b.returnDate < b.borrowDate) a.push({ t: "Borrowe_from", row: b, msg: `Loan of ${nameOf(db, b.Art_object_id)} returns before it starts` }); });
  return a;
}

function getReferences(db, table, row) {
  const references = [];

  for (const [relatedTable, definition] of Object.entries(T)) {
    for (const column of definition.cols) {
      if (column.fk?.[0] !== table) continue;
      const hasReference = db[relatedTable].some(
        (relatedRow) => relatedRow[column.k] === row[column.fk[1]],
      );
      if (hasReference) references.push(`${relatedTable}.${column.k}`);
    }
  }

  return references;
}

/* ================= generic pieces ================= */
function Cell({ col, v, db, open }) {
  if (v == null || v === "") return <span className="text-[var(--muted)]">—</span>;
  if (col.fk) { const r = db[col.fk[0]].find((x) => x[col.fk[1]] === v); return <button onClick={() => open(col.fk[0], r)} className="underline decoration-dotted" style={{ color: "var(--accent)" }}>{v}</button>; }
  return <>{col.ty === "number" && col.k !== "id" && col.k !== "ssn" && v > 9999 ? fmt(v) : String(v)}</>;
}

function DataTable({ t, db, open, onAdd }) {
  const cols = T[t].cols;
  const [q, setQ] = useState(""), [sort, setSort] = useState(null), [hide, setHide] = useState([]), [cm, setCm] = useState(false);
  const rows = useMemo(() => {
    let r = db[t].filter((x) => JSON.stringify(Object.values(x)).toLowerCase().includes(q.toLowerCase()));
    if (sort) r = [...r].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.d);
    return r;
  }, [db, t, q, sort]);
  const shown = cols.filter((x) => !hide.includes(x.k));
  const csv = () => {
    const escapeCsv = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const txt = [
      cols.map((x) => escapeCsv(x.k)).join(","),
      ...rows.map((r) => cols.map((x) => escapeCsv(r[x.k])).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input className={inp + " w-60"} placeholder={`Search ${t}...`} value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="relative">
          <button className={inp} onClick={() => setCm(!cm)}>Columns ▾</button>
          {cm && <div className={card + " absolute z-10 mt-1 w-44 space-y-1 text-sm"}>{cols.map((x) => (
            <label key={x.k} className="flex gap-2"><input type="checkbox" checked={!hide.includes(x.k)} onChange={() => setHide(hide.includes(x.k) ? hide.filter((h) => h !== x.k) : [...hide, x.k])} />{x.k}</label>))}</div>}
        </div>
        <button className={inp} onClick={csv}>Export CSV</button>
        <button className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={acc} onClick={onAdd}>+ Add</button>
        <span className="ml-auto text-xs text-[var(--muted)]">{rows.length} rows</span>
      </div>
      <div className={card + " overflow-x-auto !p-0"}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-[var(--muted)]"><tr>{shown.map((x) => (
            <th key={x.k} className="cursor-pointer px-4 py-3" onClick={() => setSort({ k: x.k, d: sort?.k === x.k ? -sort.d : 1 })}>{x.k}{sort?.k === x.k ? (sort.d > 0 ? " ↑" : " ↓") : ""}</th>))}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={keyOf(t, r)} className="cursor-pointer border-t border-[var(--line)] hover:bg-[var(--bg)]" onClick={() => open(t, r)}>
              {shown.map((x) => <td key={x.k} className="px-4 py-2.5" onClick={(e) => x.fk && e.stopPropagation()}><Cell col={x} v={r[x.k]} db={db} open={open} /></td>)}
            </tr>))}
            {!rows.length && <tr><td colSpan={shown.length} className="p-8 text-center text-[var(--muted)]">No results</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}

/* Relationship explorer: forward + reverse links computed from the FK config */
function Drawer({ d, db, open, onEdit, onDel, close }) {
  const { t, row } = d;
  const related = [];
  for (const [tn, def] of Object.entries(T)) def.cols.forEach((col) => {
    if (col.fk?.[0] === t) db[tn].filter((r) => r[col.k] === row[col.fk[1]]).forEach((r) => related.push({ tn, r, via: col.k }));
  });
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={close}>
      <div className="h-full w-full max-w-md space-y-5 overflow-y-auto border-l border-[var(--line)] bg-[var(--card)] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><div><p className="text-xs uppercase text-[var(--muted)]">{t}</p><h3 className="text-xl font-semibold">{t === "Art_object" ? nameOf(db, row.id) : keyOf(t, row)}</h3></div><button onClick={close}>✕</button></div>
        <dl className="grid grid-cols-2 gap-3 text-sm">{T[t].cols.map((col) => (<div key={col.k}><dt className="text-xs text-[var(--muted)]">{col.k}</dt><dd><Cell col={col} v={row[col.k]} db={db} open={open} /></dd></div>))}</dl>
        {related.length > 0 && <div><h4 className="mb-2 text-sm font-semibold">Related records</h4><div className="space-y-1.5">{related.map(({ tn, r, via }) => (
          <button key={tn + keyOf(tn, r)} onClick={() => open(tn, r)} className="flex w-full justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-left text-sm hover:bg-[var(--bg)]">
            <span>{tn}: {tn === "Borrowe_from" ? `${r.Museum_name} (${r.borrowDate} → ${r.returnDate || "now"})` : keyOf(tn, r)}</span><span className="text-xs text-[var(--muted)]">via {via}</span></button>))}</div></div>}
        <div className="flex gap-2"><button className="rounded-xl px-4 py-2 text-sm text-white" style={acc} onClick={() => onEdit(t, row)}>Edit</button><button className="rounded-xl border border-red-400 px-4 py-2 text-sm text-red-500" onClick={() => onDel(t, row)}>Delete</button></div>
      </div>
    </div>
  );
}

/* Auto-generated form from the schema (FK columns become dropdowns) */
function Form({ t, init, db, onSave, close }) {
  const [v, setV] = useState(init || {});
  const oldKey = init ? keyOf(t, init) : null;
  const submit = () => {
    const row = {};
    for (const col of T[t].cols) {
      const value = v[col.k];
      if (value === "" || value == null) {
        row[col.k] = null;
      } else if (col.ty === "number") {
        const number = Number(value);
        if (!Number.isFinite(number)) {
          alert(`"${col.k}" must be a valid number`);
          return;
        }
        row[col.k] = number;
      } else {
        row[col.k] = value;
      }
    }

    const missingKey = T[t].pk.find((key) => row[key] == null);
    if (missingKey) {
      alert(`Primary key "${missingKey}" is required`);
      return;
    }
    onSave(t, row, oldKey);
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div className={card + " w-full max-w-md space-y-3"} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">{init ? "Edit" : "Add"} {t}</h3>
        {T[t].cols.map((col) => (
          <label key={col.k} className="block text-xs text-[var(--muted)]">{col.k}{T[t].pk.includes(col.k) ? " 🔑" : ""}
            {col.fk ? (
              <select className={inp + " mt-1 w-full"} value={v[col.k] ?? ""} onChange={(e) => setV({ ...v, [col.k]: e.target.value })}>
                <option value="">— none —</option>{db[col.fk[0]].map((r) => <option key={r[col.fk[1]]}>{r[col.fk[1]]}</option>)}</select>
            ) : (
              <input className={inp + " mt-1 w-full"} type={col.ty} value={v[col.k] ?? ""} disabled={!!init && T[t].pk.includes(col.k)} onChange={(e) => setV({ ...v, [col.k]: e.target.value })} />)}
          </label>))}
        <div className="flex justify-end gap-2"><button className={inp} onClick={close}>Cancel</button><button className="rounded-xl px-4 py-2 text-sm text-white" style={acc} onClick={submit}>Save</button></div>
      </div>
    </div>
  );
}

/* Ctrl+K command palette: jump to any table or any record */
function Palette({ db, open, go, close }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    if (!q) return [];
    const s = q.toLowerCase(), out = Object.keys(T).filter((t) => t.toLowerCase().includes(s)).map((t) => ({ nav: t }));
    for (const t in T) db[t].forEach((r) => { if (JSON.stringify(Object.values(r)).toLowerCase().includes(s)) out.push({ t, r }); });
    return out.slice(0, 9);
  }, [q, db]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24" onClick={close}>
      <div className={card + " w-full max-w-lg"} onClick={(e) => e.stopPropagation()}>
        <input autoFocus className={inp + " w-full"} placeholder="Search tables, artworks, people..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-2 space-y-1">{hits.map((h, i) => (
          <button key={i} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--bg)]" onClick={() => { h.nav ? go(h.nav) : open(h.t, h.r); close(); }}>
            {h.nav ? `→ Go to ${h.nav}` : `${h.t}: ${h.t === "Art_object" ? nameOf(db, h.r.id) : keyOf(h.t, h.r)}`}</button>))}</div>
      </div>
    </div>
  );
}

/* ================= creative widgets ================= */
function Timeline({ db, open }) {
  const ts = (d) => Date.parse(d), rows = db.Borrowe_from;
  const min = Math.min(...rows.map((r) => ts(r.borrowDate))), max = ts(TODAY), span = max - min || 1;
  return (
    <div className="space-y-2">{rows.map((r) => {
      const s = ((ts(r.borrowDate) - min) / span) * 100, e = (((r.returnDate ? ts(r.returnDate) : max) - min) / span) * 100;
      return (
        <div key={keyOf("Borrowe_from", r)} className="flex items-center gap-3 text-xs">
          <button className="w-44 shrink-0 truncate text-left" onClick={() => open("Art_object", db.Art_object.find((o) => o.id === r.Art_object_id))}>{nameOf(db, r.Art_object_id)} → {r.Museum_name}</button>
          <div className="relative h-5 flex-1 rounded bg-[var(--bg)]"><div title={`${r.borrowDate} → ${r.returnDate || "active"}`} className={`absolute h-5 rounded ${r.returnDate ? "opacity-50" : "animate-pulse"}`} style={{ left: `${s}%`, width: `${Math.max(e - s, 2)}%`, ...acc }} /></div>
        </div>);
    })}<p className="text-xs text-[var(--muted)]">Pulsing bar = active loan (returnDate is NULL)</p></div>
  );
}

function Overview({ db, w, open, alerts }) {
  const active = db.Borrowe_from.filter((b) => !b.returnDate).length;
  const total = db.Art_object.reduce((s, o) => s + o.price, 0);
  const byArtist = Object.entries(db.Art_object.reduce((m, o) => ((m[o.Artist_name] = (m[o.Artist_name] || 0) + o.price), m), {})).sort((a, b) => b[1] - a[1]);
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"], counts = ROLES.map((r) => db[r].length), sum = counts.reduce((a, b) => a + b, 0) || 1;
  const donut = counts.map((n, i) => {
    const start = counts.slice(0, i).reduce((total, count) => total + count, 0) / sum * 100;
    const end = counts.slice(0, i + 1).reduce((total, count) => total + count, 0) / sum * 100;
    return `${colors[i]} ${start}% ${end}%`;
  }).join(",");
  return (
    <div className="space-y-4">
      {w.kpi && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Artworks", db.Art_object.length], ["Collection value", fmt(total) + " $"], ["Active loans", active], ["Visitors", db.Visitor.length]].map(([l, v]) => (
        <div key={l} className={card}><p className="text-sm text-[var(--muted)]">{l}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div>))}</div>}
      <div className="grid gap-4 lg:grid-cols-3">
        {w.value && <div className={card + " lg:col-span-2"}><h3 className="mb-3 font-semibold">Collection value by artist</h3><div className="space-y-2">{byArtist.map(([n, v]) => (
          <div key={n} className="flex items-center gap-3 text-xs"><span className="w-28 shrink-0 truncate">{n}</span><div className="h-4 flex-1 rounded bg-[var(--bg)]"><div className="h-4 rounded" style={{ width: `${(v / byArtist[0][1]) * 100}%`, ...acc }} /></div><span className="w-20 text-right">{fmt(v)}</span></div>))}</div></div>}
        {w.roles && <div className={card}><h3 className="mb-3 font-semibold">Staff by role</h3><div className="flex items-center gap-4">
          <div className="h-28 w-28 rounded-full" style={{ background: `conic-gradient(${donut})`, mask: "radial-gradient(circle 32px, transparent 98%, #000 100%)", WebkitMask: "radial-gradient(circle 32px, transparent 98%, #000 100%)" }} />
          <ul className="space-y-1 text-xs">{ROLES.map((r, i) => <li key={r}><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: colors[i] }} />{r} ({counts[i]})</li>)}</ul></div></div>}
      </div>
      {w.timeline && <div className={card}><h3 className="mb-3 font-semibold">Loan timeline</h3><Timeline db={db} open={open} /></div>}
      {w.alerts && <div className={card}><h3 className="mb-3 font-semibold">Data integrity alerts <span className="text-xs text-[var(--muted)]">({alerts.length})</span></h3>
        {alerts.length ? <ul className="space-y-1.5">{alerts.map((a, i) => <li key={i}><button className="w-full rounded-lg bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-600" onClick={() => open(a.t, a.row)}>⚠️ {a.msg}</button></li>)}</ul> : <p className="text-sm text-emerald-500">All EER rules satisfied ✓</p>}</div>}
    </div>
  );
}

function Gallery({ db, open }) {
  const [f, setF] = useState("All"), [by, setBy] = useState("price");
  const items = db.Art_object.map((o) => ({ o, s: subOf(db, o.id) })).filter((x) => f === "All" || x.s === f).sort((a, b) => (by === "price" ? b.o.price - a.o.price : a.o.id - b.o.id));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">{["All", ...SUBS].map((x) => <button key={x} onClick={() => setF(x)} className={inp} style={f === x ? { ...acc, color: "#fff" } : {}}>{x}</button>)}
        <select className={inp + " ml-auto"} value={by} onChange={(e) => setBy(e.target.value)}><option value="price">Sort: price</option><option value="id">Sort: id</option></select></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(({ o, s }) => {
        const loan = db.Borrowe_from.find((b) => b.Art_object_id === o.id && !b.returnDate);
        return (
          <button key={o.id} onClick={() => open("Art_object", o)} className={card + " text-left transition hover:-translate-y-1 hover:shadow-lg"}>
            <div className="relative flex h-36 items-center justify-center rounded-xl text-5xl" style={{ background: `linear-gradient(135deg,hsl(${(o.id * 67) % 360} 70% 60%),hsl(${(o.id * 67 + 60) % 360} 70% 35%))` }}>{ICON[s] || "❓"}
              {loan && <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">On loan · {loan.Museum_name}</span>}</div>
            <p className="mt-3 font-semibold">{nameOf(db, o.id)}</p><p className="text-sm text-[var(--muted)]">{o.Artist_name} · {s || "unclassified"}</p><p className="mt-1 text-sm">{fmt(o.price)} $</p>
          </button>);
      })}</div>
    </div>
  );
}

/* ================= main ================= */
export default function MuseumDashboard() {
  const [db, setDb] = useState(SEED); // swap with data fetched from your backend
  const [view, setView] = useState("Overview"), [drawer, setDrawer] = useState(null), [form, setForm] = useState(null), [pal, setPal] = useState(false);
  const [dark, setDark] = useState(false), [accent, setAccent] = useState("#6366f1"), [menu, setMenu] = useState(false), [side, setSide] = useState(false);
  const [w, setW] = useState({ kpi: 1, value: 1, roles: 1, timeline: 1, alerts: 1 });
  const alerts = useMemo(() => getAlerts(db), [db]);
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setPal((p) => !p); } if (e.key === "Escape") { setPal(false); setDrawer(null); setForm(null); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const open = (t, row) => row && setDrawer({ t, row });
  const save = (t, row, oldKey) => {
    const k = keyOf(t, row);
    if (db[t].some((r) => keyOf(t, r) === k && k !== oldKey)) return alert("Primary key already exists");
    setDb((d) => ({ ...d, [t]: oldKey == null ? [...d[t], row] : d[t].map((r) => (keyOf(t, r) === oldKey ? row : r)) }));
    setForm(null); setDrawer(null);
  };
  const del = (t, row) => {
    const references = getReferences(db, t, row);
    if (references.length) {
      alert(`Cannot delete: referenced by ${references.join(", ")}`);
      return;
    }
    if (confirm("Delete this row?")) {
      setDb((d) => ({ ...d, [t]: d[t].filter((r) => r !== row) }));
      setDrawer(null);
    }
  };
  const vars = { "--bg": dark ? "#0b1020" : "#f1f5f9", "--card": dark ? "#141a2e" : "#ffffff", "--text": dark ? "#e5e7eb" : "#0f172a", "--muted": dark ? "#94a3b8" : "#64748b", "--line": dark ? "#26304d" : "#e2e8f0", "--accent": accent };
  const go = (v) => { setView(v); setSide(false); };
  const nav = (n, label = n) => (
    <button key={n} onClick={() => go(n)} className="flex w-full justify-between rounded-lg px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/10" style={view === n ? { ...acc, color: "#fff" } : {}}>
      <span>{label}</span>{db[n] && <span className="text-xs opacity-60">{db[n].length}</span>}</button>);
  return (
    <div style={vars} className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside className={`fixed inset-y-0 left-0 z-20 w-56 space-y-4 overflow-y-auto bg-slate-900 p-4 transition-transform md:static md:translate-x-0 ${side ? "" : "-translate-x-full"}`}>
        <h1 className="text-lg font-bold text-white">🏛️ Museum Admin</h1>
        <div className="space-y-1">{nav("Overview", "📊 Overview")}{nav("Gallery", "🖼️ Gallery")}</div>
        {Object.entries(GROUPS).map(([g, ts]) => <div key={g}><p className="mb-1 px-3 text-xs uppercase text-slate-500">{g}</p><div className="space-y-0.5">{ts.map((t) => nav(t))}</div></div>)}
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--card)] px-5 py-3">
          <button className="md:hidden" onClick={() => setSide(!side)}>☰</button>
          <h2 className="font-semibold">{view}</h2>
          <button className={inp + " ml-auto text-[var(--muted)]"} onClick={() => setPal(true)}>Search… <kbd className="ml-2 text-xs">Ctrl+K</kbd></button>
          {view === "Overview" && <div className="relative"><button className={inp} onClick={() => setMenu(!menu)}>Widgets ▾</button>
            {menu && <div className={card + " absolute right-0 z-10 mt-1 w-40 space-y-1 text-sm"}>{Object.keys(w).map((k) => <label key={k} className="flex gap-2"><input type="checkbox" checked={!!w[k]} onChange={() => setW({ ...w, [k]: w[k] ? 0 : 1 })} />{k}</label>)}</div>}</div>}
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} title="Accent color" className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent" />
          <button className={inp} onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
        </header>
        <main className="p-5">
          {view === "Overview" ? <Overview db={db} w={w} open={open} alerts={alerts} /> : view === "Gallery" ? <Gallery db={db} open={open} /> : <DataTable key={view} t={view} db={db} open={open} onAdd={() => setForm({ t: view })} />}
        </main>
      </div>
      {drawer && <Drawer d={drawer} db={db} open={open} close={() => setDrawer(null)} onEdit={(t, row) => setForm({ t, init: row })} onDel={del} />}
      {form && <Form t={form.t} init={form.init} db={db} onSave={save} close={() => setForm(null)} />}
      {pal && <Palette db={db} open={open} go={go} close={() => setPal(false)} />}
    </div>
  );
}
