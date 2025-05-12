const express = require('express'); //node js библиотека для создания АПИ
const jwt = require('jsonwebtoken'); //JWT для аутентификации токенов, создаются при создании пользователей, содержат инфу о юзерах
const cors = require('cors'); //нужно чтобы фронтэнд мог отправлять запросы на бэк на другом порту, без него браузер блокирует
//db
const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const app = express(); //основа сервера, экспресс обрабатывает хттп вопросы 

// Настройка CORS для конкретного источника (middleware - функции перед обработкой запросов)
app.use(cors({
  origin: ['http://localhost:5173', 'https://bailanysta-mu.vercel.app'], // Разрешает отправлять запросы только отсюда
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'], //разрешенные методы 
  allowedHeaders: ['Content-Type', 'Authorization'], //разрешанные заголовки для запросов
}));
app.use(express.json()); //парсинг запрос в json, преобразует данные в обьект JS

//подключение к MongoDB
connectDB();

// Проверка модели User
console.log('User model:', User); // Лог для отладки

const JWT_SECRET = process.env.JWT_SECRET; 

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Server is running!');
  //req - информация о запросы, заголовки, парметры, тело
  //res - ответ для клиента
});

// Регистрация
app.post('/register', async (req, res) => {
  console.log('Received register request:', req.body); // Лог для отладки
  const { username, password } = req.body; //извлекает юзера и пароля из req.body
  if (!username || !password) {
    console.log("Cannot register with empty credentials");
    return res.status(402).json({ message: 'Cannot register with empty credentials' });
  }

  try {
    const existingUser = await User.findOne({ username }); // Проверка в базе данных
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, password });
    await user.save();
    console.log("User registered");
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Вход
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
app.post('/posts', authenticateToken, async (req, res) => { 
  //authenticateToken - мидлвейр, проверяет токен
  //проверяю что пост не пустой
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Post cannot be empty' });
  }
  const post = new Post({
    username: req.user.username,
    likes: 0,
    likedBy: [],
    content,
    createdAt: new Date(),
  });
  await post.save();
  res.status(201).json(post);
});

//Лайкинг
app.post('/posts/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const username = req.user.username;

  console.log(`User ${username} toggling like for post ${postId}`);

  // Проверка, что postId передан и валиден
  if (!postId || postId === 'undefined') {
    console.log(`Invalid or missing postId: ${postId}`);
    return res.status(400).json({ message: 'Invalid or missing post ID' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post ${postId} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

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

    await post.save();

    res.status(200).json({ message: 'Like toggled', likes: post.likes, likedBy: post.likedBy });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/posts/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const username = req.user.username;

  console.log(`Deleting post ${postId} by user ${username}`); 

  // Находим индекс поста
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Проверяем, что пост принадлежит пользователю
  if (post.username !== username) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await Post.deleteOne({ _id: postId });
  res.status(200).json({ message: 'Post deleted' });
});

// Получение всех постов (лента/feed)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получение постов пользователя в профиле
app.get('/posts/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const userPosts = await Post.find({ username }).sort({ createdAt: -1 });
    res.json(userPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получение текущего пользователя
app.get('/me', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

app.listen(3000, () => console.log('Server running on port 3000'));