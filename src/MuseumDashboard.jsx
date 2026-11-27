import { useEffect, useMemo, useState } from "react";
import CommandPalette from "./components/CommandPalette.jsx";
import DataTable from "./components/DataTable.jsx";
import Gallery from "./components/Gallery.jsx";
import Overview from "./components/Overview.jsx";
import RecordDrawer from "./components/RecordDrawer.jsx";
import RecordForm from "./components/RecordForm.jsx";
import seedDatabase from "./data/museumSeed.json";
import { groups } from "./data/museumSchema.js";
import {
  accentStyle,
  cardClass,
  getIntegrityAlerts,
  getRecordKey,
  getRecordReferences,
  inputClass,
} from "./utils/museum.js";

const initialWidgets = {
  kpi: true,
  value: true,
  roles: true,
  timeline: true,
  alerts: true,
};

export default function MuseumDashboard() {
  const [database, setDatabase] = useState(seedDatabase);
  const [currentView, setCurrentView] = useState("Overview");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [widgets, setWidgets] = useState(initialWidgets);

  const alerts = useMemo(() => getIntegrityAlerts(database), [database]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setShowPalette((visible) => !visible);
      }

      if (event.key === "Escape") {
        setShowPalette(false);
        setSelectedRecord(null);
        setActiveForm(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openRecord = (table, row) => {
    if (row) setSelectedRecord({ table, row });
  };

  const saveRecord = (table, row, oldKey) => {
    const newKey = getRecordKey(table, row);
    const duplicate = database[table].some(
      (record) =>
        getRecordKey(table, record) === newKey && newKey !== oldKey,
    );

    if (duplicate) {
      alert("Primary key already exists");
      return;
    }

    setDatabase((current) => ({
      ...current,
      [table]:
        oldKey == null
          ? [...current[table], row]
          : current[table].map((record) =>
              getRecordKey(table, record) === oldKey ? row : record,
            ),
    }));
    setActiveForm(null);
    setSelectedRecord(null);
  };

  const deleteRecord = (table, row) => {
    const references = getRecordReferences(database, table, row);

    if (references.length) {
      alert(`Cannot delete: referenced by ${references.join(", ")}`);
      return;
    }

    if (confirm("Delete this row?")) {
      setDatabase((current) => ({
        ...current,
        [table]: current[table].filter((record) => record !== row),
      }));
      setSelectedRecord(null);
    }
  };

  const themeVariables = {
    "--bg": darkMode ? "#0b1020" : "#f1f5f9",
    "--card": darkMode ? "#141a2e" : "#ffffff",
    "--text": darkMode ? "#e5e7eb" : "#0f172a",
    "--muted": darkMode ? "#94a3b8" : "#64748b",
    "--line": darkMode ? "#26304d" : "#e2e8f0",
    "--accent": accentColor,
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setShowSidebar(false);
  };

  const renderNavigationButton = (name, label = name) => (
    <button
      key={name}
      onClick={() => navigateTo(name)}
      className="flex w-full justify-between rounded-lg px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-white/10"
      style={currentView === name ? { ...accentStyle, color: "#fff" } : {}}
    >
      <span>{label}</span>
      {database[name] && (
        <span className="text-xs opacity-60">{database[name].length}</span>
      )}
    </button>
  );

  return (
    <div
      style={themeVariables}
      className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]"
    >
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-56 space-y-4 overflow-y-auto bg-slate-900 p-4 transition-transform md:static md:translate-x-0 ${
          showSidebar ? "" : "-translate-x-full"
        }`}
      >
        <h1 className="text-lg font-bold text-white">🏛️ Museum Admin</h1>
        <div className="space-y-1">
          {renderNavigationButton("Overview", "📊 Overview")}
          {renderNavigationButton("Gallery", "🖼️ Gallery")}
        </div>

        {Object.entries(groups).map(([groupName, tables]) => (
          <div key={groupName}>
            <p className="mb-1 px-3 text-xs uppercase text-slate-500">
              {groupName}
            </p>
            <div className="space-y-0.5">
              {tables.map((table) => renderNavigationButton(table))}
            </div>
          </div>
        ))}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--card)] px-5 py-3">
          <button
            className="md:hidden"
            onClick={() => setShowSidebar((visible) => !visible)}
          >
            ☰
          </button>
          <h2 className="font-semibold">{currentView}</h2>
          <button
            className={`${inputClass} ml-auto text-[var(--muted)]`}
            onClick={() => setShowPalette(true)}
          >
            Search… <kbd className="ml-2 text-xs">Ctrl+K</kbd>
          </button>

          {currentView === "Overview" && (
            <div className="relative">
              <button
                className={inputClass}
                onClick={() => setShowWidgetMenu((visible) => !visible)}
              >
                Widgets ▾
              </button>
              {showWidgetMenu && (
                <div
                  className={`${cardClass} absolute right-0 z-10 mt-1 w-40 space-y-1 text-sm`}
                >
                  {Object.keys(widgets).map((widget) => (
                    <label key={widget} className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={widgets[widget]}
                        onChange={() =>
                          setWidgets((current) => ({
                            ...current,
                            [widget]: !current[widget],
                          }))
                        }
                      />
                      {widget}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <input
            type="color"
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            title="Accent color"
            className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
          />
          <button
            className={inputClass}
            onClick={() => setDarkMode((enabled) => !enabled)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </header>

        <main className="p-5">
          {currentView === "Overview" ? (
            <Overview
              database={database}
              widgets={widgets}
              openRecord={openRecord}
              alerts={alerts}
            />
          ) : currentView === "Gallery" ? (
            <Gallery database={database} openRecord={openRecord} />
          ) : (
            <DataTable
              key={currentView}
              table={currentView}
              database={database}
              openRecord={openRecord}
              onAdd={() => setActiveForm({ table: currentView })}
            />
          )}
        </main>
      </div>

      {selectedRecord && (
        <RecordDrawer
          selection={selectedRecord}
          database={database}
          openRecord={openRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={(table, row) => setActiveForm({ table, initialRow: row })}
          onDelete={deleteRecord}
        />
      )}
      {activeForm && (
        <RecordForm
          table={activeForm.table}
          initialRow={activeForm.initialRow}
          database={database}
          onSave={saveRecord}
          onClose={() => setActiveForm(null)}
        />
      )}
      {showPalette && (
        <CommandPalette
          database={database}
          openRecord={openRecord}
          goToView={navigateTo}
          onClose={() => setShowPalette(false)}
        />
      )}
    </div>
  );
}
