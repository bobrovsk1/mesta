import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";

function getEmptyProfile() {
  return {
    id: "",
    login: "",
    nickname: "",
    avatar: "",
    avatarName: "",
    avatarDataUrl: "",
    instagram: "",
    vk: "",
    whatsapp: "",
    telegram: "",
    role: "user",
  };
}

function getEmptyPlace() {
  return {
    title: "",
    image: "",
    imageName: "",
    imageDataUrl: "",
    description: "",
    routeDescription: "",
    bestTransport: "",
    lat: "",
    lng: "",
  };
}

function getPlaceImages(place) {
  if (Array.isArray(place?.images) && place.images.length) {
    return place.images;
  }
  return place?.image ? [place.image] : [];
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }
  return data;
}

function describeWeatherCode(code) {
  const descriptions = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Изморозь и туман",
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
    80: "Слабый ливень",
    81: "Ливень",
    82: "Сильный ливень",
    85: "Слабый снегопад",
    86: "Сильный снегопад",
    95: "Гроза",
    96: "Гроза с градом",
    99: "Сильная гроза с градом",
  };
  return descriptions[Number(code)] || "Погода без описания";
}

function formatWeatherHourLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || "").slice(11, 16);
  }
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function fetchOpenMeteoDirect(lat, lng) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("hourly", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("wind_speed_unit", "ms");

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.reason || "weather_fetch_failed");
  }

  const current = payload.current || {};
  const hourlyTimes = Array.isArray(payload.hourly?.time) ? payload.hourly.time : [];
  const hourlyTemps = Array.isArray(payload.hourly?.temperature_2m) ? payload.hourly.temperature_2m : [];
  const hourlyWinds = Array.isArray(payload.hourly?.wind_speed_10m) ? payload.hourly.wind_speed_10m : [];
  const hourlyCodes = Array.isArray(payload.hourly?.weather_code) ? payload.hourly.weather_code : [];
  const currentTime = current.time ? new Date(current.time).getTime() : Date.now();

  const hourly = hourlyTimes
    .map((time, index) => ({
      time,
      temp: hourlyTemps[index],
      windSpeed: hourlyWinds[index],
      code: hourlyCodes[index],
    }))
    .filter((hour) => new Date(hour.time).getTime() > currentTime)
    .slice(0, 3)
    .map((hour) => ({
      time: hour.time,
      label: formatWeatherHourLabel(hour.time),
      temp: Math.round(Number(hour.temp ?? 0)),
      windSpeed: Math.round(Number(hour.windSpeed ?? 0)),
      icon: "",
      description: describeWeatherCode(hour.code),
    }));

  return {
    provider: "Open-Meteo",
    timezone: payload.timezone || "",
    current: {
      temp: Math.round(Number(current.temperature_2m ?? 0)),
      windSpeed: Math.round(Number(current.wind_speed_10m ?? 0)),
      icon: "",
      description: describeWeatherCode(current.weather_code),
      observedAt: current.time || null,
    },
    hourly,
  };
}

