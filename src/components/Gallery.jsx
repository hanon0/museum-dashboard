import { useState } from "react";
import { artworkIcons, subtypes } from "../data/museumSchema.js";
import {
  accentStyle,
  cardClass,
  formatNumber,
  getArtworkName,
  getArtworkSubtype,
  inputClass,
} from "../utils/museum.js";

export default function Gallery({ database, openRecord }) {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("price");

  const artworks = database.Art_object.map((artwork) => ({
    artwork,
    subtype: getArtworkSubtype(database, artwork.id),
  }))
    .filter(({ subtype }) => filter === "All" || subtype === filter)
    .sort(({ artwork: first }, { artwork: second }) =>
      sortBy === "price"
        ? second.price - first.price
        : first.id - second.id,
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["All", ...subtypes].map((subtype) => (
          <button
            key={subtype}
            onClick={() => setFilter(subtype)}
            className={inputClass}
            style={
              filter === subtype ? { ...accentStyle, color: "#fff" } : {}
            }
          >
            {subtype}
          </button>
        ))}
        <select
          className={`${inputClass} ml-auto`}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="price">Sort: price</option>
          <option value="id">Sort: id</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {artworks.map(({ artwork, subtype }) => {
          const activeLoan = database.Borrowe_from.find(
            (loan) =>
              loan.Art_object_id === artwork.id && !loan.returnDate,
          );
          const firstHue = (artwork.id * 67) % 360;
          const secondHue = (firstHue + 60) % 360;

          return (
            <button
              key={artwork.id}
              onClick={() => openRecord("Art_object", artwork)}
              className={`${cardClass} text-left transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <div
                className="relative flex h-36 items-center justify-center rounded-xl text-5xl"
                style={{
                  background: `linear-gradient(135deg,hsl(${firstHue} 70% 60%),hsl(${secondHue} 70% 35%))`,
                }}
              >
                {artworkIcons[subtype] || "❓"}
                {activeLoan && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                    On loan · {activeLoan.Museum_name}
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold">
                {getArtworkName(database, artwork.id)}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {artwork.Artist_name} · {subtype || "unclassified"}
              </p>
              <p className="mt-1 text-sm">{formatNumber(artwork.price)} $</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
