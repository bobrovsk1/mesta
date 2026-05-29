import fs from "node:fs/promises";
import fssync from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import sharp from "sharp";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4323);
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = path.join(__dirname, "data");
const DIST_DIR = path.join(__dirname, "dist");
const PUBLIC_DIR = path.join(__dirname, "public");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PLACE_UPLOADS_DIR = path.join(UPLOADS_DIR, "places");
const AVATAR_UPLOADS_DIR = path.join(UPLOADS_DIR, "avatars");
const IMAGE_MAX_WIDTH = 1600;
const WEBP_QUALITY = 75;
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const AUTH_COOKIE = "mesta_token";

const files = {
  users: path.join(DATA_DIR, "users.json"),
  places: path.join(DATA_DIR, "places.json"),
  reactions: path.join(DATA_DIR, "reactions.json"),
  settings: path.join(DATA_DIR, "settings.json"),
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const seedSettings = {
  theme: {
    activeSeason: "summer",
    seasons: {
      summer: {
        label: "Р›РµС‚Рѕ",
        topGlow: "rgba(255, 196, 88, 0.24)",
        bottomGlow: "rgba(96, 169, 110, 0.18)",
        accent: "#c96031",
        accentDeep: "#8b391a",
        surface: "rgba(255, 251, 245, 0.9)",
      },
      autumn: {
        label: "РћСЃРµРЅСЊ",
        topGlow: "rgba(214, 133, 61, 0.28)",
        bottomGlow: "rgba(151, 83, 45, 0.16)",
        accent: "#b45b2f",
        accentDeep: "#7b3418",
        surface: "rgba(255, 248, 241, 0.92)",
      },
      winter: {
        label: "Р—РёРјР°",
        topGlow: "rgba(167, 213, 255, 0.26)",
        bottomGlow: "rgba(100, 138, 198, 0.14)",
        accent: "#4a83c4",
        accentDeep: "#2d5b97",
        surface: "rgba(248, 252, 255, 0.9)",
      },
      spring: {
        label: "Р’РµСЃРЅР°",
        topGlow: "rgba(177, 223, 136, 0.24)",
        bottomGlow: "rgba(255, 183, 137, 0.14)",
        accent: "#5c9d47",
        accentDeep: "#33692a",
        surface: "rgba(251, 255, 246, 0.9)",
      },
    },
  },
};

const seedPlaces = [
  {
    id: 1,
    title: "РљСЂР°СЃРёРІРѕРµ РѕР·РµСЂРѕ",
    lat: 62.035,
    lng: 129.742,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    description: "РўРёС…РѕРµ РјРµСЃС‚Рѕ РЅРµРґР°Р»РµРєРѕ РѕС‚ РіРѕСЂРѕРґР°, РєСѓРґР° СѓРґРѕР±РЅРѕ СѓРµС…Р°С‚СЊ РЅР° РґРµРЅСЊ СЂР°РґРё РІРѕРґС‹, С‚РёС€РёРЅС‹ Рё СЃРїРѕРєРѕР№РЅРѕРіРѕ РѕС‚РґС‹С…Р°.",
    routeDescription: "РР· РЇРєСѓС‚СЃРєР° РІС‹РµР·Р¶Р°С‚СЊ СѓС‚СЂРѕРј РїРѕ РџРѕРєСЂРѕРІСЃРєРѕРјСѓ С‚СЂР°РєС‚Сѓ, Р·Р°С‚РµРј СЃРІРµСЂРЅСѓС‚СЊ РЅР° Р»РѕРєР°Р»СЊРЅСѓСЋ РґРѕСЂРѕРіСѓ Рє Р±РµСЂРµРіСѓ.",
    bestTransport: "Р›СѓС‡С€Рµ РІСЃРµРіРѕ РµС…Р°С‚СЊ РЅР° Р»РµРіРєРѕРІРѕРј Р°РІС‚РѕРјРѕР±РёР»Рµ РёР»Рё РєСЂРѕСЃСЃРѕРІРµСЂРµ РІ СЃСѓС…СѓСЋ РїРѕРіРѕРґСѓ.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: 2,
    title: "РЎРјРѕС‚СЂРѕРІР°СЏ РЅР°Рґ Р›РµРЅРѕР№",
    lat: 61.985,
    lng: 129.61,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    description: "Р’С‹СЃРѕРєР°СЏ С‚РѕС‡РєР° СЃ С€РёСЂРѕРєРёРј РѕР±Р·РѕСЂРѕРј РЅР° СЂРµРєСѓ Рё РїСЂРѕСЃС‚РѕСЂ, РєСѓРґР° Р»СЋР±СЏС‚ РїСЂРёРµР·Р¶Р°С‚СЊ Р·Р° Р·Р°РєР°С‚Р°РјРё.",
    routeDescription: "Р”РІРёРіР°С‚СЊСЃСЏ С‡РµСЂРµР· РџРѕРєСЂРѕРІСЃРє, Р·Р°С‚РµРј РїРѕРґРЅСЏС‚СЊСЃСЏ РїРѕ РіСЂСѓРЅС‚РѕРІРѕР№ РґРѕСЂРѕРіРµ Рє РІРёРґРѕРІРѕР№ РїР»РѕС‰Р°РґРєРµ.",
    bestTransport: "РћРїС‚РёРјР°Р»СЊРЅРѕ РµС…Р°С‚СЊ РЅР° РјР°С€РёРЅРµ СЃ С…РѕСЂРѕС€РёРј РєР»РёСЂРµРЅСЃРѕРј, РѕСЃРѕР±РµРЅРЅРѕ РїРѕСЃР»Рµ РѕСЃР°РґРєРѕРІ.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
];

function loadEnvFile(filePath) {
  if (!fssync.existsSync(filePath)) {
    return;
  }

  const raw = fssync.readFileSync(filePath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a PostgreSQL database and add DATABASE_URL to .env. Example: postgresql://postgres:postgres@127.0.0.1:5432/mesta"
  );
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const weatherCache = new Map();

function json(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function noContent(res, headers = {}) {
  res.writeHead(204, headers);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 50_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function readJsonFile(filePath, fallbackData) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw ? JSON.parse(raw) : fallbackData;
  } catch {
    return fallbackData;
  }
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeLogin(value) {
  return cleanString(value).toLowerCase();
}

function publicUser(user) {
  return {
    id: user.id,
    login: user.login,
    nickname: user.nickname,
    avatar: user.avatar || "",
    instagram: user.instagram || "",
    vk: user.vk || "",
    whatsapp: user.whatsapp || "",
    telegram: user.telegram || "",
    role: user.role || "user",
  };
}

function makeAuthCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}

function clearAuthCookie() {
  return `${AUTH_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return index === -1
          ? [decodeURIComponent(item), ""]
          : [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function getAuthToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return parseCookies(req)[AUTH_COOKIE] || "";
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
}

async function findUserByToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [payload.sub]);
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

async function requireUser(req, res) {
  const user = await findUserByToken(getAuthToken(req));
  if (!user) {
    json(res, 401, { error: "РќСѓР¶РЅРѕ РІРѕР№С‚Рё РІ Р°РєРєР°СѓРЅС‚" });
    return null;
  }
  return user;
}

function isModerator(user) {
  return user?.role === "moderator" || user?.role === "admin";
}

async function requireModerator(req, res) {
  const user = await requireUser(req, res);
  if (!user) {
    return null;
  }
  if (!isModerator(user)) {
    json(res, 403, { error: "РњРѕРґРµСЂР°С†РёСЏ РґРѕСЃС‚СѓРїРЅР° С‚РѕР»СЊРєРѕ moderator/admin" });
    return null;
  }
  return user;
}

function ensureFiniteCoordinate(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`РќРµРєРѕСЂСЂРµРєС‚РЅР°СЏ ${label}`);
  }
  return number;
}

function isValidUrl(value) {
  if (!value) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeProfile(input) {
  const profile = {
    nickname: cleanString(input.nickname),
    avatar: cleanString(input.avatar),
    instagram: cleanString(input.instagram),
    vk: cleanString(input.vk),
    whatsapp: cleanString(input.whatsapp),
    telegram: cleanString(input.telegram),
  };

  if (!profile.nickname) {
    throw new Error("РЈРєР°Р¶РёС‚Рµ РЅРёРєРЅРµР№Рј");
  }
  if (profile.avatar && !profile.avatar.startsWith("/uploads/avatars/") && !isValidUrl(profile.avatar)) {
    throw new Error("Некорректный путь аватара");
  }
  if (!isValidUrl(profile.instagram)) {
    throw new Error("Instagram РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ СЃСЃС‹Р»РєРѕР№");
  }
  if (!isValidUrl(profile.vk)) {
    throw new Error("VK РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ СЃСЃС‹Р»РєРѕР№");
  }
  if (!isValidUrl(profile.telegram)) {
    throw new Error("Telegram РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ СЃСЃС‹Р»РєРѕР№");
  }

  return profile;
}

function sanitizeCredentials(input, { requireNickname = false } = {}) {
  const login = normalizeLogin(input.login);
  const password = String(input.password || "");
  const profile = sanitizeProfile({
    ...input,
    nickname: cleanString(input.nickname) || login,
  });

  if (!/^[a-z0-9_.-]{3,32}$/.test(login)) {
    throw new Error("Р›РѕРіРёРЅ: 3-32 СЃРёРјРІРѕР»Р°, Р»Р°С‚РёРЅРёС†Р°, С†РёС„СЂС‹, С‚РѕС‡РєР°, РґРµС„РёСЃ РёР»Рё РїРѕРґС‡С‘СЂРєРёРІР°РЅРёРµ");
  }
  if (password.length < 6) {
    throw new Error("РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РЅРµ РєРѕСЂРѕС‡Рµ 6 СЃРёРјРІРѕР»РѕРІ");
  }
  if (requireNickname && !profile.nickname) {
    throw new Error("РЈРєР°Р¶РёС‚Рµ РЅРёРєРЅРµР№Рј");
  }

  return { login, password, profile };
}

function sanitizePlace(input) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  const place = {
    title: cleanString(input.title),
    image: cleanString(input.image),
    description: cleanString(input.description),
    routeDescription: cleanString(input.routeDescription),
    bestTransport: cleanString(input.bestTransport),
    lat,
    lng,
  };

  if (!place.title) {
    throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ РјРµСЃС‚Р°");
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error("РќРµРєРѕСЂСЂРµРєС‚РЅР°СЏ С€РёСЂРѕС‚Р°");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error("РќРµРєРѕСЂСЂРµРєС‚РЅР°СЏ РґРѕР»РіРѕС‚Р°");
  }
  if (!place.description) {
    throw new Error("Р”РѕР±Р°РІСЊС‚Рµ РѕРїРёСЃР°РЅРёРµ РјРµСЃС‚Р°");
  }
  if (!place.routeDescription) {
    throw new Error("Р”РѕР±Р°РІСЊС‚Рµ РѕРїРёСЃР°РЅРёРµ РјР°СЂС€СЂСѓС‚Р°");
  }
  if (!place.bestTransport) {
    throw new Error("Р”РѕР±Р°РІСЊС‚Рµ РѕРїРёСЃР°РЅРёРµ С‚СЂР°РЅСЃРїРѕСЂС‚Р°");
  }
  if (!place.image) {
    throw new Error("Р”РѕР±Р°РІСЊС‚Рµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ");
  }
  if (!place.image.startsWith("/uploads/") && !isValidUrl(place.image)) {
    throw new Error("РР·РѕР±СЂР°Р¶РµРЅРёРµ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ СЃСЃС‹Р»РєРѕР№ РёР»Рё Р·Р°РіСЂСѓР¶РµРЅРЅС‹Рј С„Р°Р№Р»РѕРј");
  }

  return place;
}

function formatHourLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || "").slice(11, 16);
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function describeWeatherCode(code) {
  const descriptions = {
    0: "РЇСЃРЅРѕ",
    1: "РџСЂРµРёРјСѓС‰РµСЃС‚РІРµРЅРЅРѕ СЏСЃРЅРѕ",
    2: "РџРµСЂРµРјРµРЅРЅР°СЏ РѕР±Р»Р°С‡РЅРѕСЃС‚СЊ",
    3: "РџР°СЃРјСѓСЂРЅРѕ",
    45: "РўСѓРјР°РЅ",
    48: "РР·РјРѕСЂРѕР·СЊ Рё С‚СѓРјР°РЅ",
    51: "РЎР»Р°Р±Р°СЏ РјРѕСЂРѕСЃСЊ",
    53: "РњРѕСЂРѕСЃСЊ",
    55: "РЎРёР»СЊРЅР°СЏ РјРѕСЂРѕСЃСЊ",
    56: "РЎР»Р°Р±Р°СЏ Р»РµРґСЏРЅР°СЏ РјРѕСЂРѕСЃСЊ",
    57: "Р›РµРґСЏРЅР°СЏ РјРѕСЂРѕСЃСЊ",
    61: "РЎР»Р°Р±С‹Р№ РґРѕР¶РґСЊ",
    63: "Р”РѕР¶РґСЊ",
    65: "РЎРёР»СЊРЅС‹Р№ РґРѕР¶РґСЊ",
    66: "РЎР»Р°Р±С‹Р№ Р»РµРґСЏРЅРѕР№ РґРѕР¶РґСЊ",
    67: "Р›РµРґСЏРЅРѕР№ РґРѕР¶РґСЊ",
    71: "РЎР»Р°Р±С‹Р№ СЃРЅРµРі",
    73: "РЎРЅРµРі",
    75: "РЎРёР»СЊРЅС‹Р№ СЃРЅРµРі",
    77: "РЎРЅРµР¶РЅС‹Рµ Р·РµСЂРЅР°",
    80: "РЎР»Р°Р±С‹Р№ Р»РёРІРµРЅСЊ",
    81: "Р›РёРІРµРЅСЊ",
    82: "РЎРёР»СЊРЅС‹Р№ Р»РёРІРµРЅСЊ",
    85: "РЎР»Р°Р±С‹Р№ СЃРЅРµРіРѕРїР°Рґ",
    86: "РЎРёР»СЊРЅС‹Р№ СЃРЅРµРіРѕРїР°Рґ",
    95: "Р“СЂРѕР·Р°",
    96: "Р“СЂРѕР·Р° СЃ РіСЂР°РґРѕРј",
    99: "РЎРёР»СЊРЅР°СЏ РіСЂРѕР·Р° СЃ РіСЂР°РґРѕРј",
  };
  return descriptions[Number(code)] || "РџРѕРіРѕРґР° Р±РµР· РѕРїРёСЃР°РЅРёСЏ";
}

async function initSchema() {
  await fs.mkdir(PLACE_UPLOADS_DIR, { recursive: true });
  await fs.mkdir(AVATAR_UPLOADS_DIR, { recursive: true });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      instagram TEXT NOT NULL DEFAULT '',
      vk TEXT NOT NULL DEFAULT '',
      whatsapp TEXT NOT NULL DEFAULT '',
      telegram TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      route_description TEXT NOT NULL,
      best_transport TEXT NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_by_nickname TEXT NOT NULL DEFAULT 'Unknown',
      review_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'published',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reactions (
      place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vote TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (place_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT NOT NULL DEFAULT ''");
}

async function countRows(table) {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return result.rows[0].count;
}

function legacyLoginFromUser(user, used) {
  const base = normalizeLogin(user.login || user.nickname || `user-${String(user.id).slice(0, 8)}`)
    .replace(/[^a-z0-9_.-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || `user-${String(user.id).slice(0, 8)}`;
  let candidate = base.length >= 3 ? base : `user-${base}`;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 20)}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

async function seedUsersIfEmpty(oldUsers, oldPlaces, oldReactions) {
  if (await countRows("users")) {
    return;
  }

  const byId = new Map();
  oldUsers.forEach((user) => byId.set(String(user.id), user));
  oldPlaces.forEach((place) => {
    if (place.createdBy && !byId.has(String(place.createdBy))) {
      byId.set(String(place.createdBy), {
        id: String(place.createdBy),
        nickname: place.createdByNickname || "Unknown",
        role: place.createdBy === "seed-system" ? "admin" : "user",
        createdAt: place.createdAt,
        updatedAt: place.createdAt,
      });
    }
  });
  Object.values(oldReactions).forEach((votes) => {
    Object.keys(votes || {}).forEach((userId) => {
      if (!byId.has(String(userId))) {
        byId.set(String(userId), {
          id: String(userId),
          nickname: "Legacy user",
          role: "user",
        });
      }
    });
  });

  const usedLogins = new Set();
  for (const user of byId.values()) {
    const login = legacyLoginFromUser(user, usedLogins);
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);
    await pool.query(
      `
        INSERT INTO users
          (id, login, password_hash, nickname, avatar, instagram, vk, whatsapp, telegram, role, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11::timestamptz, now()),COALESCE($12::timestamptz, now()))
        ON CONFLICT (id) DO NOTHING
      `,
      [
        String(user.id || crypto.randomUUID()),
        login,
        passwordHash,
        cleanString(user.nickname) || login,
        cleanString(user.avatar),
        cleanString(user.instagram),
        cleanString(user.vk),
        cleanString(user.whatsapp),
        cleanString(user.telegram),
        user.role === "admin" || user.role === "moderator" ? user.role : "user",
        user.createdAt || null,
        user.updatedAt || user.createdAt || null,
      ]
    );
  }
}

async function seedPlacesIfEmpty(oldPlaces) {
  if (await countRows("places")) {
    return;
  }

  for (const place of oldPlaces) {
    await pool.query(
      `
        INSERT INTO places
          (id, title, image, description, route_description, best_transport, lat, lng,
           created_by, created_by_nickname, review_status, status, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13::timestamptz, now()),COALESCE($14::timestamptz, now()))
        ON CONFLICT (id) DO NOTHING
      `,
      [
        Number(place.id),
        cleanString(place.title) || "Untitled",
        cleanString(place.image),
        cleanString(place.description),
        cleanString(place.routeDescription),
        cleanString(place.bestTransport),
        Number(place.lat),
        Number(place.lng),
        place.createdBy ? String(place.createdBy) : null,
        cleanString(place.createdByNickname) || "Unknown",
        cleanString(place.reviewStatus) || "pending",
        cleanString(place.status) || "published",
        place.createdAt || null,
        place.updatedAt || place.createdAt || null,
      ]
    );
  }
}

async function seedReactionsIfEmpty(oldReactions) {
  if (await countRows("reactions")) {
    return;
  }

  for (const [placeId, votes] of Object.entries(oldReactions)) {
    for (const [userId, vote] of Object.entries(votes || {})) {
      if (vote !== "like" && vote !== "dislike") {
        continue;
      }
      await pool.query(
        `
          INSERT INTO reactions (place_id, user_id, vote)
          VALUES ($1, $2, $3)
          ON CONFLICT (place_id, user_id) DO UPDATE SET vote = EXCLUDED.vote, updated_at = now()
        `,
        [Number(placeId), String(userId), vote]
      );
    }
  }
}

async function seedSettingsIfEmpty(settings) {
  if (await countRows("settings")) {
    return;
  }
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING",
    ["public", JSON.stringify(settings)]
  );
}

async function seedFromJsonIfEmpty() {
  const [oldUsers, oldPlacesRaw, oldReactions, oldSettings] = await Promise.all([
    readJsonFile(files.users, []),
    readJsonFile(files.places, seedPlaces),
    readJsonFile(files.reactions, {}),
    readJsonFile(files.settings, seedSettings),
  ]);
  const oldPlaces = Array.isArray(oldPlacesRaw) && oldPlacesRaw.length ? oldPlacesRaw : seedPlaces;

  await seedUsersIfEmpty(oldUsers, oldPlaces, oldReactions);
  await seedPlacesIfEmpty(oldPlaces);
  await seedReactionsIfEmpty(oldReactions);
  await seedSettingsIfEmpty(oldSettings || seedSettings);
}

function placeFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    description: row.description,
    routeDescription: row.route_description,
    bestTransport: row.best_transport,
    lat: Number(row.lat),
    lng: Number(row.lng),
    createdBy: row.created_by,
    createdByNickname: row.created_by_nickname,
    reviewStatus: row.review_status,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function computeReactionSummary(placeId, userId) {
  const result = await pool.query(
    `
      SELECT
        COUNT(*) FILTER (WHERE vote = 'like')::int AS likes,
        COUNT(*) FILTER (WHERE vote = 'dislike')::int AS dislikes,
        COALESCE(MAX(vote) FILTER (WHERE user_id = $2), '') AS user_vote
      FROM reactions
      WHERE place_id = $1
    `,
    [placeId, userId || ""]
  );
  const row = result.rows[0];
  return {
    likes: row.likes || 0,
    dislikes: row.dislikes || 0,
    userVote: row.user_vote || "",
  };
}

async function buildPlacesResponse(
  userId,
  { includeArchived = false, onlyUserId = null, onlyPending = false, publicVisible = true } = {}
) {
  const clauses = [];
  const params = [];
  if (!includeArchived) {
    clauses.push("status <> 'archived'");
  }
  if (onlyUserId) {
    params.push(onlyUserId);
    clauses.push(`created_by = $${params.length}`);
  }
  if (onlyPending) {
    clauses.push("review_status = 'pending'");
  }
  if (publicVisible && !onlyUserId && !onlyPending) {
    if (userId) {
      params.push(userId);
      clauses.push(`(review_status = 'approved' OR created_by = $${params.length})`);
    } else {
      clauses.push("review_status = 'approved'");
    }
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM places ${where} ORDER BY created_at DESC, id DESC`,
    params
  );

  return Promise.all(
    result.rows.map(async (row) => ({
      ...placeFromRow(row),
      reactions: await computeReactionSummary(row.id, userId),
    }))
  );
}

