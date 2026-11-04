// Default avatar: the person's initial on their color. No uploads needed.
export function Avatar({ id, name, size = 40 }: { id: string; name: string; size?: number }) {
  return (
    <span
      className="avatar"
      data-kid={id}
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
