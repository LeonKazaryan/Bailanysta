# React + TypeScript + Vite

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
