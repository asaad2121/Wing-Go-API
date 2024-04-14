const express = require('express');

const app = express();

app.use('/app',(req, res, next) => {
    console.log('app');
    res.send('app');
})

app.use('/',(req, res, next) => {
    console.log('hello');
    res.send('hello');
})

app.listen(1000)