# QuizMaker API Backend

## Обзор

Это серверная часть приложения QuizMaker, построенного на стеке MERN (MongoDB, Express.js, React, Node.js). API предоставляет полный набор функций для создания, управления и прохождения тестов с различными типами вопросов.

## Демо

Фронтенд развернут по адресу: https://quiz-maker-rose.vercel.app/
Бэкенд API: http://quiz-maker-backend-production.up.railway.app/

## Функциональность API

### Тесты
- Создание новых тестов с названием, описанием и тегами
- Получение списка всех тестов с поддержкой пагинации, поиска и фильтрации по тегам
- Получение подробной информации о тесте по ID
- Обновление существующих тестов
- Удаление тестов
- Проверка ответов и вычисление результатов теста

### Вопросы
- Добавление вопросов к тесту (с поддержкой трех типов: одиночный выбор, множественный выбор, текстовый ответ)
- Обновление существующих вопросов
- Удаление вопросов
- Настройка баллов для каждого вопроса

## Технологии

- **Node.js** - среда выполнения JavaScript
- **Express.js** - веб-фреймворк для создания API
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM (Object Data Modeling) для MongoDB
- **JWT** (опционально) - для аутентификации пользователей

## Структура проекта

```
quiz-maker-backend/
├── config/           
├── controllers/       
│   ├── test.controller.js
│   └── question.controller.js
├── models/             
│   ├── Test.js
│   └── Question.js
├── routes/             #
│   ├── test.routes.js
│   └── question.routes.js
├── middlewares/        
├── utils/              
├── .env               
├── .gitignore          
├── package.json       
├── server.js          
└── README.md          
```

## API Endpoints

### Тесты

- `GET /api/tests` - Получить все тесты (с поддержкой пагинации, поиска и фильтрации)
- `GET /api/tests/:id` - Получить тест по ID
- `POST /api/tests` - Создать новый тест
- `PUT /api/tests/:id` - Обновить существующий тест
- `DELETE /api/tests/:id` - Удалить тест
- `POST /api/tests/:id/check` - Проверить ответы и получить результаты теста

### Вопросы

- `POST /api/tests/:id/questions` - Добавить вопрос к тесту
- `PUT /api/questions/:id` - Обновить существующий вопрос
- `DELETE /api/questions/:id` - Удалить вопрос



