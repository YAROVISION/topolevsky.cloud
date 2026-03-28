# Lexical Graph Bot — Інструкція встановлення на VPS

> **Конфігурація:** Shared Hosting (MySQL) ←── VPS `31.97.73.249` (Node.js + PM2 + bot.mjs + Docker/Neo4j ✅)

---

## Крок 1 — Встановлення Node.js 20 на VPS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version   # має бути v20.x.x
npm --version
```

---

## Крок 2 — Встановлення PM2

```bash
npm install -g pm2
pm2 --version
```

---

## Крок 3 — Перевірка підключення до Neo4j

```bash
# Перевіряємо що контейнер живий
docker ps

# Перевіряємо логи
docker logs neo4j --tail 20
# В кінці має бути: "Started."
```

---

## Крок 4 — Дозволити Remote MySQL на Shared Hosting

В панелі Hostinger → **Shared Hosting → Databases → Remote MySQL** → додай IP:

```
31.97.73.249
```

---

## Крок 5 — Створення папки бота

```bash
mkdir -p ~/word-bot
cd ~/word-bot
npm init -y
npm pkg set type=module
npm install @google/generative-ai mysql2 neo4j-driver dotenv
```

---

## Крок 6 — Файл .env

```bash
nano ~/word-bot/.env
```

Вставити (Ctrl+Shift+V):

```env
# MySQL на Shared Hosting
MYSQL_HOST=sql123.hostinger.com
MYSQL_USER=твій_db_юзер
MYSQL_PASSWORD=твій_db_пароль
MYSQL_DB=назва_бази
MYSQL_PORT=3306

# Neo4j у Docker (вже запущений)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=твій_neo4j_пароль

# Google Gemini AI API
GOOGLE_AI_API_KEY=AIzaSy...

# Налаштування бота
BATCH_SIZE=5
INTERVAL_MS=5000
```

Зберегти: **Ctrl+O → Enter → Ctrl+X**

> ⚠️ Точний `MYSQL_HOST` знайди в панелі Hostinger → Shared Hosting → Databases

---

## Крок 7 — Файл bot.mjs

```bash
nano ~/word-bot/bot.mjs
```

Вставити код бота → зберегти: **Ctrl+O → Enter → Ctrl+X**

---

## Крок 8 — Запуск бота через PM2

```bash
cd ~/word-bot
pm2 start bot.mjs --name lexical-bot
pm2 logs lexical-bot
```

Має з'явитись:

```
🚀 Lexical Graph Bot запущено (Gemini AI Edition)
✓ MySQL підключено
✓ Neo4j підключено
```

---

## Крок 9 — Автозапуск після перезавантаження VPS

```bash
pm2 startup
# Скопіюй і виконай команду яку покаже PM2
pm2 save
```

---

## Шпаргалка — щоденні команди

```bash
pm2 status                   # статус бота
pm2 logs lexical-bot         # логи в реальному часі
pm2 restart lexical-bot      # перезапустити після змін bot.mjs
pm2 stop lexical-bot         # зупинити бота

docker ps                    # статус Neo4j контейнера
docker logs neo4j --tail 20  # логи Neo4j
```

---

## Діагностика проблем

| Проблема | Що перевірити |
|---|---|
| MySQL не підключається | Remote MySQL додано для `31.97.73.249`? |
| Neo4j не відповідає | `docker ps` — чи статус Running? |
| Бот падає | `pm2 logs lexical-bot` — дивись помилку |
| Порти закриті | `ufw allow 7474` та `ufw allow 7687` |
