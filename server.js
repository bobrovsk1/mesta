import fs from "node:fs/promises";
import fssync from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
<<<<<<< HEAD
import sharp from "sharp";
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4323);
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = path.join(__dirname, "data");
const DIST_DIR = path.join(__dirname, "dist");
const PUBLIC_DIR = path.join(__dirname, "public");
const UPLOADS_DIR = path.join(__dirname, "uploads");
<<<<<<< HEAD
const PLACE_UPLOADS_DIR = path.join(UPLOADS_DIR, "places");
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

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

const weatherCache = new Map();
<<<<<<< HEAD
const OPEN_METEO_WEATHER_CODES = {
  0: "Ясно",
  1: "Преимущественно ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Туман с инеем",
  51: "Слабая морось",
  53: "Морось",
  55: "Сильная морось",
  56: "Слабая ледяная морось",
  57: "Ледяная морось",
  61: "Слабый дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Слабый ледяной дождь",
  67: "Ледяной дождь",
  71: "Слабый снег",
  73: "Снег",
  75: "Сильный снег",
  77: "Снежные зерна",
  80: "Кратковременный слабый дождь",
  81: "Кратковременный дождь",
  82: "Кратковременный сильный дождь",
  85: "Слабый снегопад",
  86: "Сильный снегопад",
  95: "Гроза",
  96: "Гроза с небольшим градом",
  99: "Гроза с сильным градом",
};
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

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

<<<<<<< HEAD
=======
const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHERMAP_API_KEY || "";

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
const seedPlaces = [
  {
    id: 1,
    title: "Красивое озеро",
    lat: 62.035,
    lng: 129.742,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    description:
      "Тихое место недалеко от города, куда удобно уехать на день ради воды, тишины и спокойного отдыха.",
    routeDescription:
      "Из Якутска выезжать утром по Покровскому тракту, затем свернуть на локальную дорогу к берегу. Последний участок лучше уточнять у местных перед поездкой.",
    bestTransport:
      "Лучше всего ехать на легковом автомобиле или кроссовере в сухую погоду.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Смотровая над Леной",
    lat: 61.985,
    lng: 129.61,
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    description:
      "Высокая точка с широким обзором на реку и простор, куда любят приезжать за закатами и фотографиями.",
    routeDescription:
      "Двигаться через Покровск, затем подняться по грунтовой дороге к видовой площадке. В дождь проезд может стать сложнее.",
    bestTransport:
      "Оптимально ехать на машине с хорошим клиренсом, особенно после осадков.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: 3,
    title: "Лесная поляна у реки",
    lat: 62.118,
    lng: 129.895,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    description:
      "Спокойная точка для палаток, пикника и короткого отдыха на природе без длинного переезда.",
    routeDescription:
      "От города ехать по основной трассе до лесного съезда, дальше по накатанной дороге к поляне и берегу.",
    bestTransport: "Подойдет легковая машина летом, но для уверенности лучше кроссовер.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
  {
    id: 4,
    title: "Песчаный берег",
    lat: 62.072,
    lng: 129.53,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description:
      "Необычная локация с открытым песчаным участком и хорошим светом для вечерних прогулок.",
    routeDescription:
      "Ехать по направлению к береговой линии, затем пройти небольшой участок пешком от места парковки до песчаного выхода.",
    bestTransport: "Удобнее всего добираться на автомобиле, финальный участок пройти пешком.",
    createdBy: "seed-system",
    createdByNickname: "System",
    reviewStatus: "approved",
    status: "published",
    createdAt: "2026-05-26T00:00:00.000Z",
  },
];

const seedSettings = {
  theme: {
    activeSeason: "summer",
    seasons: {
      summer: {
        label: "Лето",
        topGlow: "rgba(255, 196, 88, 0.24)",
        bottomGlow: "rgba(96, 169, 110, 0.18)",
        accent: "#c96031",
        accentDeep: "#8b391a",
        surface: "rgba(255, 251, 245, 0.9)",
      },
      autumn: {
        label: "Осень",
        topGlow: "rgba(214, 133, 61, 0.28)",
        bottomGlow: "rgba(151, 83, 45, 0.16)",
        accent: "#b45b2f",
        accentDeep: "#7b3418",
        surface: "rgba(255, 248, 241, 0.92)",
      },
      winter: {
        label: "Зима",
        topGlow: "rgba(167, 213, 255, 0.26)",
        bottomGlow: "rgba(100, 138, 198, 0.14)",
        accent: "#4a83c4",
        accentDeep: "#2d5b97",
        surface: "rgba(248, 252, 255, 0.9)",
      },
      spring: {
        label: "Весна",
        topGlow: "rgba(177, 223, 136, 0.24)",
        bottomGlow: "rgba(255, 183, 137, 0.14)",
        accent: "#5c9d47",
        accentDeep: "#33692a",
        surface: "rgba(251, 255, 246, 0.9)",
      },
    },
  },
};

async function ensureDataFile(filePath, fallbackData) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallbackData, null, 2));
  }
}

