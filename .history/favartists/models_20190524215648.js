'use scrict';
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const favoriteArtistSchema = mongoose.Schema({
    favArtistName: {
        type: String,
        required: true,
    },
    video_id: {
        type: String,
        required: true
    },
    user_id: {
        user_id: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    artist_id: {
        type: String,
        required: true
    }
});

favoriteArtistSchema.methods.serialize = function () {
    return {
        id: this._id,
        favArtistName: this.artistName,
        video_id: this.video_id,
        user_id: this.user_id,
        artist_id: this.artist_id
    };
};

const FavoriteArtist = mongoose.model('favoriteArtist', favoriteArtistSchema);

module.exports = { FavoriteArtist };