# PROJECT CONTEXT

## Что такое MESTA

MESTA — приложение про интересные места Якутии. Пользователь может смотреть места на карте, открывать карточку места, смотреть фото, маршрут, транспорт, погоду, ставить реакции и добавлять свои точки после авторизации.

Проект рассчитан на локальный запуск на Windows/Mac и на деплой на VPS.

## Локальный запуск

```bash
npm install
npm start
npm run dev
```

Backend: `http://127.0.0.1:4323`.

Frontend: `http://127.0.0.1:4322`.

На Windows при блокировке `npm.ps1` используйте `npm.cmd`.

## Frontend

Frontend находится в `src/`:

- `src/App.jsx` — основной React-интерфейс.
- `src/main.jsx` — точка входа React.
- `src/styles.css` — стили.

Frontend использует Vite, Leaflet и proxy `/api` на backend.

## Backend

Backend находится в `server.js`.

Он отвечает за:

- HTTP API;
- PostgreSQL;
- создание таблиц;
- seed из `data/*.json`, если таблицы пустые;
- авторизацию;
- bcrypt hash паролей;
- JWT-сессию в HttpOnly cookie;
- загрузку и сжатие изображений через `sharp`;
- раздачу `dist/`, `public/` и `uploads/`;
- погоду через Open-Meteo без API-ключа.

## Env переменные

Обязательная:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/mesta
```

Рекомендуемая:

```bash
JWT_SECRET=replace_with_a_long_random_string
```

Погода не требует env-ключа.

Реальный `.env` не должен попадать в Git.

## Что уже исправлялось

- Уточнены команды локального запуска: backend через `npm start`, frontend через `npm run dev`.
- Зафиксированы локальные порты: frontend `127.0.0.1:4322`, backend `127.0.0.1:4323`.
- Убран Leaflet CDN, Leaflet переведен в npm-зависимость.
- Исправлен `.gitignore`: `.env`, `node_modules/`, `dist/`, `uploads/` не должны попадать в Git.
- Backend переведен с JSON-файлов на PostgreSQL.
- Добавлена авторизация по `login + password` без почты.
- Пароли хранятся только как bcrypt hash.
- Сессия хранится в HttpOnly cookie с JWT.
- Загрузка картинок сохраняет optimized WebP через `sharp`: максимальная ширина 1600px, качество 75.
- Фото мест сохраняются в `uploads/places/`, аватары в `uploads/avatars/`.
- В PostgreSQL хранится только путь к файлу, base64 не хранится.
- Погода переведена с OpenWeather One Call API на Open-Meteo без ключа.
- Для погоды используется новый Open-Meteo `current=temperature_2m,wind_speed_10m,weather_code`.
- Если backend weather endpoint недоступен, frontend пробует прямой Open-Meteo fallback.
- JSON-файлы используются только как источник первичного seed при пустой БД.

## Правило на будущее

Все новые существенные изменения проекта нужно дописывать в:

- `PROJECT_CONTEXT.md` — контекст и правила работы с проектом;
- `ARCHITECTURE.md` — архитектурные решения;
- `CHANGELOG.md` — история изменений.
