# Bailanysta

Проект поделен на
-front-end(client) - React, TypeScript, Vercel
-back-end(server) - Node.js, Express, MongoDB, Atlas, Render

# Краткое описание

Bailanysta - простая социальная сеть, где главные функции следующие:

1. Регистрация пользователя с проверкой:

- наличие символов в полях регистрации
- зарегестрирован ли пользователь уже
- схождения пароля и повторного пароля

2. Вход (login) в аккаунт с проверкой:

- существуют ли пользователь под данным username
- проверка пароля к username

3. Лента (feed)

- отображение постов всех пользователей
- сортировка постов по дате их создания

4. Профиль (profile || /me)

- отображение постов только залогиненнего пользователя
- сортировка постов по дате их создания
- удаление постов

5. Написание постов

- можно написать пост, который будет хранится за владельцем
- возможность писать посты при помощи input textarea в страницах профиля и ленты

6. Лайк (toogle like)

- можно ставить лайк постам (своим и чужим), это добавляет пользователя в массив likedBy который явялется частью объекта поста
- каждый лайк увеличвает количество счетчика likes, при наведении будет появляться список всех пользователей, которые лайкнули пост

7. Токены авторизации

- если пользователь не авторизован, то функционал сайта обрезан, нельзя ставить лайки и писать посты, но просматривать можно

# Инструкция по запуску

Требования:

1. Node.js
2. npm
3. Аккаунт MongoDB Atlas
4. Аккаунты Vercel и Render для деплоя
5. Git

Установка:

1. Скопируйте репозиторий:
   git clone https://github.com/LeonKazaryan/Bailanysta.git
   cd Bailanysta/server

2. Установите зависимости:
   npm install

3. Создайте .env файл в папке server

- MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/socialApp?retryWrites=true&w=majority&appName=Cluster0
- JWT_SECRET=your_jwt_secret
- примечание, URI может отличаться, скопируйте его с MongoDB; JWT - замените на свой JWT пароль

4. Запустите сервер
   npm start

5. Перейдите в отдельную папку внутри прокета для фронтэнда
   cd Bailanysta/frontend (в моем случае - client)

6. Установите зависимости
   npm install

7. Создайте файл src/config.ts

- export const API_URL = 'http://localhost:3000';
- используйте localhost для разработки либо API предоставленный Vercel

8. Запустите ФронтЭнд
   npm run dev

# Процесс проектирования и разработки

Изначально были определенны минимальный функционал, такие как:

- регистрация
- логин
- посты
- профиль
  Затем, были имплементированны дополнительные функции, такие как лайки и логика удаления постов. На этой стадии я добавил минималистичные, но в тоже время красивые CSS стили для каждого из компонентов. Сайт выполнен в нейтральных постелных тонах, лиловый, синий, фиолетовый. Также были имплементированные простые анимации, которые улучшают общий вид сайт. Также я добавил адаптацию для мобильных устройств через @media в каждом CSS компоненте.

# Уникальные подходы

- Фокус на минимализме и простоте UI и API чтобы обеспечить быструю разработку и легкость в использовании и поддержки сайта
- использование TypeScript для фронтенда - строгая типизация позволила предотвратить такие ошибки как неправильные типы данных, что важно при работе с бэкэндом
- Локализация ошибок. В проекте использовались логи на бэкенде для более легкой разработки и поиска ошибок на сайте

# Компромиссы

- Пароли хранятся в открытом виде на MongoDB
- Отсутсвие функционала комментариев и редактирования постов, вместо этого было реализованны функции лайков и удаления, что заняло меньше времени
- MongoDB Atlas IP предоставляет доступ с любого IP адресса (0.0.0.0/0) для просто деплоя на Render, что менее безопасно
- Бесплатный план на Render (512MB RAM) - возможны задержки при открытие сервера

# Известные ошибки

- Иногда MongoDB может временно переставать работать, тем самым не отображая посты и аккаунты на сайте
- Небольшие задержки при подгрузки бэка из-за бесплатного плана Render

# Почему выбран этот технический стек

1. React + TypeScript

- Имеется опыт разработки на React'е, что облегчило процесс разработки и вспоминания материала
- Быстрая разработка компонентного UI
- TypeScript снижает вероятность ошибок при строгой типизации
- Популярность и поддержка экосистем + большое количество гайдов при популярных ошибках

2. Node.js + Express

- Node позволяет использовать JS на бэкенде, упрощая работу так как у меня больший опыт именно на фронтэнде
- Express легкий и гибкий фреймворк для API

3. MongoDB Atlas

- Облачная база данных понятная и легкая в использовании
- Бесплатный план, подходящий для моего проекта

4. Vercel & Render

- Легки и бесплатны в использовании
- Идеальны для небольших проектов, вроде моего

# commitments:

commit 1.02:
-исправленна ошибка server error(402) - возникшая при отправлении двух паролей на бек что было лишним
-убрал хардкодинг с адрессом сервера, вынес API в отдельный файл client->src->config.ts, имплементировал АПИ как переменную в компоненты - API_URL

commit 1.03:
-убран import react в файле main.tsx, который мешал нормально запоску npm run build

commit 1.10:
-имплементировал MongoDB, добавлены соотвесвующие файлы, убран хардкодинг с храненим данных напрямую в массиве в коде
-исправлена ошибка с неправильным порядком вывода постов
-сайт теперь работает на vercel 'https://bailanysta-mu.vercel.app/'

commit 1.11:
-Бэкэнд (server) выгружен на Render
-API_URL теперь 'https://bailanysta-s2if.onrender.com' вместо localhost

commit 1.12:
-добавил переход после логина на страницу profile
