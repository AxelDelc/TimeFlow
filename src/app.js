const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares globaux
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(
    session({
        secret: 'dev-secret-change-later',
        resave: false,
        saveUninitialized: false
    })
);

// routes
app.get('/', (req, res) => {
    res.send('Test TimeFlow OK');
});

module.exports = app;
