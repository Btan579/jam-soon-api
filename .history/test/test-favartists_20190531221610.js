'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { FavoriteArtist } = require('../favartists');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');
const faker = require('faker');
const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);



function seedUserData() {

    let users = [];
    for (var i = 1; i < 5; i++) {
        let user = new User({
            username: faker.internet.userName(),
            password: faker.internet.password()
        });
        users.push(user);
    }
    return User.insertMany(users); 
}

function seedFavArtists(user) {
    let artists = [];
    for (var i = 1; i < 10; i++) {
        let artist = new FavoriteArtist({
            favArtistName: faker.random.word(),
            video_id: faker.random.number(),
            user_id: user._id,
            artist_id: faker.random.number()
        });
        artists.push(artist);
      
    }
    return FavoriteArtist.insertMany(artists); 
}

function getUser() {
    return User.findOne()
        .then(usr=> {
            return usr;
        });
}

function seedDb() {
    return seedUserData()
        .then(async () => {
            let user = await getUser();
            return seedFavArtists(user);
        });
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
};

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

    describe('/api/favartists', function () {
        // describe('POST', function () {
        //     it('Should reject requests with where an artist is favorited already by user', async function () {
        //         let artistId;
        //         FavoriteArtist
        //             .findOne()
        //             .then(artist => {
        //                 artistId = artist.artist_id;
        //             });

        //         let user = await getUser();
        //         let userAuth = user.username;
        //         const newFavArtist = new FavoriteArtist({
        //             favArtistName: faker.random.word(),
        //             video_id: faker.random.number(),
        //             user_id: user._id,
        //             artist_id: artistId
        //         });
               
        //         const token = jwt.sign(
        //             {
        //                 user: {
        //                     userAuth
        //                 }
        //             },
        //             JWT_SECRET,
        //             {
        //                 algorithm: 'HS256',
        //                 subject: userAuth,
        //                 expiresIn: '7d'
        //             }
        //         );
        //         return chai
        //             .request(app)
        //             .post('/api/favartists')
        //             .set('authorization', `Bearer ${token}`)
        //             .send(newFavArtist)
        //             .then((res) => {
        //                 expect(res).to.have.status(400);
        //             });
        //     });
        //     it('Should post a new favorite artist',  async function () {
        //         let user = await getUser();
        //         let userAuth = user.username;
        //         const newFavArtist = new FavoriteArtist({
        //             favArtistName: faker.random.word(),
        //             video_id: faker.random.number(),
        //             user_id: user._id,
        //             artist_id: faker.random.number()
        //         });
        //         const token = jwt.sign(
        //             {
        //                 user: {
        //                     userAuth
        //                 }
        //             },
        //             JWT_SECRET,
        //             {
        //                 algorithm: 'HS256',
        //                 subject: userAuth,
        //                 expiresIn: '7d'
        //             }
        //         );
                
        //         return chai
        //             .request(app)
        //             .post('/api/favartists')
        //             .set('authorization', `Bearer ${token}`)
        //             .send(newFavArtist)
        //             .then((res) => {
        //                 res.should.have.status(201);
        //                 res.should.be.json;
        //                 res.body.should.be.a('object');
        //                 res.body.should.include.keys('favArtistName', 'video_id', 'user_id', 'artist_id');
        //                 res.body._id.should.not.be.null;
        //                 res.body.favArtistName.should.equal(newFavArtist.favArtistName);
        //                 res.body.video_id.should.equal(newFavArtist.video_id);
        //                 res.body.user_id.should.equal(newFavArtist.user_id.toString());
        //                 res.body.artist_id.should.equal(newFavArtist.artist_id);
        //             });
        //     });
        // });
        // describe('GET', function () {
        //     it('Should return favorite artists for specific user', async function () {
        //         let user = await getUser();
        //         let userAuth = user.username;
        //         let userId;
        //         const token = jwt.sign(
        //             {
        //                 user: {
        //                     userAuth
        //                 }
        //             },
        //             JWT_SECRET,
        //             {
        //                 algorithm: 'HS256',
        //                 subject: userAuth,
        //                 expiresIn: '7d'
        //             }
        //         );
        //         await User.findOne()
        //             .then(usr => {
        //                 userId = usr._id;
        //             });
        //         return chai.request(app)
        //             .get(`/api/favartists/${userId}`)
        //         .set('authorization', `Bearer ${token}`)
        //         .then(res => {
        //             expect(res).to.have.status(200);
        //             expect(res.body).to.be.an('object');
        //             expect(res.body.favoriteArtists).to.be.an('array');
        //             res.body.favoriteArtists.forEach(function (favoriteArtist)  {
        //                 favoriteArtist.should.be.a('object');
        //                 favoriteArtist.should.include.keys('favArtistName', 'video_id', 'user_id', 'artist_id', '_id');
        //                 favoriteArtist.user_id.should.equal(userId.toString());
        //             });
        //         });
        //     });
        // });
        describe('Delete', function () {
            it('Should delete specific favorite artist by id', async function () {
                let user = await getUser();
                let userAuth = user.username;
                let favoriteArtist;
                const token = jwt.sign(
                    {
                        user: {
                            userAuth
                        }
                    },
                    JWT_SECRET,
                    {
                        algorithm: 'HS256',
                        subject: userAuth,
                        expiresIn: '7d'
                    }
                );
                return FavoriteArtist.findOne()
                .then(_favoriteArtist => {
                    favoriteArtist = _favoriteArtist;
                    return chai.request(app)
                    .delete(`/api/favartists/${favoriteArtist._id}`)
                    .set('authorization', `Bearer ${token}`);

                })
                .then(res => {
                    // res.should.have.status(204);
                    console.log(res.body);
                    return FavoriteArtist.findById(favoriteArtist._id);
                })
                .then(_favoriteArtist => {
                    should.not.exist(_favoriteArtist);
                });
            });
        });
    });
});
