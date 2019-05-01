const express = require("express");
const bodyParser = require("body-parser");

const {
    FavoriteArtist
} = require("./models");

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const router = express.Router();
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const morgan = require('morgan');
const passport = require('passport');
router.use(bodyParser.json());

passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

// GET

router.get('/', (req, res) => {
    FavoriteArtist
        .find()
        .then(favoriteArtists => {
            return res.status(200).json({
                favoriteArtists: favoriteArtists
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went terribly wrong'
            });
        });
});

router.get('/:userIdCsv', jwtAuth,(req, res) => {
    let userId = req.params.user_id;
    FavoriteArtist
        .find({
            user_id: userId })
        .then(favoriteArtists => {
            return res.status(200).json({
                favoriteArtists: favoriteArtists
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went terribly wrong'
            });
        });
});

// POST

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['favArtistName', 'playlistUrl', 'user_id'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    FavoriteArtist
        .create({
            favArtistName: req.body.favArtistName,
            playlistUrl: req.body.playlistUrl,
            user_id: req.body.user_id,
        })
        .then(favoriteArtist => res.status(201).json({
            _id: favoriteArtist._id,
            favArtistName: favoriteArtist.favArtistName,
            playlistUrl: favoriteArtist.playlistUrl,
            user_id: favoriteArtist.user_id,
        }))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong'
            });
        });
});

// DELETE 

router.delete('/:id', jwtAuth, (req, res) => {
    FavoriteArtist
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted artist with id \`${req.params.id}\``);
            res.status(204).end();
        });
});

module.exports = { router };