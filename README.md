# MESTA

MESTA — локальное приложение про интересные места Якутии.

- Frontend: `Vite + React`.
- Backend: Node.js без web-фреймворка.
- Основное хранилище данных: PostgreSQL через `pg`.
- Изображения: локальная папка `uploads/`, в БД хранится только путь.
- Погода: Open-Meteo без API-ключа.

## Требования

- Node.js 20+
- PostgreSQL 14+
- npm

## Создание базы PostgreSQL

```sql
CREATE DATABASE mesta;
```

Пример строки подключения:

```bash
postgresql://postgres:postgres@127.0.0.1:5432/mesta
```

## Настройка `.env`

Создайте `.env` в корне проекта по примеру [.env.example](.env.example):

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/mesta
JWT_SECRET=replace_with_a_long_random_string
```

Если `DATABASE_URL` не задан, backend завершит старт с понятной ошибкой.

Погода работает через Open-Meteo и не требует ключа в `.env`.

## Установка зависимостей

```bash
npm install
```

Все зависимости описаны в `package.json` и `package-lock.json`; старые пути вроде `../grv/node_modules` не используются.

## Запуск backend

```bash
npm start
```

Backend работает на `http://127.0.0.1:4323`.

При старте backend:

- подключается к PostgreSQL через `process.env.DATABASE_URL`;
- создает таблицы `users`, `places`, `reactions`, `settings`, если их нет;
- если таблицы пустые, переносит seed из текущих `data/*.json`;
- после seed приложение работает с PostgreSQL, JSON-файлы не используются как рабочее хранилище.

## Запуск frontend

```bash
npm run dev
```

Frontend работает на `http://127.0.0.1:4322`.

Vite проксирует `/api` на backend `http://127.0.0.1:4323`.

На Windows, если PowerShell блокирует `npm.ps1`, используйте:

```bash
npm.cmd start
npm.cmd run dev
```

## Build

```bash
npm run build
```

Production-сборка создается в `dist/`. Команда `npm start` раздает `dist`, если он существует.

## Авторизация

Почта не используется.

- `POST /api/auth/register` — регистрация по `login + password + nickname`.
- `POST /api/auth/login` — вход по `login + password`.
- `GET /api/auth/me` — текущий пользователь.
- `PATCH /api/auth/me` — обновление профиля.
- `DELETE /api/auth/session` — выход.

Пароль хранится только как bcrypt hash. Сессия хранится в HttpOnly cookie с JWT.

Роли: `user`, `moderator`, `admin`.

## Погода

Погода работает без API-ключа через Open-Meteo:

```bash
https://api.open-meteo.com/v1/forecast
```

Endpoint `/api/weather?lat=...&lng=...` возвращает формат frontend:

- `current.temp`
- `current.windSpeed`
- `current.description`
- `hourly`

Backend преобразует `weather_code` Open-Meteo в русское описание.

## API

- `GET /api/health`
- `GET /api/settings/public`
- `GET /api/weather/config`
- `GET /api/weather?lat=...&lng=...`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `DELETE /api/auth/session`
- `GET /api/places`
- `GET /api/places/mine`
- `POST /api/places`
- `POST /api/places/:id/reaction`
- `GET /api/moderation/places`
- `PATCH /api/places/:id/moderation`

## Изображения

Загруженные картинки не сохраняются в PostgreSQL и не сохраняются как base64. Backend принимает data URL, конвертирует изображение через `sharp` в optimized WebP, ограничивает максимальную ширину 1600px и использует качество WebP 75.

Фото мест сохраняются в:

```bash
uploads/places/
```

Фото аватаров сохраняются в:

```bash
uploads/avatars/
```

В PostgreSQL хранится только путь вида `/uploads/places/photo.webp` или `/uploads/avatars/avatar.webp`.

`uploads/` игнорируется Git.
