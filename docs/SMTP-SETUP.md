# SMTP налаштування (Gmail / SendGrid)

Коротка інструкція для підключення реальної відправки листів з форми контакту.

1. Загальні кроки

- Скопіюйте `.env.example` в корені проєкту як `.env.local`.
- Заповніть відповідні значення (див. приклади нижче).
- Перезапустіть Next.js сервер: `npm run dev` або `npm run build && npm start`.

2. Gmail (рекомендується використовувати App Password)

- Увійдіть у свій Google акаунт.
- Увімкніть двофакторну автентифікацію (2FA) якщо ще не ввімкнена.
- Перейдіть у розділ безпеки → "Паролі програм" (App Passwords).
- Створіть новий App Password (виберіть "Mail" → "Other" або назвіть як "Next.js
  Contact").
- Скопіюйте згенерований пароль.

Налаштування у `.env.local`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_app_password_here
ADMIN_EMAIL=yarovision@gmail.com
```

Примітки:

- Gmail може блокувати підключення, якщо обліковий запис має обмеження; App
  Password працює з 2FA.
- Для корпоративних обліковок GSuite можуть бути додаткові політики.

3. SendGrid (SMTP через API key)

- Зареєструйтесь у SendGrid та увійдіть.
- У розділі API Keys створіть новий ключ (Full Access або Mail Send).
- Скопіюйте ключ.

Налаштування у `.env.local`:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY_HERE
ADMIN_EMAIL=yarovision@gmail.com
```

Примітки:

- В SendGrid ім'я користувача має бути `apikey`, а пароль — це ваш API Key.
- Переконайтесь, що ваш обліковий запис SendGrid має дозвіл на відправку пошти
  (sandbox треба відключити для production).

4. Тестування

- Через розробницьку форму в браузері: відкрийте `/contact`, заповніть і
  відправте форму.
- Через curl (замініть host/дані):

```
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@example.com","subject":"Тест","message":"Повідомлення"}'
```

- У відповідь API повертає JSON. При налаштованому SMTP:
  `{ message: 'Повідомлення надіслано.' }`.
- Якщо SMTP не заданий, сервер автоматично використовує Ethereal (тестовий)
  акаунт і поверне `previewUrl`:
  `{ message: 'Повідомлення надіслано.', previewUrl: 'https://ethereal.email/...'} `
  — відкрийте посилання щоб переглянути лист.

5. Безпека

- Ніколи не комітьте `.env.local` до репозиторію.
- Використовуйте секрети середовища (коли деплоїте на Vercel/Netlify/Heroku
  встановіть змінні у налаштуваннях проєкту).

6. Якщо потрібна допомога

- Можу пройти з вами кроки створення App Password або SendGrid API key по кроках
  (скріншоти/інструкції). Також можу допомогти перевірити відповідь API після
  того, як ви вставите свої змінні.
