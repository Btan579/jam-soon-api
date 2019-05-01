'use scrict';
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const FavoriteEventSchema = mongoose.Schema({
    favEventName: {
        type: String,
        required: true,
    },
    favDate: {
        type: String,
        required: true,
    },
    favHeadliner: {
        type: String,
        required: true,
    },
    favSupportingArtists: [String],
    favVenue: {
        type: String,
        required: true,
    },
    favCity: {
        type: String,
        required: true,
    },
    favState: {
        type: String,
        required: true,
    },
    favZip: {
        type: String,
        required: true,
    },
    favCountry: {
        type: String,
        required: true,
    },
    event_id: {
        type: String,
        required: true
    },
    user_id: {
        user_id: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

FavoriteEventSchema.methods.serialize = function () {
    return {
        id: this._id,
        event_id: this.event_id,
        user_id: this.user_id,
        favEventName: this.favEventName,
        favDate: this.favDate,
        favHeadliner: this.favHeadliner,
        favSupportingArtists: this.favSupportingArtists,
        favVenue: this.favVenue,
        favState: this.favState,
        favZip: this.favZip,
        favCountry: this.favCountry
    };
};

const FavoriteEvent = mongoose.model('favoriteEvent', FavoriteEventSchema);

module.exports = { FavoriteEvent };