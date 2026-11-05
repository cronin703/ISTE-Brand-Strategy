import type { KidColor } from "@/lib/family";

// Default avatar: the kid's initial on their color. No uploads needed.
export function Avatar({ color, name, size = 40 }: { color: KidColor | "parent"; name: string; size?: number }) {
  return (
    <span className="avatar" data-kid={color} aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
