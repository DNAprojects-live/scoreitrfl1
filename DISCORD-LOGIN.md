# Регистрация через Discord (OAuth2)

## Как это работает
1. Игрок жмёт Continue with Discord, сайт открывает /api/auth/discord.
2. Функция отправляет его на discord.com, где он нажимает "Авторизовать" (пароль Discord сайт не видит).
3. Discord возвращает его на /api/auth/callback?code=...
4. Сервер меняет code на токен, запрашивает GET https://discord.com/api/users/@me и получает id, username и hash аватара.
5. Сервер ставит подписанную cookie-сессию. Сайт вызывает /api/me, получает ник и аватар,
   сам подставляет аватар в профиль и переходит к шагу Roblox (код в описании профиля).

## Аватар
Discord отдаёт не картинку, а hash. Ссылка собирается так:
`https://cdn.discordapp.com/avatars/{id}/{hash}.png?size=256` (если hash начинается с `a_`, это gif).
Если аватара нет, используется стандартный: `https://cdn.discordapp.com/embed/avatars/{0-5}.png`.
Когда человек сменит аватар в Discord, при следующем входе подтянется новый.

## Настройка (10 минут)
1. https://discord.com/developers/applications -> твоё приложение (можно то же, что у бота) -> OAuth2.
   Скопируй Client ID, нажми Reset Secret и скопируй Client Secret.
2. В поле Redirects добавь точный адрес: `https://ТВОЙ-САЙТ.vercel.app/api/auth/callback`
   (для проверки локально через `vercel dev` ещё `http://localhost:3000/api/auth/callback`).
3. Vercel -> Project -> Settings -> Environment Variables: заполни переменные из `.env.example`.
   SESSION_SECRET: любая длинная случайная строка (`openssl rand -hex 32`).
4. Задеплой папку целиком (index.html, api/, lib/): `npx vercel --prod` (из папки site).
5. Открой сайт, нажми Continue with Discord.

## Галочка для c3_nti
Проверяй по Discord ID, а не по имени: имя можно сменить, ID нет. Включи режим разработчика в Discord,
ПКМ по профилю c3_nti -> Copy User ID, впиши в VERIFIED_IDS. /api/me вернёт verified: true, и сайт покажет галочку.

## Что ещё нужно для боевого сайта
- База данных. Сейчас сессия живёт только в cookie. Нужна таблица users (ключ discord_id, roblox_id, elo, wins...).
  Подойдут Neon Postgres или Upstash Redis из Vercel Marketplace.
- Шаг Roblox (код в About) должен проверяться на сервере тем же запросом, что в bot/index.js.
- Права: scope только `identify`. Email и серверы не запрашивай, лишнее не нужно.
