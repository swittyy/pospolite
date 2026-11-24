# POSPOLITE

**Открытый проект. Свободное программное обеспечение. Технологии для всех.**

POSPOLITE — независимый проект о компьютерной технике и комплектующих. Frontend построен на Astro и TypeScript; Rust API обслуживает каталог и приватную административную панель.

**GitHub:** https://github.com/swittyy/pospolite  
**Discord:** https://discord.gg/5xtcNRp36  
**Telegram:** https://t.me/pospoliteshop

## Стек

- Astro 5 + TypeScript — статический сайт.
- Rust + Axum — API каталога и админ-панель.
- JSON-файл — постоянное хранилище каталога на сервере.

## Frontend

Требуется Node.js 20.3.0 или новее.

```bash
npm install
npm run dev
npm run check
npm run build
```

Для подключения динамического каталога укажи адрес Rust API во время сборки:

```bash
PUBLIC_API_URL=https://your-api.example.com npm run build
```

Без `PUBLIC_API_URL` сайт продолжит показывать встроенный статический каталог.

## Rust API и админка

API должен работать на отдельном сервере с постоянным диском. GitHub Pages не запускает Rust-процессы.

Перед запуском задай пароль администратора через переменную окружения `POSPOLITE_ADMIN_TOKEN` (минимум 12 символов). Не записывай пароль в репозиторий или frontend. Для публичного сервера используй длинный уникальный секрет:

```bash
read -rsp "Admin password: " POSPOLITE_ADMIN_TOKEN; echo\nexport POSPOLITE_ADMIN_TOKEN
export POSPOLITE_CATALOG_PATH="./data/catalog.json"
cargo run --release
```

API слушает `0.0.0.0:$PORT` (по умолчанию порт 3000).

Эндпоинты:

- `GET /api/health` — состояние API.
- `GET /api/catalog` — публичный каталог.
- `POST /api/admin/session` — проверка токена администратора.
- `PUT /api/admin/catalog` — сохранение каталога; требует `Authorization: Bearer <token>`.

При первом запуске каталог инициализируется данными из `data/catalog.json`. Последующие изменения записываются в `POSPOLITE_CATALOG_PATH`. Убедись, что каталог данных находится на постоянном диске, а не во временной файловой системе контейнера.

### Административная панель

Открой `/admin/` на опубликованном сайте. Введи пароль администратора. Адрес API задаётся при сборке через `PUBLIC_API_URL`. После успешной проверки откроется панель с анимированным переходом. В ней можно редактировать товары, цены, характеристики, примечания и наличие, добавлять и удалять товары и категории. Кнопка сохранения записывает изменения на сервер.

**Безопасность:** используй HTTPS для API, длинный уникальный токен и не вставляй секрет в исходники сайта. Токен хранится только в памяти вкладки и не сохраняется в localStorage. CORS разрешает браузерные запросы с любых origin, но все операции записи защищены Bearer-токеном; для публичного развёртывания рекомендуется дополнительно ограничить origin на уровне reverse proxy.

### Развёртывание на GitHub Pages

1. В настройках репозитория открой **Settings → Pages → Build and deployment** и выбери **GitHub Actions** как источник публикации.
2. Workflow `.github/workflows/deploy-pages.yml` собирает Astro и публикует `dist/` при каждом push в `main`.
3. Сайт проекта доступен по адресу `https://swittyy.github.io/pospolite/`, панель — `https://swittyy.github.io/pospolite/admin/`.

### Подключение авторизации и сохранения

GitHub Pages публикует только статические файлы. Он не запускает Rust API и не может хранить секрет администратора. Для реального входа и сохранения каталога нужен отдельный HTTPS API с `POSPOLITE_ADMIN_TOKEN` и постоянным хранилищем. Не помещай токен в исходники, GitHub Pages или клиентский JavaScript. После запуска API собери frontend с `PUBLIC_API_URL`, указывающим на его адрес.

## Структура

- `src/pages/admin.astro` — панель управления.
- `src/pages/catalog/[type].astro` — страницы категорий.
- `src/data/catalog.ts` — данные для статической сборки.
- `data/catalog.json` — стартовый каталог и серверное хранилище.
- `src/main.rs` — Rust API.

## Статус

- [x] Astro frontend и каталог.
- [x] Админ-панель с токен-аутентификацией.
- [x] API чтения и сохранения каталога.
- [x] JSON persistence и управление товарами/наличием.
- [ ] Развёртывание Rust API на постоянном сервере.
- [ ] Настройка PUBLIC_API_URL и публикация обновлённого frontend.
