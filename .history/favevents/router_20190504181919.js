const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');
const router = express.Router();
const mongoose = require("mongoose");
const {
    FavoriteEvent
} = require("./models");

mongoose.Promise = global.Promise;
router.use(bodyParser.json());

const jwtAuth = passport.authenticate('jwt', { session: false });

// GET
router.get('/:userId', jwtAuth, (req, res) => {
    let user_id = req.params.userId;
    FavoriteEvent
        .find({
            user_id: user_id
        })
        .then(favoriteEvents => {
            return res.status(200).json({
                favoriteEvents: favoriteEvents
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
    const requiredFields = ['favEventName', 'favDate', 'favHeadliner', 'favSupportingArtists', 'favVenue', 'favState', 'favCity', 'favZip', 'user_id', 'event_id'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    FavoriteEvent
        .create({
            event_id: req.body.event_id,
            user_id: req.body.user_id,
            favEventName: req.body.favEventName,
            favDate: req.body.favDate,
            favHeadliner: req.body.favHeadliner,
            favSupportingArtists: req.body.favSupportingArtists,
            favVenue: req.body.favVenue,
            favState: req.body.favState,
            favCity: req.body.favCity,
            favZip: req.body.favZip
        })
        .then(favoriteEvent => res.status(201).json({
            _id: favoriteEvent._id,
            event_id: favoriteEvent.event_id,
            user_id: favoriteEvent.user_id,
            favEventName: favoriteEvent.favEventName,
            favDate:favoriteEvent.favDate,
            favHeadliner: favoriteEvent.favHeadliner,
            favSupportingArtists: favoriteEvent.favSupportingArtists,
            favVenue: favoriteEvent.favVenue,
            favState: favoriteEvent.favState,
            favCity: favoriteEvent.favCity,
            favZip: favoriteEvent.favZip,
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
    FavoriteEvent
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted event with id \`${req.params.id}\``);
            res.status(204).end();
        });
});

module.exports = { router };