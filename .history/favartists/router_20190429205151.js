const express = require("express");
const bodyParser = require("body-parser");

const {
    FavoriteArtist
} = require("./models");
const {
    User
} = require('../users/models');

const router = express.Router();
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

router.use(bodyParser.json());


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

router.get('/:userIdCsv', (req, res) => {
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

router.post('/', (req, res) => {
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