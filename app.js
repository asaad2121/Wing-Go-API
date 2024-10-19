const express = require('express');
const userRouter = require('./routes/users');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
require("dotenv").config();

app.use(bodyParser.json());
app.use(cors());

app.use('/app',(req, res, next) => {
    res.send('app');
})

app.use('/users', userRouter);

app.use('/',(req, res, next) => {
    res.send('hello');
})

app.listen(1000)