async function initData() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await ensureDataFile(files.users, []);
  await ensureDataFile(files.reactions, {});
  await ensureDataFile(files.settings, seedSettings);
  await ensureDataFile(files.places, seedPlaces);
}

async function readJson(filePath, fallbackData) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw ? JSON.parse(raw) : fallbackData;
  } catch {
    return fallbackData;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function noContent(res) {
  res.writeHead(204);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
<<<<<<< HEAD
      if (raw.length > 2_000_000) {
=======
      if (raw.length > 50_000_000) {
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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

function getAuthToken(req) {
  const header = req.headers["authorization"] || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return "";
}

function cleanString(value) {
  return String(value || "").trim();
}

function ensureFiniteCoordinate(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Некорректная ${label}`);
  }
  return number;
}

<<<<<<< HEAD
function formatOpenMeteoHourLabel(isoString) {
  const value = cleanString(isoString);
  const timePart = value.split("T")[1] || "";
  return timePart.slice(0, 5) || "--:--";
}

function getOpenMeteoWeatherDescription(code) {
  return OPEN_METEO_WEATHER_CODES[Number(code)] || "Неизвестная погода";
=======
function formatHourLabel(unixSeconds, timezoneOffsetSeconds) {
  const shifted = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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
    instagram: cleanString(input.instagram),
    vk: cleanString(input.vk),
    whatsapp: cleanString(input.whatsapp),
    telegram: cleanString(input.telegram),
  };

  if (!profile.nickname) {
    throw new Error("Укажите никнейм");
  }
  if (!isValidUrl(profile.instagram)) {
    throw new Error("Instagram должен быть ссылкой");
  }
  if (!isValidUrl(profile.vk)) {
    throw new Error("VK должен быть ссылкой");
  }
  if (!isValidUrl(profile.telegram)) {
    throw new Error("Telegram должен быть ссылкой");
  }

  return profile;
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
    throw new Error("Укажите название места");
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error("Некорректная широта");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error("Некорректная долгота");
  }
  if (!place.description) {
    throw new Error("Добавьте описание места");
  }
  if (!place.routeDescription) {
    throw new Error("Добавьте описание маршрута");
  }
  if (!place.bestTransport) {
    throw new Error("Добавьте описание транспорта");
  }
  if (!place.image) {
    throw new Error("Добавьте изображение");
  }
  if (!place.image.startsWith("/uploads/") && !isValidUrl(place.image)) {
    throw new Error("Изображение должно быть ссылкой или загруженным файлом");
  }

  return place;
}

async function saveUploadedImage(payload) {
  const imageDataUrl = cleanString(payload.imageDataUrl);
  const imageName = cleanString(payload.imageName) || "image";

  if (!imageDataUrl) {
    return cleanString(payload.image);
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Некорректный формат изображения");
  }

  const mimeType = match[1];
  const base64 = match[2];
<<<<<<< HEAD
  const supportedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  if (!supportedMimeTypes.has(mimeType)) {
=======
  const extensionByMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  const extension = extensionByMime[mimeType];

  if (!extension) {
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
    throw new Error("Поддерживаются JPG, PNG, WEBP и GIF");
  }

  const safeBaseName =
    imageName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-") || "image";
<<<<<<< HEAD
  const fileName = `${Date.now()}-${safeBaseName}.webp`;
  const filePath = path.join(PLACE_UPLOADS_DIR, fileName);
  const sourceBuffer = Buffer.from(base64, "base64");

  await fs.mkdir(PLACE_UPLOADS_DIR, { recursive: true });
  await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filePath);

  return `/uploads/places/${fileName}`;
=======
  const fileName = `${Date.now()}-${safeBaseName}${extension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.writeFile(filePath, Buffer.from(base64, "base64"));
  return `/uploads/${fileName}`;
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
}

async function findUserByToken(token) {
  if (!token) {
    return null;
  }
  const users = await readJson(files.users, []);
  return users.find((user) => user.sessionToken === token) || null;
}

async function requireUser(req, res) {
  const token = getAuthToken(req);
  const user = await findUserByToken(token);
  if (!user) {
    json(res, 401, { error: "Необходима авторизация" });
    return null;
  }
  return user;
}

function computeReactionSummary(placeId, reactionsByPlace, userId) {
  const placeVotes = reactionsByPlace[String(placeId)] || {};
  let likes = 0;
  let dislikes = 0;

  Object.values(placeVotes).forEach((vote) => {
    if (vote === "like") {
      likes += 1;
    }
    if (vote === "dislike") {
      dislikes += 1;
    }
  });

  return {
    likes,
    dislikes,
    userVote: userId ? placeVotes[userId] || "" : "",
  };
}

async function buildPlacesResponse(userId) {
  const [places, reactions] = await Promise.all([
    readJson(files.places, []),
    readJson(files.reactions, {}),
  ]);

  return places
    .filter((place) => place.status !== "archived")
    .map((place) => ({
      ...place,
      reactions: computeReactionSummary(place.id, reactions, userId),
    }));
}

async function fetchWeatherByCoords(lat, lng) {
<<<<<<< HEAD
=======
  if (!OPENWEATHER_API_KEY) {
    throw new Error("WEATHER_NOT_CONFIGURED");
  }

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
  const cacheKey = `${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

<<<<<<< HEAD
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(lat));
  weatherUrl.searchParams.set("longitude", String(lng));
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,wind_speed_10m,weather_code"
  );
  weatherUrl.searchParams.set(
    "hourly",
    "temperature_2m,wind_speed_10m,weather_code"
  );
  weatherUrl.searchParams.set("forecast_days", "1");
  weatherUrl.searchParams.set("timezone", "auto");
  weatherUrl.searchParams.set("wind_speed_unit", "ms");
=======
  const weatherUrl = new URL("https://api.openweathermap.org/data/3.0/onecall");
  weatherUrl.searchParams.set("lat", String(lat));
  weatherUrl.searchParams.set("lon", String(lng));
  weatherUrl.searchParams.set("appid", OPENWEATHER_API_KEY);
  weatherUrl.searchParams.set("units", "metric");
  weatherUrl.searchParams.set("lang", "ru");
  weatherUrl.searchParams.set("exclude", "minutely,daily,alerts");
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

  const response = await fetch(weatherUrl);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "WEATHER_FETCH_FAILED");
  }

<<<<<<< HEAD
  const hourlyTimes = Array.isArray(payload.hourly?.time) ? payload.hourly.time : [];
  const hourlyTemps = Array.isArray(payload.hourly?.temperature_2m)
    ? payload.hourly.temperature_2m
    : [];
  const hourlyWindSpeeds = Array.isArray(payload.hourly?.wind_speed_10m)
    ? payload.hourly.wind_speed_10m
    : [];
  const hourlyWeatherCodes = Array.isArray(payload.hourly?.weather_code)
    ? payload.hourly.weather_code
    : [];
  const currentTime = cleanString(payload.current?.time);
  const currentTimeIndex = hourlyTimes.findIndex((value) => value === currentTime);
  const startIndex = currentTimeIndex >= 0 ? currentTimeIndex + 1 : 0;
  const hourly = [];

  for (let index = startIndex; index < hourlyTimes.length && hourly.length < 3; index += 1) {
    hourly.push({
      time: hourlyTimes[index],
      label: formatOpenMeteoHourLabel(hourlyTimes[index]),
      temp: Math.round(Number(hourlyTemps[index] ?? 0)),
      windSpeed: Math.round(Number(hourlyWindSpeeds[index] ?? 0)),
      icon: "",
      description: getOpenMeteoWeatherDescription(hourlyWeatherCodes[index]),
    });
  }

  const normalized = {
    provider: "Open-Meteo",
    timezoneOffset: 0,
    current: {
      temp: Math.round(Number(payload.current?.temperature_2m ?? 0)),
      windSpeed: Math.round(Number(payload.current?.wind_speed_10m ?? 0)),
      icon: "",
      description: getOpenMeteoWeatherDescription(payload.current?.weather_code),
      observedAt: currentTime || null,
    },
    hourly,
=======
  const currentWeather = payload.current?.weather?.[0] || {};
  const timezoneOffset = Number(payload.timezone_offset || 0);
  const normalized = {
    provider: "OpenWeatherMap",
    timezoneOffset,
    current: {
      temp: Math.round(Number(payload.current?.temp ?? 0)),
      windSpeed: Math.round(Number(payload.current?.wind_speed ?? 0)),
      icon: currentWeather.icon
        ? `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`
        : "",
      description: cleanString(currentWeather.description),
      observedAt: payload.current?.dt || null,
    },
    hourly: Array.isArray(payload.hourly)
      ? payload.hourly.slice(1, 4).map((item) => {
          const weather = item.weather?.[0] || {};
          return {
            time: item.dt,
            label: formatHourLabel(item.dt, timezoneOffset),
            temp: Math.round(Number(item.temp ?? 0)),
            windSpeed: Math.round(Number(item.wind_speed ?? 0)),
            icon: weather.icon
              ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
              : "",
            description: cleanString(weather.description),
          };
        })
      : [],
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/health") {
      json(res, 200, { ok: true, service: "interesnye-mesta-server" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/settings/public") {
      const settings = await readJson(files.settings, seedSettings);
      json(res, 200, settings);
      return;
    }

<<<<<<< HEAD
=======
    if (req.method === "GET" && pathname === "/api/weather/config") {
      json(res, 200, {
        hasApiKey: Boolean(OPENWEATHER_API_KEY),
        apiKey: OPENWEATHER_API_KEY || "",
      });
      return;
    }

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
    if (req.method === "GET" && pathname === "/api/weather") {
      const lat = ensureFiniteCoordinate(url.searchParams.get("lat"), "широта");
      const lng = ensureFiniteCoordinate(url.searchParams.get("lng"), "долгота");

      try {
        const weather = await fetchWeatherByCoords(lat, lng);
        json(res, 200, weather);
      } catch (error) {
<<<<<<< HEAD
=======
        if (error.message === "WEATHER_NOT_CONFIGURED") {
          json(res, 503, {
            error: "Погода на сервере пока не настроена",
            code: "weather_not_configured",
          });
          return;
        }

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
        json(res, 502, {
          error: "Не удалось получить погоду",
          code: "weather_fetch_failed",
        });
      }
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/session") {
      const payload = sanitizeProfile(await readBody(req));
      const users = await readJson(files.users, []);
      const token = crypto.randomUUID();
      const user = {
        id: crypto.randomUUID(),
        ...payload,
        sessionToken: token,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(user);
      await writeJson(files.users, users);
      json(res, 201, {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          instagram: user.instagram,
          vk: user.vk,
          whatsapp: user.whatsapp,
          telegram: user.telegram,
          role: user.role,
        },
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/auth/me") {
      const user = await requireUser(req, res);
      if (!user) {
        return;
      }
      json(res, 200, {
        user: {
          id: user.id,
          nickname: user.nickname,
          instagram: user.instagram,
          vk: user.vk,
          whatsapp: user.whatsapp,
          telegram: user.telegram,
          role: user.role,
        },
      });
      return;
    }

    if (req.method === "PATCH" && pathname === "/api/auth/me") {
      const authUser = await requireUser(req, res);
      if (!authUser) {
        return;
      }
      const payload = sanitizeProfile(await readBody(req));
      const users = await readJson(files.users, []);
      const updatedUsers = users.map((user) =>
        user.id === authUser.id
          ? {
              ...user,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
          : user
      );
      await writeJson(files.users, updatedUsers);
      json(res, 200, {
        user: {
          id: authUser.id,
          ...payload,
          role: authUser.role,
        },
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/places") {
      const token = getAuthToken(req);
      const user = await findUserByToken(token);
      const items = await buildPlacesResponse(user?.id);
      json(res, 200, { items });
      return;
    }

    if (req.method === "GET" && pathname === "/api/places/mine") {
      const user = await requireUser(req, res);
      if (!user) {
        return;
      }
      const items = await buildPlacesResponse(user.id);
      json(res, 200, {
        items: items.filter((place) => place.createdBy === user.id),
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/places") {
      const user = await requireUser(req, res);
      if (!user) {
        return;
      }
      const rawPayload = await readBody(req);
      const image = await saveUploadedImage(rawPayload);
      const payload = sanitizePlace({
        ...rawPayload,
        image,
      });
      const places = await readJson(files.places, []);
      const nextId = places.reduce((maxId, place) => Math.max(maxId, Number(place.id) || 0), 0) + 1;
      const place = {
        id: nextId,
        ...payload,
        createdBy: user.id,
        createdByNickname: user.nickname,
        reviewStatus: "pending",
        status: "published",
        createdAt: new Date().toISOString(),
      };
      places.push(place);
      await writeJson(files.places, places);
      const reactions = await readJson(files.reactions, {});
      json(res, 201, {
        place: {
          ...place,
          reactions: computeReactionSummary(place.id, reactions, user.id),
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
      const reactions = await readJson(files.reactions, {});
      const placeVotes = { ...(reactions[String(placeId)] || {}) };

      if (vote) {
        placeVotes[user.id] = vote;
      } else {
        delete placeVotes[user.id];
      }

      reactions[String(placeId)] = placeVotes;
      await writeJson(files.reactions, reactions);
      json(res, 200, {
        reactions: computeReactionSummary(placeId, reactions, user.id),
      });
      return;
    }

    if (req.method === "DELETE" && pathname === "/api/auth/session") {
      noContent(res);
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
  } catch (error) {
    json(res, 400, { error: error.message || "Server error" });
  }
});

await initData();

server.listen(PORT, HOST, () => {
  console.log(`Interesnye mesta server started on http://${HOST}:${PORT}`);
});
