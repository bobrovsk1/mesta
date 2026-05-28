import { useEffect, useMemo, useRef, useState } from "react";

const SESSION_STORAGE_KEY = "interesnye-mesta-session-token";

function getEmptyProfile() {
  return {
    nickname: "",
    instagram: "",
    vk: "",
    whatsapp: "",
    telegram: "",
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
  if (place?.image) {
    return [place.image];
  }
  return [];
}

<<<<<<< HEAD
=======
function formatWeatherHourLabel(unixSeconds, timezoneOffsetSeconds = 0) {
  const shifted = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function normalizeOpenWeatherPayload(payload) {
  const currentWeather = payload.current?.weather?.[0] || {};
  const timezoneOffset = Number(payload.timezone_offset || 0);

  return {
    provider: "OpenWeatherMap",
    timezoneOffset,
    current: {
      temp: Math.round(Number(payload.current?.temp ?? 0)),
      windSpeed: Math.round(Number(payload.current?.wind_speed ?? 0)),
      icon: currentWeather.icon
        ? `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`
        : "",
      description: String(currentWeather.description || "").trim(),
      observedAt: payload.current?.dt || null,
    },
    hourly: Array.isArray(payload.hourly)
      ? payload.hourly.slice(1, 4).map((item) => {
          const weather = item.weather?.[0] || {};
          return {
            time: item.dt,
            label: formatWeatherHourLabel(item.dt, timezoneOffset),
            temp: Math.round(Number(item.temp ?? 0)),
            windSpeed: Math.round(Number(item.wind_speed ?? 0)),
            icon: weather.icon
              ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
              : "",
            description: String(weather.description || "").trim(),
          };
        })
      : [],
  };
}

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
function readSessionToken() {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveSessionToken(token) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, token);
}

function clearSessionToken() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

async function apiRequest(path, options = {}) {
  const token = readSessionToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

function ProfileModal({ initialProfile, title, description, onClose, onSubmit, closable = true }) {
  const [form, setForm] = useState(initialProfile);

  useEffect(() => {
    setForm(initialProfile);
  }, [initialProfile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      nickname: form.nickname.trim(),
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
            <h2>{title}</h2>
          </div>
          {closable ? (
            <button className="ghost-icon" type="button" onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
          ) : null}
        </div>

        <p className="modal-description">{description}</p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            <span>Никнейм</span>
            <input
              name="nickname"
              type="text"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Например, YakutTraveler"
              required
            />
          </label>

          <label>
            <span>Instagram</span>
            <input
              name="instagram"
              type="url"
              value={form.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
            />
          </label>

          <label>
            <span>VK</span>
            <input
              name="vk"
              type="url"
              value={form.vk}
              onChange={handleChange}
              placeholder="https://vk.com/username"
            />
          </label>

          <label>
            <span>Номер WhatsApp</span>
            <input
              name="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="+7 999 000 00 00"
            />
          </label>

          <label>
            <span>Telegram</span>
            <input
              name="telegram"
              type="url"
              value={form.telegram}
              onChange={handleChange}
              placeholder="https://t.me/username"
            />
          </label>

          <button className="action-primary full-width" type="submit">
            Сохранить профиль
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPlaceModal({
  form,
  onChange,
  onFileChange,
  onSubmit,
  onClose,
  onStartPicking,
  isPicking,
  submitError,
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-wide">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Новое место</p>
            <h2>Добавить место</h2>
          </div>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="profile-form" onSubmit={onSubmit}>
          <label>
            <span>Название места</span>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={onChange}
              placeholder="Красивое озеро"
              required
            />
          </label>

          <label>
            <span>Фото места</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFileChange}
            />
            {form.image ? (
              <small className="muted-text">Файл выбран: {form.imageName || "изображение"}</small>
            ) : null}
          </label>

          <label>
            <span>Описание места</span>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Тихое место"
              rows="3"
              required
            />
          </label>

          <label>
            <span>Как проехать</span>
            <textarea
              name="routeDescription"
              value={form.routeDescription}
              onChange={onChange}
              placeholder="Опиши маршрут"
              rows="3"
              required
            />
          </label>

          <label>
            <span>На чем лучше поехать</span>
            <textarea
              name="bestTransport"
              value={form.bestTransport}
              onChange={onChange}
              placeholder="Например, на машине с высоким клиренсом"
              rows="2"
              required
            />
          </label>

          <div className="pick-row">
            <div className="pick-coords">
              <span>Координаты на карте</span>
              <strong>
                {form.lat && form.lng
                  ? `${Number(form.lat).toFixed(5)}, ${Number(form.lng).toFixed(5)}`
                  : "Точка пока не выбрана"}
              </strong>
              {isPicking ? <small>Сейчас кликни по карте справа, чтобы выбрать точку.</small> : null}
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

function ProfileMenu({ profile, myPlaces, onEdit, onShowMine }) {
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
        <strong>{profile.nickname}</strong>
        <span>Ваш профиль внутри сайта</span>
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
        <span>{myPlaces.length} добавлено с этого профиля</span>
        <button className="action-secondary full-width" type="button" onClick={onShowMine}>
          Показать мои места
        </button>
      </div>

      <button className="action-secondary full-width" type="button" onClick={onEdit}>
        Изменить никнейм и соцсети
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
<<<<<<< HEAD
=======
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [weather?.current?.observedAt]);

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
  const hasWeather = Boolean(weather?.current);
  const showPlaceholder = loading || (!hasWeather && !error);

  return (
<<<<<<< HEAD
    <div className="weather-card overlay">
      <div className={`weather-chip${showPlaceholder ? " loading" : ""}${error ? " error" : ""}`}>
=======
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
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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
<<<<<<< HEAD
      </div>
=======
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
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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

  const currentImage = images[index];

  return (
    <div className="modal-backdrop gallery-backdrop">
      <div className="gallery-modal">
        <div className="gallery-stage">
          <button className="ghost-icon gallery-close" type="button" onClick={onClose}>
            ✕
          </button>
          <button
            className="gallery-nav left"
            type="button"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
          >
            ‹
          </button>
          <img className="gallery-image" src={currentImage} alt="" />
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
  const scrollRef = useRef(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scrollState, setScrollState] = useState({
    visible: false,
    progress: 0,
    thumbSize: 0.24,
    remaining: 0,
  });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    function updateScrollState() {
      const maxScroll = Math.max(element.scrollHeight - element.clientHeight, 0);
      const visible = maxScroll > 8;
      const progress = maxScroll ? element.scrollTop / maxScroll : 0;
      const thumbSize = Math.min(
        1,
        Math.max(0.18, element.clientHeight / Math.max(element.scrollHeight, 1))
      );
      const remaining = maxScroll ? Math.round((1 - progress) * 100) : 0;

      setScrollState({
        visible,
        progress,
        thumbSize,
        remaining,
      });
    }

    updateScrollState();
    element.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [place?.id, myPlacesOpen, myPlaces.length]);

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
          <p>Нажмите на карточку на карте, и здесь появятся фото, описание и маршрут.</p>
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
                onClick={() =>
                  setImageIndex((current) => (current - 1 + images.length) % images.length)
                }
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
          <div className="sidebar-body" ref={scrollRef}>
          <div className="title-row">
            <div className="title-main">
              <h2>{place.title}</h2>
            </div>
            <ReactionButtons place={place} userVote={userVote} onVote={onVote} />
          </div>

            <div className="meta-line">
              <span>Добавил: {place.createdByNickname || "Неизвестно"}</span>
            </div>

            {myPlacesOpen ? (
              <div className="my-places-card">
                <div className="section-mini-head">
                  <strong>Мои места</strong>
                  <span>{myPlaces.length} шт.</span>
                </div>
                <MyPlacesPanel
                  items={myPlaces}
                  selectedPlaceId={place.id}
                  onSelect={onSelectMyPlace}
                />
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
              <span>На чем лучше поехать</span>
              <p>{place.bestTransport}</p>
            </div>
          </div>

          {scrollState.visible ? (
            <div className="scroll-indicator" aria-hidden="true">
              <span className="scroll-indicator-label">{scrollState.remaining}%</span>
              <div className="scroll-indicator-rail">
                <div
                  className="scroll-indicator-thumb"
                  style={{
                    height: `${scrollState.thumbSize * 100}%`,
                    top: `${scrollState.progress * (100 - scrollState.thumbSize * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {galleryOpen ? (
        <GalleryModal
          images={images}
          initialIndex={imageIndex}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);
  const [addPlaceForm, setAddPlaceForm] = useState(getEmptyPlace());
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
<<<<<<< HEAD
  const [mapMountKey, setMapMountKey] = useState(0);
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
  const [myPlacesOpen, setMyPlacesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [mapMarkerMode, setMapMarkerMode] = useState("text");
  const [weatherByPlace, setWeatherByPlace] = useState({});
  const [weatherLoadingId, setWeatherLoadingId] = useState(null);
  const [weatherErrorByPlace, setWeatherErrorByPlace] = useState({});
<<<<<<< HEAD
=======
  const [weatherClientKey, setWeatherClientKey] = useState("");

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
  const hasSession = Boolean(readSessionToken());
  const authRequired = !hasSession || !profile.nickname;
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
        const settings = await apiRequest("/api/settings/public");
        setTheme(settings.theme);

<<<<<<< HEAD
=======
        const weatherConfig = await apiRequest("/api/weather/config");
        setWeatherClientKey(weatherConfig.apiKey || "");

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
        const placesResponse = await apiRequest("/api/places");
        setPlaces(placesResponse.items);
        setSelectedPlaceId(placesResponse.items[0]?.id ?? null);

        if (hasSession) {
          try {
            const me = await apiRequest("/api/auth/me");
            setProfile(me.user);

            const mine = await apiRequest("/api/places/mine");
            setMyPlaces(mine.items);
          } catch (authError) {
            if (/авторизац/i.test(authError.message)) {
              clearSessionToken();
              setProfile(getEmptyProfile());
              setMyPlaces([]);
            } else {
              throw authError;
            }
          }
        }
      } catch (error) {
        setGlobalError(error.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [hasSession]);

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
    if (!window.L || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = window.L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([62.03, 129.73], 10);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
<<<<<<< HEAD
      window.setTimeout(() => {
        remountMap();
      }, 0);
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
<<<<<<< HEAD
  }, [mapMountKey]);
=======
  }, []);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const refreshSize = () => {
<<<<<<< HEAD
      map.invalidateSize({ pan: false });
    };
    const frame = window.requestAnimationFrame(refreshSize);
    const delayed = window.setTimeout(refreshSize, 120);
    const delayedLater = window.setTimeout(refreshSize, 320);
=======
      map.invalidateSize(true);
      map.eachLayer((layer) => {
        if (typeof layer.redraw === "function") {
          layer.redraw();
        }
      });
    };
    const frame = window.requestAnimationFrame(refreshSize);
    const delayed = window.setTimeout(refreshSize, 120);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
    window.addEventListener("resize", refreshSize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayed);
<<<<<<< HEAD
      window.clearTimeout(delayedLater);
      window.removeEventListener("resize", refreshSize);
    };
  }, [places.length, selectedPlaceId, mapMarkerMode, loading, isPickingOnMap, addPlaceModalOpen, myPlacesOpen]);
=======
      window.removeEventListener("resize", refreshSize);
    };
  }, [places.length, selectedPlaceId, mapMarkerMode, loading]);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

<<<<<<< HEAD
=======
    const bounds = [];

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
    places.forEach((place) => {
      const previewImage = getPlaceImages(place)[0] || "";
      const icon = window.L.divIcon({
        className: "leaflet-place-wrapper",
        html:
          mapMarkerMode === "image"
            ? `
          <div class="map-place-marker image-mode" data-marker-id="${place.id}">
            <img src="${previewImage}" alt="${place.title}" />
          </div>
        `
            : `
          <div class="map-place-marker text-mode" data-marker-id="${place.id}">
            <strong>${place.title}</strong>
          </div>
        `,
        iconSize: mapMarkerMode === "image" ? [62, 62] : [78, 28],
        iconAnchor: mapMarkerMode === "image" ? [31, 31] : [39, 14],
      });

      const marker = window.L.marker([place.lat, place.lng], { icon }).addTo(map);
      marker.on("click", () => {
        setSelectedPlaceId(place.id);
        setMyPlacesOpen(false);
<<<<<<< HEAD
        window.requestAnimationFrame(() => {
          map.invalidateSize({ pan: false });
        });
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
      });
      marker.on("mouseover", () => {
        marker.getElement()?.querySelector(".map-place-marker")?.classList.add("hovered");
      });
      marker.on("mouseout", () => {
        marker.getElement()?.querySelector(".map-place-marker")?.classList.remove("hovered");
      });

      markersRef.current.set(place.id, marker);
<<<<<<< HEAD
    });
  }, [places, mapMarkerMode, mapMountKey]);
=======
      bounds.push([place.lat, place.lng]);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, mapMarkerMode]);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const element = marker.getElement()?.querySelector(".map-place-marker");
      if (element) {
        element.classList.toggle("selected", id === selectedPlaceId);
      }
    });

<<<<<<< HEAD
  }, [selectedPlaceId, mapMountKey]);
=======
    if (selectedPlace && mapRef.current) {
      mapRef.current.panTo([selectedPlace.lat, selectedPlace.lng], {
        animate: true,
        duration: 0.4,
      });
    }
  }, [selectedPlace, selectedPlaceId]);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

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
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setWeatherByPlace((current) => ({ ...current, [cacheKey]: payload }));
        setWeatherErrorByPlace((current) => {
          const next = { ...current };
          delete next[cacheKey];
          return next;
        });
      })
<<<<<<< HEAD
      .catch((error) => {
        if (cancelled) {
          return;
        }
=======
      .catch(async (error) => {
        if (cancelled) {
          return;
        }

        if (weatherClientKey) {
          try {
            const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
            url.searchParams.set("lat", String(selectedPlace.lat));
            url.searchParams.set("lon", String(selectedPlace.lng));
            url.searchParams.set("appid", weatherClientKey);
            url.searchParams.set("units", "metric");
            url.searchParams.set("lang", "ru");
            url.searchParams.set("exclude", "minutely,daily,alerts");

            const response = await fetch(url);
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(payload?.message || "weather_fetch_failed");
            }

            if (cancelled) {
              return;
            }

            setWeatherByPlace((current) => ({
              ...current,
              [cacheKey]: normalizeOpenWeatherPayload(payload),
            }));
            setWeatherErrorByPlace((current) => {
              const next = { ...current };
              delete next[cacheKey];
              return next;
            });
            return;
          } catch {
            // fall through to standard error state
          }
        }

>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
        setWeatherErrorByPlace((current) => ({
          ...current,
          [cacheKey]: error.message || "Ошибка погоды",
        }));
      })
      .finally(() => {
        if (!cancelled) {
          setWeatherLoadingId((current) => (current === selectedPlace.id ? null : current));
        }
      });

    return () => {
      cancelled = true;
    };
<<<<<<< HEAD
  }, [selectedPlace, weatherByPlace]);
=======
  }, [selectedPlace, weatherByPlace, weatherClientKey]);
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df

  function openProfileEdit() {
    setProfileMenuOpen(false);
    setProfileModalOpen(true);
  }

  function handlePlaceFormChange(event) {
    const { name, value } = event.target;
    setAddPlaceForm((current) => ({ ...current, [name]: value }));
  }

<<<<<<< HEAD
  function remountMap() {
    setMapMountKey((current) => current + 1);
  }

=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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
    if (!readSessionToken()) {
      setMyPlaces([]);
      return;
    }
    const mine = await apiRequest("/api/places/mine");
    setMyPlaces(mine.items);
  }

  async function handleProfileSubmit(nextProfile) {
    try {
      setSavingProfile(true);
      if (authRequired) {
        const response = await apiRequest("/api/auth/session", {
          method: "POST",
          body: JSON.stringify(nextProfile),
        });
        saveSessionToken(response.token);
        setProfile(response.user);
      } else {
        const response = await apiRequest("/api/auth/me", {
          method: "PATCH",
          body: JSON.stringify(nextProfile),
        });
        setProfile(response.user);
      }
      await refreshMyPlaces();
      setProfileModalOpen(false);
      setGlobalError("");
    } catch (error) {
      setGlobalError(error.message || "Не удалось сохранить профиль");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleVote(vote) {
    if (!selectedPlace || authRequired) {
      setProfileModalOpen(true);
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
<<<<<<< HEAD
      remountMap();
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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
            onClick={() => setProfileMenuOpen((current) => !current)}
          >
            <span>
              <strong>{profile.nickname || "Войти"}</strong>
            </span>
          </button>

          {profileMenuOpen && profile.nickname ? (
            <ProfileMenu
              profile={profile}
              myPlaces={myPlaces}
              onEdit={openProfileEdit}
              onShowMine={() => {
                setMyPlacesOpen(true);
                setProfileMenuOpen(false);
                if (myPlaces[0]) {
                  setSelectedPlaceId(myPlaces[0].id);
                }
              }}
            />
          ) : null}
        </div>
      </header>

      {globalError ? <div className="global-error">{globalError}</div> : null}

      <main className="app-layout">
        <section className="map-column">
          <div className="map-card season-frame">
<<<<<<< HEAD
            <div
              key={mapMountKey}
              className={`map-area${isPickingOnMap ? " picking" : ""}`}
              ref={mapContainerRef}
            >
=======
            <div className={`map-area${isPickingOnMap ? " picking" : ""}`} ref={mapContainerRef}>
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
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
                <div className="map-picker-hint">Режим выбора точки включен. Кликни по карте.</div>
              ) : null}
              <div className="map-actions">
                <button
                  className="action-primary map-add-button"
                  type="button"
                  onClick={() => {
                    if (authRequired) {
                      setProfileModalOpen(true);
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
                <p>Подожди немного, профиль, тема и точки карты уже загружаются.</p>
              </div>
            </aside>
          ) : (
            <DetailPanel
              place={selectedPlace}
              userVote={selectedPlace?.reactions?.userVote || ""}
              onVote={handleVote}
              myPlaces={myPlaces}
              myPlacesOpen={myPlacesOpen}
              onSelectMyPlace={(id) => {
                setSelectedPlaceId(id);
              }}
              weather={selectedPlace ? weatherByPlace[String(selectedPlace.id)] || null : null}
              weatherLoading={weatherLoadingId === selectedPlace?.id}
              weatherError={selectedPlace ? weatherErrorByPlace[String(selectedPlace.id)] || "" : ""}
            />
          )}
        </div>
      </main>

      {(authRequired || profileModalOpen) && (
        <ProfileModal
          initialProfile={profile}
          title={authRequired ? "Простая авторизация" : "Редактирование профиля"}
          description={
            authRequired
              ? "Данные профиля теперь сохраняются на сервере. Укажи никнейм и ссылки на соцсети, чтобы войти."
              : "Здесь можно поменять никнейм и ссылки на Instagram, VK, WhatsApp и Telegram."
          }
          closable={!authRequired}
          onClose={() => {
            if (!authRequired && !savingProfile) {
              setProfileModalOpen(false);
            }
          }}
          onSubmit={handleProfileSubmit}
        />
      )}

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
<<<<<<< HEAD
            remountMap();
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
          }}
          onStartPicking={() => {
            pickModeRef.current = true;
            setIsPickingOnMap(true);
            setAddPlaceModalOpen(false);
            setSubmitError("");
<<<<<<< HEAD
            remountMap();
=======
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
          }}
          isPicking={isPickingOnMap}
          submitError={submitError}
        />
      ) : null}
    </div>
  );
}
