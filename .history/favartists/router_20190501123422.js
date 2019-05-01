const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');
const router = express.Router();
const mongoose = require("mongoose");
const {
    FavoriteArtist
} = require("./models");

mongoose.Promise = global.Promise;
router.use(bodyParser.json());

const jwtAuth = passport.authenticate('jwt', { session: false });

// GET
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
    const requiredFields = ['favArtistName', 'playlistUrl', 'user_id', 'artist_id'];
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
            artist_id: req.body.artist_id
        })
        .then(favoriteArtist => res.status(201).json({
            _id: favoriteArtist._id,
            favArtistName: favoriteArtist.favArtistName,
            playlistUrl: favoriteArtist.playlistUrl,
            user_id: favoriteArtist.user_id,
            artist_id: favoriteArtist.artist_id
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