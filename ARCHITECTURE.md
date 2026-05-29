# ARCHITECTURE

## Общая схема

MESTA состоит из:

- frontend на React/Vite;
- backend на Node.js;
- PostgreSQL как основного хранилища;
- локального файлового хранилища `uploads/` для картинок;
- Open-Meteo для погоды;
- production-схемы на VPS через nginx reverse proxy и PM2.

## Frontend: React/Vite

Frontend расположен в `src/`.

- `src/main.jsx` — точка входа.
- `src/App.jsx` — основной интерфейс.
- `src/styles.css` — стили.

Vite dev server работает на `127.0.0.1:4322`.

В dev-режиме `/api` проксируется на `127.0.0.1:4323`.

## Backend: Node.js

Backend расположен в `server.js`.

Backend запускается командой:

```bash
npm start
```

Backend слушает `127.0.0.1:4323`.

Backend реализован на стандартном `node:http` без Express.

## PostgreSQL

Основное хранилище данных — PostgreSQL через пакет `pg`.

Подключение берется из `process.env.DATABASE_URL`.

Если `DATABASE_URL` не задан, сервер не стартует.

Таблицы создаются автоматически:

- `users`
- `places`
- `reactions`
- `settings`

## Где хранятся данные

В PostgreSQL хранятся:

- пользователи;
- bcrypt hash паролей;
- роли пользователей;
- места;
- пути к картинкам;
- реакции;
- настройки интерфейса.

JSON-файлы в `data/` используются только как seed-источник, если таблицы PostgreSQL пустые.

## Uploads

Картинки не хранятся в PostgreSQL.

Backend:

- принимает изображение как data URL;
- конвертирует его через `sharp` в optimized WebP;
- ограничивает максимальную ширину 1600px;
- сохраняет WebP с качеством 75;
- записывает в PostgreSQL только путь.

Фото мест сохраняются в `uploads/places/`.

Фото аватаров сохраняются в `uploads/avatars/`.

В БД хранится путь вида `/uploads/places/photo.webp` или `/uploads/avatars/avatar.webp`.

`uploads/` игнорируется Git.

## Weather

Погода берется через Open-Meteo:

```bash
https://api.open-meteo.com/v1/forecast
```

API-ключ не нужен. Backend принимает `lat/lng`, запрашивает Open-Meteo и нормализует ответ в формат frontend:

- `current.temp`
- `current.windSpeed`
- `current.description`
- `hourly`

Коды погоды Open-Meteo преобразуются в русские описания на backend.

Frontend также содержит fallback на прямой запрос к Open-Meteo, если backend `/api/weather` временно вернул ошибку.

## Auth

Авторизация без почты:

- регистрация по `login + password + nickname`;
- вход по `login + password`;
- пароль хранится только как bcrypt hash;
- сессия хранится в HttpOnly cookie с JWT.

Роли:

- `user`
- `moderator`
- `admin`

Добавление места доступно авторизованному пользователю. Модерация доступна только `moderator` и `admin`.

## Nginx/PM2 на VPS

Production-схема:

- PM2 запускает backend командой `npm start`.
- Backend слушает локальный порт `4323`.
- nginx принимает внешний HTTP/HTTPS-трафик.
- nginx проксирует запросы к backend.
- Backend раздает production-сборку `dist/` и API.

Пример nginx:

```nginx
location / {
  proxy_pass http://127.0.0.1:4323;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

PM2:

```bash
pm2 start server.js --name mesta
pm2 save
```
