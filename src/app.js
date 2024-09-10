import express from 'express';
import cookieParser from 'cookie-parser';
import LogMiddleware from './middlewares/log.middlewares.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middlewares.js';
import UsersRouter from './routes/users.router.js';
import PostsRouter from './routes/posts.router.js';
import CommestsRouter from './routes/comments.router.js';

const app = express();
const PORT = 3019;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter, PostsRouter, CommestsRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});