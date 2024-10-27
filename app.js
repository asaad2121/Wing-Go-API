const express = require('express');
const userRouter = require('./routes/users');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./middleware/session-authentication-middleware');
const app = express();
const cors = require('cors');
require("dotenv").config();

app.use(bodyParser.json());
app.use(cookieParser()); 
app.use(cors());

app.use('/users', userRouter);

app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

app.listen(1000)