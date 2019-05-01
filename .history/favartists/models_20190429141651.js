'use scrict';
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const {
    User
} = require('../users/models');


const FavoriteArtistSchema = mongoose.Schema({
    artistName: {
        type: String,
        required: true,
    },
    playlistUrl: {
        type: String,
        required: true
    },
    user_id: {
        user_id: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

FavoriteArtistSchema.methods.serialize = function () {
    return {
        id: this._id,
        artistName: this.artistName,
        playlistUrl: this.playlistUrl,
        user_id: this.user_id
    };
};

const FavoriteArtist = mongoose.model('FavoriteArtist', FavoriteArtistSchema);

module.exports = { FavoriteArtist };