async function saveOptimizedImage({ dataUrl, originalName = "image", folder, publicPrefix }) {
  const imageDataUrl = cleanString(dataUrl);
  const imageName = cleanString(originalName) || "image";

  if (!imageDataUrl) {
    return "";
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ С„РѕСЂРјР°С‚ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ");
  }

  const mimeType = match[1];
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
    throw new Error("РџРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ JPG, PNG, WEBP Рё GIF");
  }

  const safeBaseName =
    imageName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-") || "image";
  const fileName = `${Date.now()}-${safeBaseName}.webp`;
  const filePath = path.join(folder, fileName);

  await fs.mkdir(folder, { recursive: true });

  await sharp(Buffer.from(match[2], "base64"))
    .rotate()
    .resize({ width: IMAGE_MAX_WIDTH, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(filePath);

  return `${publicPrefix}/${fileName}`;
}

async function savePlaceImage(payload) {
  const optimizedPath = await saveOptimizedImage({
    dataUrl: payload.imageDataUrl,
    originalName: payload.imageName,
    folder: PLACE_UPLOADS_DIR,
    publicPrefix: "/uploads/places",
  });

  return optimizedPath || cleanString(payload.image);
}

async function saveAvatarImage(payload) {
  return saveOptimizedImage({
    dataUrl: payload.avatarDataUrl,
    originalName: payload.avatarName || "avatar",
    folder: AVATAR_UPLOADS_DIR,
    publicPrefix: "/uploads/avatars",
  });
}

async function fetchWeatherByCoords(lat, lng) {
  const cacheKey = `${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(lat));
  weatherUrl.searchParams.set("longitude", String(lng));
  weatherUrl.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  weatherUrl.searchParams.set("hourly", "temperature_2m,wind_speed_10m,weather_code");
  weatherUrl.searchParams.set("forecast_days", "1");
  weatherUrl.searchParams.set("timezone", "auto");
  weatherUrl.searchParams.set("wind_speed_unit", "ms");

  const response = await fetch(weatherUrl);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.reason || "WEATHER_FETCH_FAILED");
  }

  const current = payload.current || payload.current_weather || {};
  const hourlyTimes = Array.isArray(payload.hourly?.time) ? payload.hourly.time : [];
  const hourlyTemps = Array.isArray(payload.hourly?.temperature_2m) ? payload.hourly.temperature_2m : [];
  const hourlyWinds = Array.isArray(payload.hourly?.wind_speed_10m) ? payload.hourly.wind_speed_10m : [];
  const hourlyCodes = Array.isArray(payload.hourly?.weather_code) ? payload.hourly.weather_code : [];
  const currentTime = current.time ? new Date(current.time).getTime() : Date.now();
  const currentTemp = current.temperature_2m ?? current.temperature;
  const currentWindSpeed = current.wind_speed_10m ?? current.windspeed;
  const currentWeatherCode = current.weather_code ?? current.weathercode;

  const nextHours = hourlyTimes
    .map((time, index) => ({
      time,
      temp: hourlyTemps[index],
      windSpeed: hourlyWinds[index],
      code: hourlyCodes[index],
    }))
    .filter((hour) => new Date(hour.time).getTime() > currentTime)
    .slice(0, 3);

  const normalized = {
    provider: "Open-Meteo",
    timezone: payload.timezone || "",
    current: {
      temp: Math.round(Number(currentTemp ?? 0)),
      windSpeed: Math.round(Number(currentWindSpeed ?? 0)),
      icon: "",
      description: describeWeatherCode(currentWeatherCode),
      observedAt: current.time || null,
    },
    hourly: nextHours.map((hour) => ({
      time: hour.time,
      label: formatHourLabel(hour.time),
      temp: Math.round(Number(hour.temp ?? 0)),
      windSpeed: Math.round(Number(hour.windSpeed ?? 0)),
      icon: "",
      description: describeWeatherCode(hour.code),
    })),
  };

  weatherCache.set(cacheKey, {
    data: normalized,
    expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
  });

  return normalized;
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath)
    .then((data) => {
      const ext = path.extname(filePath);
      res.writeHead(200, {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
      });
      res.end(data);
    })
    .catch(() => {
      res.writeHead(404);
      res.end("Not found");
    });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/api/health") {
    json(res, 200, { ok: true, service: "interesnye-mesta-server", storage: "postgresql" });
    return;
  }

  if (req.method === "GET" && pathname === "/api/settings/public") {
    const result = await pool.query("SELECT value FROM settings WHERE key = $1", ["public"]);
    json(res, 200, result.rows[0]?.value || seedSettings);
    return;
  }

  if (req.method === "GET" && pathname === "/api/weather/config") {
    json(res, 200, { provider: "Open-Meteo", requiresApiKey: false, hasApiKey: true });
    return;
  }

  if (req.method === "GET" && pathname === "/api/weather") {
    const lat = ensureFiniteCoordinate(url.searchParams.get("lat"), "широта");
    const lng = ensureFiniteCoordinate(url.searchParams.get("lng"), "долгота");

    try {
      json(res, 200, await fetchWeatherByCoords(lat, lng));
    } catch (error) {
      json(res, 502, { error: "Не удалось получить погоду", code: "weather_fetch_failed" });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    const { login, password, profile } = sanitizeCredentials(await readBody(req), { requireNickname: true });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      id: crypto.randomUUID(),
      login,
      ...profile,
      password_hash: passwordHash,
      role: "user",
    };

    try {
      const result = await pool.query(
        `
          INSERT INTO users (id, login, password_hash, nickname, avatar, instagram, vk, whatsapp, telegram, role)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          RETURNING *
        `,
        [
          user.id,
          user.login,
          user.password_hash,
          user.nickname,
          user.avatar,
          user.instagram,
          user.vk,
          user.whatsapp,
          user.telegram,
          user.role,
        ]
      );
      const token = signToken(result.rows[0]);
      json(res, 201, { user: publicUser(result.rows[0]) }, { "Set-Cookie": makeAuthCookie(token) });
    } catch (error) {
      if (error.code === "23505") {
        json(res, 409, { error: "РўР°РєРѕР№ Р»РѕРіРёРЅ СѓР¶Рµ Р·Р°РЅСЏС‚" });
        return;
      }
      throw error;
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const { login, password } = sanitizeCredentials(await readBody(req));
    const result = await pool.query("SELECT * FROM users WHERE login = $1", [login]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      json(res, 401, { error: "РќРµРІРµСЂРЅС‹Р№ Р»РѕРіРёРЅ РёР»Рё РїР°СЂРѕР»СЊ" });
      return;
    }
    const token = signToken(user);
    json(res, 200, { user: publicUser(user) }, { "Set-Cookie": makeAuthCookie(token) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/auth/me") {
    const user = await requireUser(req, res);
    if (!user) {
      return;
    }
    json(res, 200, { user: publicUser(user) });
    return;
  }

  if (req.method === "PATCH" && pathname === "/api/auth/me") {
    const authUser = await requireUser(req, res);
    if (!authUser) {
      return;
    }
    const rawPayload = await readBody(req);
    const avatar = await saveAvatarImage(rawPayload);
    const profile = sanitizeProfile({
      ...rawPayload,
      avatar: avatar || rawPayload.avatar || authUser.avatar || "",
    });
    const result = await pool.query(
      `
        UPDATE users
        SET nickname = $2, avatar = $3, instagram = $4, vk = $5, whatsapp = $6, telegram = $7, updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [authUser.id, profile.nickname, profile.avatar, profile.instagram, profile.vk, profile.whatsapp, profile.telegram]
    );
    json(res, 200, { user: publicUser(result.rows[0]) });
    return;
  }

  if (req.method === "DELETE" && pathname === "/api/auth/session") {
    noContent(res, { "Set-Cookie": clearAuthCookie() });
    return;
  }

  if (req.method === "GET" && pathname === "/api/places") {
    const user = await findUserByToken(getAuthToken(req));
    json(res, 200, { items: await buildPlacesResponse(user?.id) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/places/mine") {
    const user = await requireUser(req, res);
    if (!user) {
      return;
    }
    json(res, 200, { items: await buildPlacesResponse(user.id, { onlyUserId: user.id, publicVisible: false }) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/moderation/places") {
    const user = await requireModerator(req, res);
    if (!user) {
      return;
    }
    json(res, 200, {
      items: await buildPlacesResponse(user.id, {
        includeArchived: true,
        onlyPending: true,
        publicVisible: false,
      }),
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/places") {
    const user = await requireUser(req, res);
    if (!user) {
      return;
    }
    const rawPayload = await readBody(req);
    const image = await savePlaceImage(rawPayload);
    const payload = sanitizePlace({ ...rawPayload, image });
    const maxId = await pool.query("SELECT COALESCE(MAX(id), 0)::int + 1 AS id FROM places");
    const nextId = maxId.rows[0].id;
    const result = await pool.query(
      `
        INSERT INTO places
          (id, title, image, description, route_description, best_transport, lat, lng,
           created_by, created_by_nickname, review_status, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending','published')
        RETURNING *
      `,
      [
        nextId,
        payload.title,
        payload.image,
        payload.description,
        payload.routeDescription,
        payload.bestTransport,
        payload.lat,
        payload.lng,
        user.id,
        user.nickname,
      ]
    );
    json(res, 201, {
      place: {
        ...placeFromRow(result.rows[0]),
        reactions: await computeReactionSummary(nextId, user.id),
      },
    });
    return;
  }

  const reactionMatch = pathname.match(/^\/api\/places\/(\d+)\/reaction$/);
  if (req.method === "POST" && reactionMatch) {
    const user = await requireUser(req, res);
    if (!user) {
      return;
    }
    const placeId = Number(reactionMatch[1]);
    const payload = await readBody(req);
    const vote = payload.vote === "like" || payload.vote === "dislike" ? payload.vote : "";

    if (vote) {
      await pool.query(
        `
          INSERT INTO reactions (place_id, user_id, vote)
          VALUES ($1, $2, $3)
          ON CONFLICT (place_id, user_id)
          DO UPDATE SET vote = EXCLUDED.vote, updated_at = now()
        `,
        [placeId, user.id, vote]
      );
    } else {
      await pool.query("DELETE FROM reactions WHERE place_id = $1 AND user_id = $2", [placeId, user.id]);
    }

    json(res, 200, { reactions: await computeReactionSummary(placeId, user.id) });
    return;
  }

  const moderationMatch = pathname.match(/^\/api\/places\/(\d+)\/moderation$/);
  if (req.method === "PATCH" && moderationMatch) {
    const user = await requireModerator(req, res);
    if (!user) {
      return;
    }
    const placeId = Number(moderationMatch[1]);
    const payload = await readBody(req);
    const reviewStatus = ["pending", "approved", "rejected"].includes(payload.reviewStatus)
      ? payload.reviewStatus
      : null;
    const status = ["published", "archived"].includes(payload.status) ? payload.status : null;

    if (!reviewStatus && !status) {
      throw new Error("РџРµСЂРµРґР°Р№С‚Рµ reviewStatus РёР»Рё status");
    }

    const result = await pool.query(
      `
        UPDATE places
        SET
          review_status = COALESCE($2, review_status),
          status = COALESCE($3, status),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [placeId, reviewStatus, status]
    );
    if (!result.rows[0]) {
      json(res, 404, { error: "РњРµСЃС‚Рѕ РЅРµ РЅР°Р№РґРµРЅРѕ" });
      return;
    }
    json(res, 200, {
      place: {
        ...placeFromRow(result.rows[0]),
        reactions: await computeReactionSummary(placeId, user.id),
      },
    });
    return;
  }

  if (req.method === "GET") {
    const distPath = pathname === "/" ? path.join(DIST_DIR, "index.html") : path.join(DIST_DIR, pathname);
    const publicPath = path.join(PUBLIC_DIR, pathname);
    const uploadsPath = path.join(__dirname, pathname);

    if (distPath.startsWith(DIST_DIR) && fssync.existsSync(distPath) && fssync.statSync(distPath).isFile()) {
      serveStaticFile(res, distPath);
      return;
    }

    if (publicPath.startsWith(PUBLIC_DIR) && fssync.existsSync(publicPath) && fssync.statSync(publicPath).isFile()) {
      serveStaticFile(res, publicPath);
      return;
    }

    if (uploadsPath.startsWith(UPLOADS_DIR) && fssync.existsSync(uploadsPath) && fssync.statSync(uploadsPath).isFile()) {
      serveStaticFile(res, uploadsPath);
      return;
    }

    if (fssync.existsSync(path.join(DIST_DIR, "index.html"))) {
      serveStaticFile(res, path.join(DIST_DIR, "index.html"));
      return;
    }
  }

  json(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error(error);
    json(res, 400, { error: error.message || "Server error" });
  }
});

await initSchema();
await seedFromJsonIfEmpty();

server.listen(PORT, HOST, () => {
  console.log(`MESTA server started on http://${HOST}:${PORT}`);
});
