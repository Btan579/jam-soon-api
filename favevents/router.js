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
router.get('/:userIdCsv', jwtAuth, (req, res) => {
    let userId = req.params.user_id;
    FavoriteEvent
        .find({
            user_id: userId
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
    const requiredFields = ['favEventName', 'favDate', 'favHeadliner', 'favSupportingArtists', 'favVenue', 'favState', 'favZip', 'favCountry', 'user_id', 'event_id'];
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
            favZip: req.body.favZip,
            favCountry: req.body.favCountry
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
            favZip: favoriteEvent.favZip,
            favCountry: favoriteEvent.favCountry
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