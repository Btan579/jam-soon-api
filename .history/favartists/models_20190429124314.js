'use scrict';
mongoose.Promise = global.Promise;

const FavoriteArtistSchema = mongoose.Schema({
    artistName: {
        type: String,
        required: true
    },
    playlistUrl: {
        type: String,
        required: true
    }
});

const FavoriteArtist = mongoose.model('FavoriteArtist', FavoriteArtistSchema);

module.exports = { FavoriteArtist };