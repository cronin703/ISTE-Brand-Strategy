"use client";

import { useState } from "react";

/** "How many kids?" plus a name and weekly amount for each. */
export function KidCountFields({ defaultCount, defaultBase }: { defaultCount: number; defaultBase: string }) {
  const [count, setCount] = useState(defaultCount);
  return (
    <div className="kid-count">
      <div className="field">
        <label htmlFor="kidCount">How many kids?</label>
        <select id="kidCount" name="kidCount" className="text-input" value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ maxWidth: 120 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="kid-count-row">
          <div className="field">
            <label htmlFor={`kid_name_${i}`}>Kid {i + 1} name</label>
            <input id={`kid_name_${i}`} name={`kid_name_${i}`} className="text-input" maxLength={40} required />
          </div>
          <div className="field">
            <label htmlFor={`kid_base_${i}`}>Weekly</label>
            <span className="money-input">
              <span aria-hidden="true">$</span>
              <input id={`kid_base_${i}`} name={`kid_base_${i}`} inputMode="decimal" defaultValue={defaultBase} required />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
