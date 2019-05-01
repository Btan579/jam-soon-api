const express = require("express");
const bodyParser = require("body-parser");
const { MetroSearchTerm } = require('./models');

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const router = express.Router();

router.use(bodyParser.json());

router.get('/', (req, res) => {
    MetroSearchTerm
        .find()
        .then(styles => {

            res.json({
                styles: styles
            });
        }).
        catch(err => {
            if (err) return console.error(err);
        });
});
