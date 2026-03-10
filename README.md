# Topolevsky Cloud (UkrDict AI)

Платформа для інтелектуального аналізу та класифікації слів української мови за допомогою штучного інтелекту.

## 🚀 Основні функції

- **Класифікація слів**: Автоматичне визначення рівня абстракції слова за 10-бальною шкалою (від філософських понять до максимально конкретних об'єктів).
- **Семантичні зв'язки**: ШІ автоматично визначає **гіперніми** (узагальнення) та **гіпоніми** (конкретизацію) для кожного слова.
- **Динамічне наповнення бази**: Система автоматично доповнює базу даних новими словами та зв'язками, якщо їх там немає.
- **Візуалізація категорій**: Відображення пошукового слова та його оточення у відповідних картках рівнів абстракції.
- **Авторизація**: Захищений вхід через Google OAuth та систему NextAuth.

## 🛠 Технологічний стек

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/).
- **AI Engine**: [Google Gemini 3 Flash](https://ai.google.dev/) для семантичного аналізу.
- **Database**: [MySQL](https://www.mysql.com/) з використанням безпечного SSH-тунелю.
- **ORM**: [Prisma](https://www.prisma.io/) для моделювання бази даних.
- **Анімації**: [Framer Motion](https://www.framer.com/motion/).
- **UI**: [Shadcn UI](https://ui.shadcn.com/) та [Lucide React](https://lucide.dev/).

## 📋 Структура проекту

- `app/features/` — основна сторінка зі словником та логікою пошуку.
- `lib/ai.ts` — інтеграція з Google Generative AI.
- `lib/db-tunnel.ts` — автоматичне підключення до бази даних через SSH.
- `components/` — набір UI компонентів (сайдбар, форми, навігація).
- `prisma/schema.prisma` — опис моделей даних (User, Profile, Address тощо).

## ⚙️ Налаштування

Для запуску проекту необхідно створити файли `.env` та `.env.local` з наступними змінними:

```env
# AI Config
GOOGLE_AI_API_KEY=your_gemini_key

# SSH Tunnel (для підключення до БД)
SSH_HOST=your_host
SSH_USER=your_user
SSH_PASS=your_pass

# Database
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=your_db_user
DB_PASS=your_db_pass
DB_NAME=your_db_name

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

## 🏃 Запуск

1. Встановіть залежності:
   ```bash
   npm install
   ```

2. Запустіть проект у режимі розробки:
   ```bash
   npm run dev
   ```

Проект буде доступний за адресою [http://localhost:3000](http://localhost:3000).
