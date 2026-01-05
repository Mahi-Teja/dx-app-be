import { userQuery } from "../modules/user/user.query.js";

export function normalizeUsername(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
}

export async function generateUniqueUsername(base) {
  let username = base;
  let exists = await userQuery.findOne({ username });

  while (exists) {
    const suffix = Math.floor(100 + Math.random() * 900);
    username = `${base}${suffix}`;
    exists = await userQuery.findOne({ username });
  }

  return username;
}
