const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
require('dotenv').config();

const app = express();
const port = 3000;


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',
});


const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});


const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
}));

app.use(keycloak.middleware());


app.use(bodyParser.json());
app.use(cors());


app.post('/messages', keycloak.protect(), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.kauth.grant.access_token.content.sub;

    const message = await Message.create({
      content,
      userId,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/messages', keycloak.protect(), async (req, res) => {
  try {
    const messages = await Message.findAll({ include: User });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
