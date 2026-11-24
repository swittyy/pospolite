export type Availability = "unknown" | "in_stock" | "out_of_stock";

export interface Product {
  code: string;
  name: string;
  details: string;
  price: string;
  note: string;
  symbol: string;
  availability: Availability;
}

export interface Category {
  slug: string;
  title: string;
  index: string;
  description: string;
  products: Product[];
}

export const categories: Category[] = [
  {
    "slug": "gpu",
    "title": "Видеокарты",
    "index": "01 / GPU",
    "description": "ГРАФИЧЕСКИЕ УСКОРИТЕЛИ И ВИДЕОАДАПТЕРЫ.",
    "products": [
      {
        "code": "GRAPHICS",
        "name": "Встроенная графика Intel",
        "details": "Отдельная видеокарта не подтверждена",
        "price": "300 ₽",
        "note": "Требует уточнения",
        "symbol": "GPU",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "cpu",
    "title": "Процессоры",
    "index": "02 / CPU",
    "description": "ПРОЦЕССОРЫ ДЛЯ ТВОЕЙ СБОРКИ.",
    "products": [
      {
        "code": "CPU / INTEL",
        "name": "Процессор Intel Pentium",
        "details": "Точная модель не указана",
        "price": "500 ₽",
        "note": "Модель уточняется",
        "symbol": "P",
        "availability": "unknown"
      },
      {
        "code": "CPU / INTEL",
        "name": "Процессор Intel Celeron",
        "details": "Точная модель не указана",
        "price": "200 ₽",
        "note": "Модель уточняется",
        "symbol": "C",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "ram",
    "title": "Оперативная память",
    "index": "03 / RAM",
    "description": "МОДУЛИ ОПЕРАТИВНОЙ ПАМЯТИ.",
    "products": [
      {
        "code": "RAM / DDR4",
        "name": "Оперативная память DDR4 AMD",
        "details": "Частота 2400 MHz · объём уточняется",
        "price": "750 ₽",
        "note": "Модель уточняется",
        "symbol": "RAM",
        "availability": "unknown"
      },
      {
        "code": "RAM / DDR2",
        "name": "Samsung DDR2",
        "details": "1 GB · 2 модуля",
        "price": "250 ₽",
        "note": "Пара модулей",
        "symbol": "RAM",
        "availability": "unknown"
      },
      {
        "code": "RAM / DDR2",
        "name": "Kingston DDR2",
        "details": "Указано 1 GB / 2 GB · 2 модуля",
        "price": "400 ₽",
        "note": "Характеристики уточняются",
        "symbol": "RAM",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "motherboards",
    "title": "Материнские платы",
    "index": "04 / MB",
    "description": "МАТЕРИНСКИЕ ПЛАТЫ И ОСНОВА СИСТЕМЫ.",
    "products": [
      {
        "code": "MOTHERBOARD",
        "name": "Материнские платы",
        "details": "2 штуки · модели и сокеты уточняются",
        "price": "750 ₽",
        "note": "За указанную позицию",
        "symbol": "MB",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "psu",
    "title": "Блоки питания",
    "index": "05 / POWER",
    "description": "ПИТАНИЕ И ЭНЕРГОСНАБЖЕНИЕ СИСТЕМЫ.",
    "products": [
      {
        "code": "POWER / PSU",
        "name": "Блок питания FSP Group",
        "details": "Мощность 450 W",
        "price": "600 ₽",
        "note": "Модель уточняется",
        "symbol": "450W",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "cooling",
    "title": "Охлаждение",
    "index": "06 / COOLING",
    "description": "КУЛЕРЫ И СИСТЕМЫ ОХЛАЖДЕНИЯ.",
    "products": [
      {
        "code": "COOLING",
        "name": "Кулер Intel",
        "details": "Маркировка на записи: 2D / 1C",
        "price": "250 ₽",
        "note": "Совместимость уточняется",
        "symbol": "CPU",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "keyboards",
    "title": "Клавиатуры",
    "index": "07 / KEYBOARD",
    "description": "КЛАВИАТУРЫ И УСТРОЙСТВА ВВОДА.",
    "products": [
      {
        "code": "KEYBOARD / RAZER",
        "name": "Razer BlackWidow",
        "details": "Проводная клавиатура",
        "price": "2 000 ₽",
        "note": "Версия уточняется",
        "symbol": "RZ",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "mice",
    "title": "Мыши",
    "index": "08 / MOUSE",
    "description": "МЫШИ И УСТРОЙСТВА УПРАВЛЕНИЯ.",
    "products": [
      {
        "code": "MOUSE / PENN",
        "name": "Проводная мышь Penn",
        "details": "2 штуки",
        "price": "100 ₽",
        "note": "Модель уточняется",
        "symbol": "M",
        "availability": "unknown"
      },
      {
        "code": "MOUSE / RAZER",
        "name": "Проводная мышь Razer",
        "details": "Белый корпус",
        "price": "1 300 ₽",
        "note": "Модель уточняется",
        "symbol": "RZ",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "audio",
    "title": "Аудио",
    "index": "09 / AUDIO",
    "description": "КОЛОНКИ И АУДИОУСТРОЙСТВА.",
    "products": [
      {
        "code": "AUDIO",
        "name": "Колонки",
        "details": "Маркировка в записи: 6IN224 — требует проверки",
        "price": "350 ₽",
        "note": "Модель уточняется",
        "symbol": "SND",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "monitors",
    "title": "Мониторы",
    "index": "10 / DISPLAY",
    "description": "МОНИТОРЫ И ДИСПЛЕИ.",
    "products": [
      {
        "code": "DISPLAY / NEC",
        "name": "Монитор NEC LCD170?",
        "details": "Диагональ и точная модель не подтверждены",
        "price": "1 200 ₽",
        "note": "Модель уточняется",
        "symbol": "NEC",
        "availability": "unknown"
      },
      {
        "code": "DISPLAY / PHILIPS",
        "name": "Монитор Philips 223E",
        "details": "Полная модификация не указана",
        "price": "1 250 ₽",
        "note": "Модель уточняется",
        "symbol": "PH",
        "availability": "unknown"
      }
    ]
  },
  {
    "slug": "cases",
    "title": "Корпуса",
    "index": "11 / CASE",
    "description": "КОРПУСА И КОМПЛЕКТУЮЩИЕ КОРПУСА.",
    "products": [
      {
        "code": "CASE / DVD",
        "name": "Корпус ПК с DVD-приводом",
        "details": "Другие характеристики не указаны",
        "price": "150 ₽",
        "note": "Комплектация уточняется",
        "symbol": "PC",
        "availability": "unknown"
      }
    ]
  }
];

export const getCategory = (slug: string): Category | undefined =>
  categories.find((category) => category.slug === slug);
