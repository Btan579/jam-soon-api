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

router.get('/', (req, res) => {
    
    FavoriteArtist
        .find()
        .then(favoriteArtists => {
          res.json(favoriteArtists);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went terribly wrong'
            });
        });
});
router.get('/:userId', jwtAuth,(req, res) => {
    let user_id = req.params.userId;
    console.log(user_id);
    FavoriteArtist
        .find({
            user_id: user_id })
        .then(favoriteArtists => {
            console.log(favoriteArtists);
            // return res.status(200).json({
               
            //     favoriteArtists: favoriteArtists
            // });
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
        .find({
            user_id: req.body.user_id,
            artist_id: req.body.artist_id
        })
        .then(favorite => {
            if (favorite[0] !== undefined) {
                const message1 = `Artist already favorited`;
                console.error(message1);
                return res.status(400).send(message1);
            } else {
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
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went really wrong'
            });
        });








    // FavoriteArtist
    //     .create({
    //         favArtistName: req.body.favArtistName,
    //         playlistUrl: req.body.playlistUrl,
    //         user_id: req.body.user_id,
    //         artist_id: req.body.artist_id
    //     })
    //     .then(favoriteArtist => res.status(201).json({
    //         _id: favoriteArtist._id,
    //         favArtistName: favoriteArtist.favArtistName,
    //         playlistUrl: favoriteArtist.playlistUrl,
    //         user_id: favoriteArtist.user_id,
    //         artist_id: favoriteArtist.artist_id
    //     }))
    //     .catch(err => {
    //         console.error(err);
    //         res.status(500).json({
    //             error: 'Something went wrong'
    //         });
    //     });
});

// DELETE 

router.delete('/:id', jwtAuth, (req, res) => {
    FavoriteArtist
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted artist with id \`${req.params.id}\``);
            console.log(req.params.id);
            res.send(req.params.id);
            res.status(204).end();
        });
});

module.exports = { router };