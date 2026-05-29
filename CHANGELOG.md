# CHANGELOG

Все заметные изменения проекта нужно добавлять сюда.

## Текущее состояние

### PostgreSQL

- Backend переведен с JSON-файлов на PostgreSQL через `pg`.
- Подключение берется из `process.env.DATABASE_URL`.
- Добавлена понятная ошибка старта, если `DATABASE_URL` не задан.
- Таблицы `users`, `places`, `reactions`, `settings` создаются автоматически.
- Добавлен seed из текущих `data/*.json`, если таблицы пустые.
- JSON-файлы больше не используются как рабочее хранилище приложения.

### Авторизация

- Добавлена регистрация по `login + password`.
- Почта не используется.
- Пароли хранятся как bcrypt hash.
- Сессия хранится в HttpOnly cookie с JWT.
- Добавлены роли `user`, `moderator`, `admin`.
- Добавление места доступно только авторизованному пользователю.
- Модерация доступна только `moderator/admin`.

### Uploads

- `uploads/` исключен из Git.
- Картинки не хранятся в PostgreSQL.
- Backend сохраняет картинки локально в `uploads/places/`.
- В PostgreSQL хранится только путь к файлу.

### Sharp/WebP

- Добавлена зависимость `sharp`.
- Загружаемые изображения конвертируются и сжимаются в optimized WebP.
- Максимальная ширина изображения: 1600px.
- Качество WebP: 75.
- Для мест сохраняется путь вида `/uploads/places/name.webp`.
- Для аватаров сохраняется путь вида `/uploads/avatars/name.webp`.
- Base64 не хранится в JSON или PostgreSQL.

### Погода

- OpenWeather One Call API заменен на Open-Meteo API.
- `OPENWEATHER_API_KEY` больше не нужен.
- `/api/weather` работает по `lat/lng` без ключа локально и на VPS.
- Backend использует `https://api.open-meteo.com/v1/forecast`.
- Backend нормализует Open-Meteo в формат frontend: `current.temp`, `current.windSpeed`, `current.description`, `hourly`.
- Добавлено преобразование `weather_code` в русское описание.
- Запрос Open-Meteo переведен на новый параметр `current=temperature_2m,wind_speed_10m,weather_code`.
- Добавлен frontend fallback: если `/api/weather` временно недоступен, браузер пробует запросить Open-Meteo напрямую.

### Vite scripts

- Frontend запускается через `npm run dev`.
- Vite dev server работает на `127.0.0.1:4322`.
- Proxy `/api` ведет на backend `127.0.0.1:4323`.
- Старые пути вроде `../grv/node_modules` не используются.

### VPS запуск

- Backend запускается через `npm start`.
- Для VPS предполагается запуск backend через PM2.
- Backend слушает локальный порт `4323`.
- `dist/` раздается backend после `npm run build`.

### Nginx proxy

- Для VPS предусмотрена схема nginx reverse proxy на `127.0.0.1:4323`.
- nginx должен проксировать внешний трафик на Node.js backend.

## Правило на будущее

При каждом существенном изменении проекта обновлять:

- этот `CHANGELOG.md`;
- `PROJECT_CONTEXT.md`, если меняются правила запуска, env или контекст;
- `ARCHITECTURE.md`, если меняется устройство frontend/backend/БД/uploads/VPS.
