'use scrict';
mongoose.Promise = global.Promise;

const MetroSearchTermsSchema = mongoose.Schema({
    countryCode: {
        type: String,
        required: true
    },
    stateName: {
        type: String,
        required: true
    },
    cityName: {
        type: String,
        required: true
    }
});

const MetroSearchTerm = mongoose.model('MetroSearchTerm', MetroSearchTermsSchema);

module.exports = { MetroSearchTerm };