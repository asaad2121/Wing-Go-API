const express = require('express');
const userRouter = require('./routes/users');
const userProfileRouter = require('./routes/user-details');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./middleware/session-authentication-middleware');
const app = express();
const cors = require('cors');
require("dotenv").config();

app.use(bodyParser.json());
app.use(cookieParser()); 
app.use(cors({
    origin: process.env.REACT_APP,
    credentials: true 
}));

app.use('/users', userRouter);
app.use('/user-details', authenticateToken, userProfileRouter);

app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

app.listen(2139)