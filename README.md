WB Tariffs Service

------------------------------------------------


Сервис для ежечасного получения тарифов Wildberries и обновления данных в Google Sheets.
Реализован на Node.js, TypeScript, PostgreSQL, Docker.

--------------------------------------------------
Структура проекта:


wb-tariffs-service/

├─ src/

│  ├─ jobs/

│  │  └─ tariffJob.ts

│  └─ index.ts

├─ .env.example

├─ docker-compose.yml

├─ package.json

├─ tsconfig.json

└─ README.md

--------------------------------------------------

Запуск:
git clone <YOUR_REPO_URL>
cd wb-tariffs-service

Создаём файл .env:
PORT=3000
WB_API_TOKEN=<ваш токен Wildberries>
GOOGLE_SERVICE_ACCOUNT_KEY=<ключ JSON для Google Sheets>
GOOGLE_SHEET_IDS=<ID_таблицы_1,ID_таблицы_2,...>
DB_HOST=wb_postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres

Билдим containers:
docker compose up --build
-----------------------------------------
Сервер доступен на http://localhost:3000
Cron для тарифов запланирован каждый час

Для теста можно вручную вызвать функцию из tariffJob.ts
Проверить таблицу PostgreSQL:
docker exec -it wb_postgres psql -U postgres
SELECT * FROM tariffs;

Проверяем Google Sheets — лист stocks_coefs должен обновляться каждый час.

-----------------------------------------------

Технологии:

Node.js + TypeScript;
PostgreSQL + Knex.js;
Docker + Docker Compose;
Wildberries API;
Google Sheets API;
------------------------------------------------

Сборка и запуск: docker compose up --build
Перезапуск контейнера: docker compose restart
Проверка логов: docker compose logs -f wb_app