function AuthModal({ mode, onModeChange, onClose, onSubmit, error }) {
  const [form, setForm] = useState({ login: "", password: "", nickname: "" });
  const isRegister = mode === "register";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      login: form.login.trim(),
      password: form.password,
      nickname: form.nickname.trim(),
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Аккаунт</p>
            <h2>{isRegister ? "Регистрация" : "Вход"}</h2>
          </div>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label="Закрыть">
            x
          </button>
        </div>

        <div className="auth-switch">
          <button
            className={`toggle-option${!isRegister ? " active" : ""}`}
            type="button"
            onClick={() => onModeChange("login")}
          >
            Вход
          </button>
          <button
            className={`toggle-option${isRegister ? " active" : ""}`}
            type="button"
            onClick={() => onModeChange("register")}
          >
            Регистрация
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            <span>Логин</span>
            <input
              name="login"
              type="text"
              value={form.login}
              onChange={handleChange}
              placeholder="yakut_traveler"
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Пароль</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Минимум 6 символов"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </label>

          {isRegister ? (
            <label>
              <span>Никнейм</span>
              <input
                name="nickname"
                type="text"
                value={form.nickname}
                onChange={handleChange}
                placeholder="YakutTraveler"
                required
              />
            </label>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <button className="action-primary full-width" type="submit">
            {isRegister ? "Создать аккаунт" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileModal({ initialProfile, onClose, onSubmit, error }) {
  const [form, setForm] = useState(initialProfile);

  useEffect(() => {
    setForm(initialProfile);
  }, [initialProfile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        avatar: String(reader.result || ""),
        avatarDataUrl: String(reader.result || ""),
        avatarName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      nickname: form.nickname.trim(),
      avatar: form.avatar,
      avatarName: form.avatarName,
      avatarDataUrl: form.avatarDataUrl,
      instagram: form.instagram.trim(),
      vk: form.vk.trim(),
      whatsapp: form.whatsapp.trim(),
      telegram: form.telegram.trim(),
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Профиль</p>
            <h2>Редактирование</h2>
          </div>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label="Закрыть">
            x
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            <span>Никнейм</span>
            <input name="nickname" type="text" value={form.nickname} onChange={handleChange} required />
          </label>
          <label>
            <span>Аватар</span>
            <input
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
            />
            {form.avatar ? <small className="muted-text">Файл выбран: {form.avatarName || "текущий аватар"}</small> : null}
          </label>
          <label>
            <span>Instagram</span>
            <input name="instagram" type="url" value={form.instagram} onChange={handleChange} />
          </label>
          <label>
            <span>VK</span>
            <input name="vk" type="url" value={form.vk} onChange={handleChange} />
          </label>
          <label>
            <span>WhatsApp</span>
            <input name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} />
          </label>
          <label>
            <span>Telegram</span>
            <input name="telegram" type="url" value={form.telegram} onChange={handleChange} />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="action-primary full-width" type="submit">
            Сохранить профиль
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPlaceModal({ form, onChange, onFileChange, onSubmit, onClose, onStartPicking, isPicking, submitError }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-wide">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Новое место</p>
            <h2>Добавить место</h2>
          </div>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label="Закрыть">
            x
          </button>
        </div>

        <form className="profile-form" onSubmit={onSubmit}>
          <label>
            <span>Название места</span>
            <input name="title" type="text" value={form.title} onChange={onChange} required />
          </label>
          <label>
            <span>Фото места</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFileChange}
              required={!form.image}
            />
            {form.image ? <small className="muted-text">Файл выбран: {form.imageName || "изображение"}</small> : null}
          </label>
          <label>
            <span>Описание места</span>
            <textarea name="description" value={form.description} onChange={onChange} rows="3" required />
          </label>
          <label>
            <span>Как проехать</span>
            <textarea name="routeDescription" value={form.routeDescription} onChange={onChange} rows="3" required />
          </label>
          <label>
            <span>На чем лучше ехать</span>
            <textarea name="bestTransport" value={form.bestTransport} onChange={onChange} rows="2" required />
          </label>

          <div className="pick-row">
            <div className="pick-coords">
              <span>Координаты на карте</span>
              <strong>
                {form.lat && form.lng
                  ? `${Number(form.lat).toFixed(5)}, ${Number(form.lng).toFixed(5)}`
                  : "Точка пока не выбрана"}
              </strong>
              {isPicking ? <small>Кликните по карте, чтобы выбрать точку.</small> : null}
            </div>
            <button className="action-secondary" type="button" onClick={onStartPicking}>
              Указать на карте
            </button>
          </div>

          {submitError ? <p className="error-text">{submitError}</p> : null}
          {form.lat && form.lng ? (
            <button className="action-primary full-width" type="submit">
              Сохранить место
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function ProfileMenu({ profile, myPlaces, onEdit, onShowMine, onLogout }) {
  const links = [
    { label: "Instagram", value: profile.instagram },
    { label: "VK", value: profile.vk },
    {
      label: "WhatsApp",
      value: profile.whatsapp
        ? `https://wa.me/${profile.whatsapp.replace(/[^\d+]/g, "").replace("+", "")}`
        : "",
    },
    { label: "Telegram", value: profile.telegram },
  ].filter((item) => item.value);

  return (
    <div className="profile-menu">
      <div className="profile-menu-head">
        {profile.avatar ? <img className="profile-avatar" src={profile.avatar} alt="" /> : null}
        <strong>{profile.nickname}</strong>
        <span>@{profile.login} · {profile.role}</span>
      </div>

      <div className="profile-links">
        {links.length ? (
          links.map((item) => (
            <a key={item.label} href={item.value} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))
        ) : (
          <p>Ссылки пока не заполнены</p>
        )}
      </div>

      <div className="my-places-box">
        <strong>Мои места</strong>
        <span>{myPlaces.length} добавлено с этого аккаунта</span>
        <button className="action-secondary full-width" type="button" onClick={onShowMine}>
          Показать мои места
        </button>
      </div>

      <button className="action-secondary full-width" type="button" onClick={onEdit}>
        Изменить профиль
      </button>
      <button className="action-secondary full-width" type="button" onClick={onLogout}>
        Выйти
      </button>
    </div>
  );
}

function MyPlacesPanel({ items, selectedPlaceId, onSelect }) {
  if (!items.length) {
    return (
      <div className="my-places-list">
        <p className="muted-text">Вы пока не добавили ни одного места.</p>
      </div>
    );
  }

  return (
    <div className="my-places-list">
      {items.map((item) => (
        <button
          className={`my-place-item${selectedPlaceId === item.id ? " active" : ""}`}
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
        >
          <strong>{item.title}</strong>
          <span>{item.reviewStatus === "approved" ? "Опубликовано" : "Ждет модерации"}</span>
        </button>
      ))}
    </div>
  );
}

function ReactionButtons({ place, userVote, onVote }) {
  const likes = place?.reactions?.likes ?? 0;
  const dislikes = place?.reactions?.dislikes ?? 0;

  return (
    <div className="reaction-strip">
      <button
        className={`icon-vote like${userVote === "like" ? " active" : ""}`}
        type="button"
        onClick={() => onVote(userVote === "like" ? "" : "like")}
        aria-label="Поставить лайк"
      >
        <span className="icon-vote-mark">▲</span>
        <strong>{likes}</strong>
      </button>
      <button
        className={`icon-vote dislike${userVote === "dislike" ? " active" : ""}`}
        type="button"
        onClick={() => onVote(userVote === "dislike" ? "" : "dislike")}
        aria-label="Поставить дизлайк"
      >
        <span className="icon-vote-mark">▼</span>
        <strong>{dislikes}</strong>
      </button>
    </div>
  );
}

function WeatherCard({ weather, loading, error }) {
  const [expanded, setExpanded] = useState(false);
  const hasWeather = Boolean(weather?.current);
  const showPlaceholder = loading || (!hasWeather && !error);

  useEffect(() => {
    setExpanded(false);
  }, [weather?.current?.observedAt]);

  return (
    <div className={`weather-card overlay${expanded ? " expanded" : ""}`}>
      <button
        className={`weather-chip${showPlaceholder ? " loading" : ""}${error ? " error" : ""}`}
        type="button"
        onClick={() => {
          if (hasWeather) {
            setExpanded((current) => !current);
          }
        }}
        aria-expanded={expanded}
      >
        {hasWeather && weather.current.icon ? (
          <img className="weather-icon" src={weather.current.icon} alt={weather.current.description} />
        ) : (
          <span className="weather-fallback-icon">{error ? "!" : "○"}</span>
        )}
        <span className="weather-main">
          {showPlaceholder ? (
            <>
              <strong>Погода</strong>
              <small>Загрузка...</small>
            </>
          ) : error ? (
            <>
              <strong>Погода</strong>
              <small>Недоступна</small>
            </>
          ) : (
            <>
              <strong>{weather.current.temp}°C</strong>
              <small>Ветер {weather.current.windSpeed} м/с</small>
            </>
          )}
        </span>
        {hasWeather ? <span className="weather-toggle">{expanded ? "▴" : "▾"}</span> : null}
      </button>

      {expanded && hasWeather && Array.isArray(weather.hourly) ? (
        <div className="weather-forecast">
          {weather.hourly.map((hour) => (
            <div className="weather-hour" key={hour.time}>
              <span className="weather-hour-time">{hour.label}</span>
              <div className="weather-hour-main">
                {hour.icon ? <img className="weather-icon mini" src={hour.icon} alt={hour.description} /> : null}
                <strong>{hour.temp}°C</strong>
              </div>
              <span className="weather-hour-wind">Ветер {hour.windSpeed} м/с</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GalleryModal({ images, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  if (!images.length) {
    return null;
  }

  return (
    <div className="modal-backdrop gallery-backdrop">
      <div className="gallery-modal">
        <div className="gallery-stage">
          <button className="ghost-icon gallery-close" type="button" onClick={onClose}>
            x
          </button>
          <button
            className="gallery-nav left"
            type="button"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
          >
            ‹
          </button>
          <img className="gallery-image" src={images[index]} alt="" />
          <button
            className="gallery-nav right"
            type="button"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  place,
  userVote,
  onVote,
  myPlaces,
  myPlacesOpen,
  onSelectMyPlace,
  weather,
  weatherLoading,
  weatherError,
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setGalleryOpen(false);
  }, [place?.id]);

  if (!place) {
    return (
      <aside className="sidebar-card">
        <div className="empty-state">
          <p className="eyebrow">Место</p>
          <h2>Точка пока не выбрана</h2>
          <p>Нажмите на маркер на карте, и здесь появятся фото, описание и маршрут.</p>
        </div>
      </aside>
    );
  }

  const images = getPlaceImages(place);
  const currentImage = images[imageIndex] || "";

  return (
    <>
      <aside className="sidebar-card">
        <div className="place-visual">
          {currentImage ? (
            <>
              <button
                className="media-nav left"
                type="button"
                onClick={() => setImageIndex((current) => (current - 1 + images.length) % images.length)}
              >
                ‹
              </button>
              <img
                src={currentImage}
                alt={place.title}
                onClick={() => setGalleryOpen(true)}
                role="button"
                tabIndex={0}
              />
              <button
                className="media-nav right"
                type="button"
                onClick={() => setImageIndex((current) => (current + 1) % images.length)}
              >
                ›
              </button>
            </>
          ) : null}
          <WeatherCard weather={weather} loading={weatherLoading} error={weatherError} />
        </div>

        <div className="sidebar-scroll-wrap">
          <div className="sidebar-body">
            <div className="title-row">
              <div className="title-main">
                <h2>{place.title}</h2>
              </div>
              <ReactionButtons place={place} userVote={userVote} onVote={onVote} />
            </div>

            <div className="meta-line">
              <span>Добавил: {place.createdByNickname || "Неизвестно"}</span>
              <span>{place.reviewStatus === "approved" ? "Проверено" : "На модерации"}</span>
            </div>

            {myPlacesOpen ? (
              <div className="my-places-card">
                <div className="section-mini-head">
                  <strong>Мои места</strong>
                  <span>{myPlaces.length} шт.</span>
                </div>
                <MyPlacesPanel items={myPlaces} selectedPlaceId={place.id} onSelect={onSelectMyPlace} />
              </div>
            ) : null}

            <div className="info-block compact">
              <span>Описание места</span>
              <p>{place.description}</p>
            </div>
            <div className="info-block compact">
              <span>Как проехать</span>
              <p>{place.routeDescription}</p>
            </div>
            <div className="info-block compact">
              <span>На чем лучше ехать</span>
              <p>{place.bestTransport}</p>
            </div>
          </div>
        </div>
      </aside>

      {galleryOpen ? <GalleryModal images={images} initialIndex={imageIndex} onClose={() => setGalleryOpen(false)} /> : null}
    </>
  );
}

export default function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const profileMenuRef = useRef(null);
  const pickModeRef = useRef(false);

  const [profile, setProfile] = useState(getEmptyProfile());
  const [theme, setTheme] = useState(null);
  const [places, setPlaces] = useState([]);
  const [myPlaces, setMyPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);
  const [addPlaceForm, setAddPlaceForm] = useState(getEmptyPlace());
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const [myPlacesOpen, setMyPlacesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [mapMarkerMode, setMapMarkerMode] = useState("text");
  const [weatherByPlace, setWeatherByPlace] = useState({});
  const [weatherLoadingId, setWeatherLoadingId] = useState(null);
  const [weatherErrorByPlace, setWeatherErrorByPlace] = useState({});

  const isAuthenticated = Boolean(profile.id);
  const selectedPlace = useMemo(
    () => places.find((item) => item.id === selectedPlaceId) || places[0] || null,
    [places, selectedPlaceId]
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setGlobalError("");

        const [settings, placesResponse] = await Promise.all([
          apiRequest("/api/settings/public"),
          apiRequest("/api/places"),
        ]);
        setTheme(settings.theme);
        setPlaces(placesResponse.items);
        setSelectedPlaceId(placesResponse.items[0]?.id ?? null);

        try {
          const me = await apiRequest("/api/auth/me");
          setProfile(me.user);
          const mine = await apiRequest("/api/places/mine");
          setMyPlaces(mine.items);
        } catch {
          setProfile(getEmptyProfile());
          setMyPlaces([]);
        }
      } catch (error) {
        setGlobalError(error.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!theme?.activeSeason) {
      return;
    }
    const activeSeason = theme.seasons?.[theme.activeSeason];
    if (!activeSeason) {
      return;
    }
    const root = document.documentElement;
    root.style.setProperty("--season-top-glow", activeSeason.topGlow);
    root.style.setProperty("--season-bottom-glow", activeSeason.bottomGlow);
    root.style.setProperty("--accent", activeSeason.accent);
    root.style.setProperty("--accent-deep", activeSeason.accentDeep);
    root.style.setProperty("--surface", activeSeason.surface);
  }, [theme]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([62.03, 129.73], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (event) => {
      if (!pickModeRef.current) {
        return;
      }
      setAddPlaceForm((current) => ({
        ...current,
        lat: String(event.latlng.lat),
        lng: String(event.latlng.lng),
      }));
      setIsPickingOnMap(false);
      pickModeRef.current = false;
      setAddPlaceModalOpen(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    const refreshSize = () => mapRef.current?.invalidateSize(true);
    const frame = window.requestAnimationFrame(refreshSize);
    const delayed = window.setTimeout(refreshSize, 120);
    window.addEventListener("resize", refreshSize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayed);
      window.removeEventListener("resize", refreshSize);
    };
  }, [places.length, selectedPlaceId, mapMarkerMode, loading]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    const bounds = [];

    places.forEach((place) => {
      const previewImage = getPlaceImages(place)[0] || "";
      const icon = L.divIcon({
        className: "leaflet-place-wrapper",
        html:
          mapMarkerMode === "image"
            ? `<div class="map-place-marker image-mode" data-marker-id="${place.id}"><img src="${previewImage}" alt="${place.title}" /></div>`
            : `<div class="map-place-marker text-mode" data-marker-id="${place.id}"><strong>${place.title}</strong></div>`,
        iconSize: mapMarkerMode === "image" ? [62, 62] : [78, 28],
        iconAnchor: mapMarkerMode === "image" ? [31, 31] : [39, 14],
      });
      const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
      marker.on("click", () => {
        setSelectedPlaceId(place.id);
        setMyPlacesOpen(false);
      });
      markersRef.current.set(place.id, marker);
      bounds.push([place.lat, place.lng]);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, mapMarkerMode]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const element = marker.getElement()?.querySelector(".map-place-marker");
      if (element) {
        element.classList.toggle("selected", id === selectedPlaceId);
      }
    });
    if (selectedPlace && mapRef.current) {
      mapRef.current.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.4 });
    }
  }, [selectedPlace, selectedPlaceId]);

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }
    const cacheKey = String(selectedPlace.id);
    if (weatherByPlace[cacheKey]) {
      return;
    }

    let cancelled = false;
    setWeatherLoadingId(selectedPlace.id);
    apiRequest(`/api/weather?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}`)
      .catch(() => fetchOpenMeteoDirect(selectedPlace.lat, selectedPlace.lng))
      .then((payload) => {
        if (!cancelled) {
          setWeatherByPlace((current) => ({ ...current, [cacheKey]: payload }));
          setWeatherErrorByPlace((current) => {
            const next = { ...current };
            delete next[cacheKey];
            return next;
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setWeatherErrorByPlace((current) => ({
            ...current,
            [cacheKey]: error.message || "Ошибка погоды",
          }));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWeatherLoadingId((current) => (current === selectedPlace.id ? null : current));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPlace, weatherByPlace]);

  async function refreshPlaces(selectId = null) {
    const placesResponse = await apiRequest("/api/places");
    setPlaces(placesResponse.items);
    if (selectId) {
      setSelectedPlaceId(selectId);
    } else if (!placesResponse.items.some((item) => item.id === selectedPlaceId)) {
      setSelectedPlaceId(placesResponse.items[0]?.id ?? null);
    }
  }

  async function refreshMyPlaces() {
    if (!isAuthenticated) {
      setMyPlaces([]);
      return;
    }
    const mine = await apiRequest("/api/places/mine");
    setMyPlaces(mine.items);
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthError("");
    setAuthModalOpen(true);
    setProfileMenuOpen(false);
  }

  async function handleAuthSubmit(payload) {
    try {
      setAuthError("");
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setProfile(response.user);
      setAuthModalOpen(false);
      await refreshPlaces();
      const mine = await apiRequest("/api/places/mine");
      setMyPlaces(mine.items);
    } catch (error) {
      setAuthError(error.message || "Не удалось войти");
    }
  }

  async function handleLogout() {
    await apiRequest("/api/auth/session", { method: "DELETE" });
    setProfile(getEmptyProfile());
    setMyPlaces([]);
    setMyPlacesOpen(false);
    setProfileMenuOpen(false);
    await refreshPlaces();
  }

  async function handleProfileSubmit(nextProfile) {
    try {
      setProfileError("");
      const response = await apiRequest("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(nextProfile),
      });
      setProfile(response.user);
      setProfileModalOpen(false);
      await refreshMyPlaces();
    } catch (error) {
      setProfileError(error.message || "Не удалось сохранить профиль");
    }
  }

  function handlePlaceFormChange(event) {
    const { name, value } = event.target;
    setAddPlaceForm((current) => ({ ...current, [name]: value }));
  }

  function handlePlaceFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAddPlaceForm((current) => ({
        ...current,
        image: String(reader.result || ""),
        imageDataUrl: String(reader.result || ""),
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleVote(vote) {
    if (!selectedPlace || !isAuthenticated) {
      openAuth("login");
      return;
    }
    try {
      const response = await apiRequest(`/api/places/${selectedPlace.id}/reaction`, {
        method: "POST",
        body: JSON.stringify({ vote }),
      });
      setPlaces((current) =>
        current.map((place) =>
          place.id === selectedPlace.id ? { ...place, reactions: response.reactions } : place
        )
      );
    } catch (error) {
      setGlobalError(error.message || "Не удалось отправить реакцию");
    }
  }

  async function handleAddPlaceSubmit(event) {
    event.preventDefault();
    try {
      setSubmitError("");
      const response = await apiRequest("/api/places", {
        method: "POST",
        body: JSON.stringify({
          ...addPlaceForm,
          imageName: addPlaceForm.imageName,
          imageDataUrl: addPlaceForm.imageDataUrl,
          lat: Number(addPlaceForm.lat),
          lng: Number(addPlaceForm.lng),
        }),
      });
      await refreshPlaces(response.place.id);
      await refreshMyPlaces();
      setAddPlaceForm(getEmptyPlace());
      setAddPlaceModalOpen(false);
      setMyPlacesOpen(true);
    } catch (error) {
      setSubmitError(error.message || "Не удалось сохранить место");
    }
  }

  return (
    <div className={`page-shell season-${theme?.activeSeason || "summer"}`}>
      <header className="topbar season-frame">
        <div className="headline">
          <h1>Найди интересное место и добавь свое</h1>
        </div>

        <div className="profile-zone" ref={profileMenuRef}>
          <button
            className="profile-button"
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                setProfileMenuOpen((current) => !current);
              } else {
                openAuth("login");
              }
            }}
          >
            <span>
              <strong>{isAuthenticated ? profile.nickname : "Войти"}</strong>
            </span>
          </button>

          {profileMenuOpen && isAuthenticated ? (
            <ProfileMenu
              profile={profile}
              myPlaces={myPlaces}
              onEdit={() => {
                setProfileMenuOpen(false);
                setProfileError("");
                setProfileModalOpen(true);
              }}
              onShowMine={() => {
                setMyPlacesOpen(true);
                setProfileMenuOpen(false);
                if (myPlaces[0]) {
                  setSelectedPlaceId(myPlaces[0].id);
                }
              }}
              onLogout={handleLogout}
            />
          ) : null}
        </div>
      </header>

      {globalError ? <div className="global-error">{globalError}</div> : null}

      <main className="app-layout">
        <section className="map-column">
          <div className="map-card season-frame">
            <div className={`map-area${isPickingOnMap ? " picking" : ""}`} ref={mapContainerRef}>
              <div className="map-mode-toggle">
                <button
                  className={`toggle-option${mapMarkerMode === "text" ? " active" : ""}`}
                  type="button"
                  onClick={() => setMapMarkerMode("text")}
                >
                  Текст
                </button>
                <button
                  className={`toggle-option${mapMarkerMode === "image" ? " active" : ""}`}
                  type="button"
                  onClick={() => setMapMarkerMode("image")}
                >
                  Картинки
                </button>
              </div>
              {isPickingOnMap ? (
                <div className="map-picker-hint">Режим выбора точки включен. Кликните по карте.</div>
              ) : null}
              <div className="map-actions">
                <button
                  className="action-primary map-add-button"
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuth("login");
                      return;
                    }
                    setAddPlaceModalOpen(true);
                    setSubmitError("");
                  }}
                >
                  Добавить место
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="sidebar-column">
          {loading ? (
            <aside className="sidebar-card season-frame">
              <div className="empty-state">
                <p className="eyebrow">Загрузка</p>
                <h2>Получаем данные с сервера</h2>
                <p>Профиль, тема и точки карты уже загружаются.</p>
              </div>
            </aside>
          ) : (
            <DetailPanel
              place={selectedPlace}
              userVote={selectedPlace?.reactions?.userVote || ""}
              onVote={handleVote}
              myPlaces={myPlaces}
              myPlacesOpen={myPlacesOpen}
              onSelectMyPlace={setSelectedPlaceId}
              weather={selectedPlace ? weatherByPlace[String(selectedPlace.id)] || null : null}
              weatherLoading={weatherLoadingId === selectedPlace?.id}
              weatherError={selectedPlace ? weatherErrorByPlace[String(selectedPlace.id)] || "" : ""}
            />
          )}
        </div>
      </main>

      {authModalOpen ? (
        <AuthModal
          mode={authMode}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setAuthError("");
          }}
          onClose={() => setAuthModalOpen(false)}
          onSubmit={handleAuthSubmit}
          error={authError}
        />
      ) : null}

      {profileModalOpen ? (
        <ProfileModal
          initialProfile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSubmit={handleProfileSubmit}
          error={profileError}
        />
      ) : null}

      {addPlaceModalOpen ? (
        <AddPlaceModal
          form={addPlaceForm}
          onChange={handlePlaceFormChange}
          onFileChange={handlePlaceFileChange}
          onSubmit={handleAddPlaceSubmit}
          onClose={() => {
            setAddPlaceModalOpen(false);
            setIsPickingOnMap(false);
            pickModeRef.current = false;
            setSubmitError("");
          }}
          onStartPicking={() => {
            pickModeRef.current = true;
            setIsPickingOnMap(true);
            setAddPlaceModalOpen(false);
            setSubmitError("");
          }}
          isPicking={isPickingOnMap}
          submitError={submitError}
        />
      ) : null}
    </div>
  );
}
