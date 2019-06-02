'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: favArtistsRouter } = require('./favartists');
const { router: favEventsRouter } = require('./favevents');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config');

const app = express();

// Logging
app.use(morgan('common'));

// CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/favartists/', favArtistsRouter);
app.use('/api/favevents/', favEventsRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
// app.get('/api/protected', jwtAuth, (req, res) => {
//     return res.json({
//         data: 'rosebud'
//     });
// });

app.get("/api/", (req, res) => {
    res.json({ ok: false });
});

app.use('*', (req, res) => {
    return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };