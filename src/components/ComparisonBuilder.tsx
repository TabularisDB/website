"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FEATURE_LABELS, products, type Product } from "@/lib/products";

const TABULARIS_ID = "tabularis";

export function ComparisonBuilder() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    TABULARIS_ID,
    "dbeaver",
  ]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [selectedIds],
  );

  const available = useMemo(
    () => products.filter((p) => !selectedIds.includes(p.id)),
    [selectedIds],
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [pickerOpen]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      el.classList.toggle("is-scrollable", scrollable);
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selected.length]);

  function add(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPickerOpen(false);
  }

  function remove(id: string) {
    if (id === TABULARIS_ID) return;
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function reset() {
    setSelectedIds([TABULARIS_ID, "dbeaver"]);
  }

  return (
    <section className="comparison-builder">
      <header className="comparison-builder-header">
        <div>
          <h2 className="comparison-builder-title">Build your own comparison</h2>
          <p className="comparison-builder-subtitle">
            Pin Tabularis, add competitors, and see the feature matrix side by side.
          </p>
        </div>
        {selected.length > 2 && (
          <button
            type="button"
            onClick={reset}
            className="comparison-builder-reset"
          >
            Reset
          </button>
        )}
      </header>

      <div className="comparison-builder-chips">
        {selected.map((p) => (
          <div key={p.id} className="comparison-chip">
            <Image
              src={p.logo}
              alt={`${p.name} logo`}
              width={p.width}
              height={p.height}
              loading="lazy"
              className="comparison-chip-logo"
            />
            <span className="comparison-chip-name">{p.name}</span>
            {p.id === TABULARIS_ID ? (
              <span className="comparison-chip-pin" aria-label="pinned">
                ★
              </span>
            ) : (
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="comparison-chip-remove"
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}

        <div className="comparison-picker-anchor" ref={pickerRef}>
          <button
            type="button"
            className="comparison-add-button"
            onClick={() => setPickerOpen((v) => !v)}
            disabled={available.length === 0}
          >
            <span className="comparison-add-icon">+</span>
            <span>{available.length === 0 ? "All added" : "Add competitor"}</span>
          </button>

          {pickerOpen && available.length > 0 && (
            <div className="comparison-picker" role="listbox">
              {available.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => add(p.id)}
                  className="comparison-picker-item"
                  role="option"
                >
                  <Image
                    src={p.logo}
                    alt={`${p.name} logo`}
                    width={p.width}
                    height={p.height}
                    loading="lazy"
                    className="comparison-picker-logo"
                  />
                  <div className="comparison-picker-info">
                    <span className="comparison-picker-name">{p.name}</span>
                    <span className="comparison-picker-tagline">{p.tagline}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="comparison-table-wrapper" ref={wrapperRef}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              {selected.map((p) => (
                <th key={p.id}>
                  <span className="comparison-th-cell">
                    <Image
                      src={p.logo}
                      alt={`${p.name} logo`}
                      width={p.width}
                      height={p.height}
                      loading="lazy"
                      className="comparison-logo"
                    />
                    <span>{p.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_LABELS.map((f) => (
              <tr key={f.key}>
                <td>{f.label}</td>
                {selected.map((p) => (
                  <td key={p.id} data-product={p.name}>
                    <span className="comparison-mobile-label">
                      <Image
                        src={p.logo}
                        alt={`${p.name} logo`}
                        width={p.width}
                        height={p.height}
                        loading="lazy"
                        className="comparison-mobile-logo"
                      />
                      <span>{p.name}</span>
                    </span>
                    <span className="comparison-cell-value">
                      {p.features[f.key] ?? "—"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
