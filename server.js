const express = require('express');
const app = express();
const dotenv = require('dotenv');
const body_parser = require('body-parser');
const cors = require('cors');
const db_connect = require('./utils/db');

dotenv.config();

app.use(body_parser.json());
if (process.env.mode === 'production') {
  app.use(cors());
} else {
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
    })
  );
}

const port = process.env.port;

app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/newsRoutes'));
app.get('/', (req, res) => res.send('Hello Worlds!'));

db_connect();
app.listen(port, () => console.log(`server is running on port ${port}!`));
