import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function sessionHash(token) { return createHash('sha256').update(token).digest('hex'); }
export function readSession(req) {
  const cookie = req.headers.cookie?.split(';').map(item => item.trim()).find(item => item.startsWith('session='));
  return cookie?.slice(8);
}
export function sessionCookie(token, expires = 604800) {
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${expires}${process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''}`;
}
