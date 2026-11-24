# POSPOLITE

**Открытый проект. Свободное программное обеспечение. Технологии для всех.**

POSPOLITE — независимый проект о компьютерной технике и комплектующих. Сейчас проект включает статический сайт с предварительным каталогом; в дальнейшем планируется развитие полноценного интернет-магазина и платформы для подбора комплектующих.

**Сайт:** https://pospoliteshop.ru  
**GitHub:** https://github.com/swittyy/pospolite  
**Discord:** https://discord.gg/5xtcNRp36  
**Telegram:** https://t.me/pospoliteshop

## О проекте

POSPOLITE развивается открыто: исходный код доступен для изучения, а предложения сообщества помогают улучшать проект. Каталог постепенно наполняется реальными позициями. Если модель или характеристики пока неизвестны, они явно отмечаются как требующие уточнения.

## Технологии

- **Frontend:** HTML, CSS, JavaScript — интерфейс сайта, адаптивная вёрстка, темы и интерактивность.
- **Backend:** Rust — серверная часть. В репозитории добавлен начальный каркас API на Rust с HTTP-сервером и проверочным маршрутом.
- **API:** REST-подход; серверный API будет постепенно расширяться.
- **Frontend hosting:** GitHub Pages — публикация статического сайта.
- **Backend hosting:** отдельный сервер или хостинг с поддержкой запуска Rust-приложений.

GitHub Pages не запускает Rust-код. Поэтому frontend и backend публикуются отдельно. На текущем этапе сайт продолжает работать как статический frontend; Rust API пока не подключён к каталогу.

## Backend на Rust

Исходники backend находятся в `src/main.rs`, конфигурация Cargo — в `Cargo.toml`.

Текущий стартовый сервер:
- запускает HTTP API;
- предоставляет `GET /api/health` для проверки доступности;
- возвращает JSON со статусом сервиса.

Запуск локально при установленном Rust toolchain:

```bash
cargo run
```

По умолчанию сервер слушает `127.0.0.1:3000`. Проверка:

```bash
curl http://127.0.0.1:3000/api/health
```

Это начальная основа, а не готовая коммерческая backend-система: база данных, авторизация, заказы, склад и интеграция с frontend ещё не реализованы.

## Структура проекта

```text
.
├── index.html
├── category.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── catalog.js
├── src/
│   └── main.rs
├── Cargo.toml
├── README.md
└── LICENSE
```

## План развития

- [x] Статический сайт и адаптивный интерфейс.
- [x] Светлая, тёмная и системная темы.
- [x] Предварительный каталог товаров.
- [x] Начальный Rust API с health-check.
- [ ] Подключение базы данных и управление каталогом.
- [ ] Подключение frontend к backend API.
- [ ] Поиск и фильтрация товаров.
- [ ] Корзина и оформление заказов.
- [ ] Учёт остатков и административная панель.
- [ ] Подбор и конфигуратор сборок ПК.

Отмеченные как планируемые функции ещё не реализованы.

## Участие в проекте

Приветствуются идеи, предложения, сообщения об ошибках и Pull Requests. Перед отправкой изменений желательно описать, что именно меняется и зачем.

## Лицензия

Проект распространяется под лицензией **MIT**. Подробности — в файле [LICENSE](LICENSE).

---

# POSPOLITE

**Open project. Free software. Technology for everyone.**

POSPOLITE is an independent project focused on computer hardware and components. The current repository contains a static website with a preliminary product catalog. The long-term goal is to grow it into a full online store and a platform for choosing PC components.

**Website:** https://pospoliteshop.ru  
**GitHub:** https://github.com/swittyy/pospolite  
**Discord:** https://discord.gg/5xtcNRp36  
**Telegram:** https://t.me/pospoliteshop

## Technology Stack

- **Frontend:** HTML, CSS and JavaScript.
- **Backend:** Rust. An initial HTTP API scaffold is included.
- **API:** REST-style endpoints, to be expanded.
- **Frontend hosting:** GitHub Pages.
- **Backend hosting:** a separate host capable of running Rust applications.

GitHub Pages serves static files and cannot execute Rust. The current frontend remains static and is not connected to the Rust API yet.

## Rust Backend

The backend source is in `src/main.rs`, with its Cargo configuration in `Cargo.toml`.

The initial server exposes `GET /api/health`, returning a JSON health status. Run it locally with `cargo run`; it listens on `127.0.0.1:3000` by default.

This is only a foundation. Database storage, authentication, inventory, orders and frontend integration are not implemented yet.

## Contributing

Ideas, suggestions, bug reports and pull requests are welcome.

## License

Licensed under the **MIT License**. See [LICENSE](LICENSE).
