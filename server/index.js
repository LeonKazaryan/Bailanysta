const express = require('express'); //node js библиотека для создания АПИ
const jwt = require('jsonwebtoken');//JWT для аутентификации токенов, создаются при создании пользователей, содержат инфу о юзерах
const cors = require('cors');       //нужно чтобы фронтэнд мог отправлять запросы на бэк на другом порту, без него браузер блокирует

const app = express(); //основа сервера, экспресс обрабатывает хттп вопросы 

// Настройка CORS для конкретного источника (middleware - функции перед обработкой запросов)
app.use(cors({
  origin: ['http://localhost:5173', 'https://bailanysta-nu.vercel.app'], // Разрешает отправлять запросы только отсюда
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'], //разрешенные методы 
  allowedHeaders: ['Content-Type', 'Authorization'], //разрешанные заголовки для запросов
}));
app.use(express.json()); //парсинг запрос в json, преобразует данные в обьект JS

// Хранилище в памяти (замените на базу данных в реальном проекте)
const users = [];
const posts = [];
const JWT_SECRET = 'your_jwt_secret'; // В реальном проекте храните в .env

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Server is running!');
  //req - информация о запросы, заголовки, парметры, тело
  //res - ответ для клиента
});

// Регистрация
app.post('/register', (req, res) => {
  const { username, password} = req.body; //извлекает юзера и пароля из req.body
  if(!username || !password){
    console.log("Cannot register with empty credentials");
    return res.status(402).json({message: 'Cannot register with empty credentials'})
  }

  if (users.find(u => u.username === username)) { 
    console.log("User already exists");
    return res.status(400).json({ message: 'User already exists' }); 
  }
  users.push({ username, password });
  console.log("User registered")
  res.status(201).json({ message: 'User registered' });
});

// Вход
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password); //проверка данных
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }); //создание токена для юзера
  res.json({ token });
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Создание поста
app.post('/posts', authenticateToken, (req, res) => { 
  //authenticateToken - мидлвейр, проверяет токен
  //проверяю что пост не пустой
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({message: 'Post cannot be empty'});
  }
  const post = {
    id: posts.length + 1,
    username: req.user.username,
    likes: 0,
    likedBy: [],
    content,
    createdAt: new Date(),
  };
  posts.push(post);
  res.status(201).json(post);
});

//Лайкинг
app.post('/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id); //str->int
  const username = req.user.username;

  console.log(`User ${username} toggling like for post ${postId}`);

  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) {
    console.log(`Post ${postId} not found`);
    return res.status(404).json({ message: 'Post not found' });
  }

  const post = posts[postIndex];
  const likedByIndex = post.likedBy.indexOf(username);

  if (likedByIndex === -1) {
    // Пользователь не лайкал пост -> добавляем лайк
    post.likedBy.push(username);
    post.likes += 1;
  } else {
    // Пользователь уже лайкал -> снимаем лайк
    post.likedBy.splice(likedByIndex, 1);
    post.likes -= 1;
  }

  posts[postIndex] = post;
  res.status(200).json({ message: 'Like toggled', likes: post.likes, likedBy: post.likedBy });
});

app.delete('/posts/:id', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id); // изначально приходит как строка, поэтому в инт
  const username = req.user.username;

  console.log(`Deleting post ${postId} by user ${username}`); 

  // Находим индекс поста
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Проверяем, что пост принадлежит пользователю
  if (posts[postIndex].username !== username) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // удалить
  posts.splice(postIndex, 1);
  res.status(200).json({ message: 'Post deleted' });
});

// Получение всех постов (лента/feed)
app.get('/posts', (req, res) => {
  res.json(posts);
});

// Получение постов пользователя в профиле
app.get('/posts/:username', (req, res) => {
  const { username } = req.params;
  const userPosts = posts.filter(post => post.username === username);
  res.json(userPosts);
});

// Получение текущего пользователя
app.get('/me', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

app.listen(3000, () => console.log('Server running on port 3000'));