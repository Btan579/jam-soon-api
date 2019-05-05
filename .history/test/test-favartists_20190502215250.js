'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { app, runServer, closeServer } = require('../server');
const { FavoriteArtist } = require('../favartists');
const { TEST_DATABASE_URL } = require('../config');
const faker = require('faker');
const expect = chai.expect;
const should = chai.should();
// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
};

function seedUserData() {
    let user = new User({
        userName: faker.internet.userName(),
        password: faker.internet.password()
    });
    
    return User.insert(user);
}

function seedFavArtists(user) {
    console.log(user);
    let artists = [];
    for (var i = 1; i < 3; i++) {
        let artist = new FavoriteArtist({
            favArtistName: faker.random.word(),
            playlistUrl: faker.internet.url(),
            user_id: faker.random.number(),
            artist_id: faker.random.number()
        });
        artists.push(artist);
      
    }
    return FavoriteArtist.insertMany(artists); 
}

function getUser() {
    return User.find()
        .then(usr => {
            return usr;
        });
}

function seedDb() {
    return seedUserData()
        .then(() => {
            let user = getUser();
            return seedFavArtists(user);
        });
}

describe('/api/favartists', function () {

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedDb();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    // const favArtistName =  'Beyonce';
    // const playlistUrl = 'ytube.com/beyonce';
    // const user_id = '1123d212a';
    // const artist_id = 'b1021';



    // before(function () {
    //     return runServer(TEST_DATABASE_URL);
    // });

    // after(function () {
    //     return closeServer();
    // });

    // beforeEach(function () { 
    //     FavoriteArtist
    //     .create({
    //         favArtistName,
    //         playlistUrl,
    //         user_id,
    //         artist_id
    //     });
    // });

    // afterEach(function () {
    //     return FavoriteArtist.remove({});
    // });

    describe('/api/users', function () {
        describe('POST', function () {
            it('Should post a new favorite artist', function () {
                const newFavArtist = new FavoriteArtist({
                    favArtistName: faker.random.word(),
                    playlistUrl: faker.internet.url(),
                    user_id: faker.random.number(),
                    artist_id: faker.random.number()
                });

                return chai
                    .request(app)
                    .post('/api/favartists/')
                    .send(newFavArtist)
                    .then((res) => {
                        res.should.have.status(201);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.should.include.keys('favArtistName', 'playlistUrl', 'user_id', 'artist_id');
                        res.body._id.should.not.be.null;
                        res.body.favArtistName.should.equal(newFavArtist.favArtistName);
                        res.body.playlistUrl.should.equal(newFavArtist.playlistUrl);
                        res.body.user_id.should.equal(newFavArtist.user_id);
                        res.body.artist_id.should.equal(newFavArtist.artist_id);
                    });
            });
        });
        // describe('GET', function () {
        //     it('Should return favorite artists for specific user', function () {
        //         return chai.request(app).get('/api/users').then(res => {
        //             expect(res).to.have.status(200);
        //             expect(res.body).to.be.an('array');
        //             expect(res.body).to.have.length(0);
        //         });
        //     });
        //     it('Should return an array of users', function () {
        //         return User.create(
        //             {
        //                 username,
        //                 password
        //             },
        //             {
        //                 username: usernameB,
        //                 password: passwordB
        //             }
        //         )
        //             .then(() => chai.request(app).get('/api/users'))
        //             .then(res => {
        //                 expect(res).to.have.status(200);
        //                 expect(res.body).to.be.an('array');
        //                 expect(res.body).to.have.length(2);
        //                 expect(res.body[0].username).to.deep.equal(
        //                     username
        //                 );
        //                 expect(res.body[1].username).to.deep.equal(
        //                     usernameB
        //                 );
        //             });
        //     });
        // });
    });
});
