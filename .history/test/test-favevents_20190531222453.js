'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { FavoriteEvent } = require('../favevents');
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

function seedFavEvents(user) {
    let events = [];
    for (var i = 1; i < 10; i++) {
        let event = new FavoriteEvent({
            favEventName: faker.random.word(),
            favDate: faker.date.future(),
            favArtists: [faker.random.word(), faker.random.word(), faker.random.word()],
            favVenue: faker.commerce.productName(),
            favVenueLocation: `${faker.address.state()}, ${faker.address.city}`,
            user_id: user._id,
            event_id: faker.random.number()
        });
        events.push(event);

    }
    return FavoriteEvent.insertMany(events);
}

function getUser() {
    return User.findOne()
        .then(usr => {
            return usr;
        });
}

function seedDb() {
    return seedUserData()
        .then(async () => {
            let user = await getUser();
            return seedFavEvents(user);
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


    describe('/api/favevents', function () {
        describe('POST', function () {
            it('Should post a new favorite event', async function () {
                let user = await getUser();
                let userAuth = user.username;
                const newFavEvent = new FavoriteEvent({
                    favEventName: faker.random.word(),
                    favDate: faker.date.future(),
                    favArtists: [faker.random.word(), faker.random.word(), faker.random.word()],
                    favVenue: faker.commerce.productName(),
                    favVenueLocation: `${faker.address.state()}, ${faker.address.city}`,
                    user_id: user._id,
                    event_id: faker.random.number()
                });
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

                return chai
                    .request(app)
                    .post('/api/favevents')
                    .set('authorization', `Bearer ${token}`)
                    .send(newFavEvent)
                    .then((res) => {
                        res.should.have.status(201);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.should.include.keys('favEventName', 'favDate', 'favArtists', 'favVenue', 'favVenueLocation', 'user_id', 'event_id');
                        res.body._id.should.not.be.null;
                        res.body.favEventName.should.equal(newFavEvent.favEventName);
                        res.body.favDate.should.equal(newFavEvent.favDate);
                        res.body.favSupportingArtists.should.deep.equal(newFavEvent.favArtists);
                        res.body.favVenue.should.equal(newFavEvent.favVenue);
                        res.body.favVenueLocation.should.equal(newFavEvent.favVenueLocation);
                        res.body.user_id.should.equal(newFavEvent.user_id.toString());
                        res.body.event_id.should.equal(newFavEvent.event_id);
                    });
            });

            it('Should reject requests with where an event is favorited already by user', async function () {
                let eventId;
                FavoriteEvent
                    .findOne()
                    .then(event => {
                        eventId = event.event_id;
                    });

                let user = await getUser();
                let userAuth = user.username;
                const newFavEvent = new FavoriteEvent({
                    favEventName: faker.random.word(),
                    favDate: faker.date.future(),
                    favArtists: [faker.random.word(), faker.random.word(), faker.random.word()],
                    favVenue: faker.commerce.productName(),
                    favVenueLocation: `${faker.address.state()}, ${faker.address.city}`,
                    user_id: user._id,
                    event_id: eventId
                });

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
                return chai
                    .request(app)
                    .post('/api/favevents')
                    .set('authorization', `Bearer ${token}`)
                    .send(newFavEvent)
                    .then((res) => {
                        expect(res).to.have.status(400);
                    });
            });
        });
        describe('GET', function () {
            it('Should return favorite events for specific user', async function () {
                let user = await getUser();
                let userAuth = user.username;
                let userId;
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
                await User.findOne()
                    .then(usr => {
                        userId = usr._id;
                    });
                return chai.request(app)
                    .get(`/api/favevents/${userId}`)
                    .set('authorization', `Bearer ${token}`)
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body.favoriteEvents).to.be.an('array');
                        res.body.favoriteEvents.forEach(function (favoriteEvent) {
                            favoriteEvent.should.be.a('object');
                            favoriteEvent.should.include.keys('favEventName', 'favDate', 'favArtists', 'favVenue', 'favVenueLocation', 'user_id', 'event_id');
                            favoriteEvent.user_id.should.equal(userId.toString());
                        });
                    });
            });
        });
        describe('Delete', function () {
            it('Should delete specific favorite event by id', async function () {
                let user = await getUser();
                let userAuth = user.username;
                let favoriteEvent;
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
                return FavoriteEvent.findOne()
                    .then(_favoriteEvent => {
                        favoriteEvent = _favoriteEvent;
                        return chai.request(app)
                            .delete(`/api/favevents/${favoriteEvent._id}`)
                            .set('authorization', `Bearer ${token}`);
                    })
                    .then(res => {
                        res.body.should.include.keys('favEventName', 'favDate', 'favArtists', 'favVenue', 'favVenueLocation', 'user_id', 'event_id');
                        return FavoriteEvent.findById(favoriteEvent._id);
                    })
                    .then(_favoriteEvent => {
                        should.not.exist(_favoriteEvent);
                    });
            });
        });
    });
});
