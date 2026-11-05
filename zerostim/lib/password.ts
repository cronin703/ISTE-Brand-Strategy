import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** "scrypt$<salt>$<hash>", both base64url. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 32);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Readable temporary password, e.g. "maple-comet-pixel42". */
export function tempPassword(): string {
  const words = ["maple", "comet", "pixel", "otter", "mango", "river", "cedar", "banjo", "lemon", "tiger", "rocket", "pickle"];
  const pick = () => words[randomBytes(1)[0] % words.length];
  return `${pick()}-${pick()}-${pick()}${10 + (randomBytes(1)[0] % 90)}`;
}
