const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');
const router = express.Router();
const mongoose = require("mongoose");
const {
    FavoriteEvent
} = require("./models");
const { User } = require("../users/models");

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
    const requiredFields = ['favEventName', 'favDate', 'favHeadliner', 'favSupportingArtists', 'favVenue', 'favVenueLocation', 'user_id', 'event_id'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    FavoriteEvent    
        .find({
            user_id: req.body.user_id,
            event_id: req.body.event_id
        })
        .then(favorite => {
            console.log(favorite);
        console.log(favorite[0]);
           console.log(req.body.event_id);
            if (favorite[0] !== undefined){
                const message1 = `Event already favorited`;
                console.error(message1);
                return res.status(400).send(message1);
            } else {
                FavoriteEvent
                    .create({
                        event_id: req.body.event_id,
                        user_id: req.body.user_id,
                        favEventName: req.body.favEventName,
                        favDate: req.body.favDate,
                        favHeadliner: req.body.favHeadliner,
                        favSupportingArtists: req.body.favSupportingArtists,
                        favVenue: req.body.favVenue,
                        favVenueLocation: req.body.favVenueLocation
                    })
                    .then(favoriteEvent => res.status(201).json({
                        _id: favoriteEvent._id,
                        event_id: favoriteEvent.event_id,
                        user_id: favoriteEvent.user_id,
                        favEventName: favoriteEvent.favEventName,
                        favDate: favoriteEvent.favDate,
                        favHeadliner: favoriteEvent.favHeadliner,
                        favSupportingArtists: favoriteEvent.favSupportingArtists,
                        favVenue: favoriteEvent.favVenue,
                        favVenueLocation: favoriteEvent.favVenueLocation
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            error: 'Something went wrong'
                        });
                    });
            }
                // if (favorite[0].event_id === req.body.event_id){
                //     const message1 = `Event already favorited`;
                //     console.error(message1);
                //     return res.status(400).send(message1);
                // } else {
                //     FavoriteEvent
                //         .create({
                //             event_id: req.body.event_id,
                //             user_id: req.body.user_id,
                //             favEventName: req.body.favEventName,
                //             favDate: req.body.favDate,
                //             favHeadliner: req.body.favHeadliner,
                //             favSupportingArtists: req.body.favSupportingArtists,
                //             favVenue: req.body.favVenue,
                //             favVenueLocation: req.body.favVenueLocation
                //         })
                //         .then(favoriteEvent => res.status(201).json({
                //             _id: favoriteEvent._id,
                //             event_id: favoriteEvent.event_id,
                //             user_id: favoriteEvent.user_id,
                //             favEventName: favoriteEvent.favEventName,
                //             favDate: favoriteEvent.favDate,
                //             favHeadliner: favoriteEvent.favHeadliner,
                //             favSupportingArtists: favoriteEvent.favSupportingArtists,
                //             favVenue: favoriteEvent.favVenue,
                //             favVenueLocation: favoriteEvent.favVenueLocation
                //         }))
                //         .catch(err => {
                //             console.error(err);
                //             res.status(500).json({
                //                 error: 'Something went wrong'
                //             });
                //         });
                // }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went really wrong'
            });
        });

    // FavoriteEvent
    //     .create({
    //         event_id: req.body.event_id,
    //         user_id: req.body.user_id,
    //         favEventName: req.body.favEventName,
    //         favDate: req.body.favDate,
    //         favHeadliner: req.body.favHeadliner,
    //         favSupportingArtists: req.body.favSupportingArtists,
    //         favVenue: req.body.favVenue,
    //         favVenueLocation: req.body.favVenueLocation
    //     })
    //     .then(favoriteEvent => res.status(201).json({
    //         _id: favoriteEvent._id,
    //         event_id: favoriteEvent.event_id,
    //         user_id: favoriteEvent.user_id,
    //         favEventName: favoriteEvent.favEventName,
    //         favDate: favoriteEvent.favDate,
    //         favHeadliner: favoriteEvent.favHeadliner,
    //         favSupportingArtists: favoriteEvent.favSupportingArtists,
    //         favVenue: favoriteEvent.favVenue,
    //         favVenueLocation: favoriteEvent.favVenueLocation
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
    FavoriteEvent
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted event with id \`${req.params.id}\``);
            res.status(204).end();
        });
});

module.exports = { router };