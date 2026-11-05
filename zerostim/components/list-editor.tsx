"use client";

import { useRef, useState } from "react";

type Row = { key: string; id: string; label: string; amount?: string };

let n = 0;
const newKey = () => `new-${++n}`;

/**
 * Editable list for Settings: one row per item with a remove button, and an
 * "Add" button. Posts `${prefix}_count`, `${prefix}_id_i`, `${prefix}_label_i`
 * (and `${prefix}_amt_i` when withAmount).
 */
export function ListEditor({
  prefix,
  initial,
  withAmount = false,
  addLabel,
  itemName,
}: {
  prefix: string;
  initial: { id: string; label: string; amount?: string }[];
  withAmount?: boolean;
  addLabel: string;
  itemName: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((r) => ({ ...r, key: r.id || newKey() })));
  const list = useRef<HTMLUListElement>(null);

  function add() {
    setRows((r) => [...r, { key: newKey(), id: "", label: "", amount: withAmount ? "" : undefined }]);
    // Focus the new row's name field once it renders.
    requestAnimationFrame(() => {
      const inputs = list.current?.querySelectorAll<HTMLInputElement>("input[data-name]");
      inputs?.[inputs.length - 1]?.focus();
    });
  }

  function remove(key: string, i: number) {
    setRows((r) => r.filter((x) => x.key !== key));
    // Keep focus in the list: the row that moved up, or the add button.
    requestAnimationFrame(() => {
      const btns = list.current?.querySelectorAll<HTMLButtonElement>("button[data-remove]");
      (btns?.[Math.min(i, (btns?.length ?? 1) - 1)] ?? list.current?.nextElementSibling as HTMLElement | null)?.focus();
    });
  }

  const update = (key: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  return (
    <div className="list-editor">
      <input type="hidden" name={`${prefix}_count`} value={rows.length} />
      {rows.length === 0 && <p className="muted small">No {itemName}s yet.</p>}
      <ul ref={list} className="le-rows">
        {rows.map((r, i) => (
          <li key={r.key} className={withAmount ? "le-row le-row-amt" : "le-row"}>
            <input type="hidden" name={`${prefix}_id_${i}`} value={r.id} />
            <label className="sr-only" htmlFor={`${prefix}_label_${i}`}>{`${itemName} ${i + 1}`}</label>
            <input
              id={`${prefix}_label_${i}`}
              name={`${prefix}_label_${i}`}
              data-name
              value={r.label}
              onChange={(e) => update(r.key, { label: e.target.value })}
              placeholder={`New ${itemName}`}
              maxLength={80}
              className="le-name"
            />
            {withAmount && (
              <span className="money-input le-amt">
                <span aria-hidden="true">$</span>
                <label className="sr-only" htmlFor={`${prefix}_amt_${i}`}>{`Amount for ${r.label || `${itemName} ${i + 1}`}`}</label>
                <input
                  id={`${prefix}_amt_${i}`}
                  name={`${prefix}_amt_${i}`}
                  inputMode="decimal"
                  value={r.amount ?? ""}
                  onChange={(e) => update(r.key, { amount: e.target.value })}
                  placeholder="0.00"
                />
              </span>
            )}
            <button
              type="button"
              className="le-remove"
              data-remove
              onClick={() => remove(r.key, i)}
              aria-label={`Remove ${r.label || `${itemName} ${i + 1}`}`}
              title="Remove"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn le-add" onClick={add}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {addLabel}
      </button>
    </div>
  );
}
