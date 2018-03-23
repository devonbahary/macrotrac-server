require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Food} = require('./models/food');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// GET /foods
app.get('/foods', (req, res) => {
    Food.find({}).then((foods) => {
        res.send({foods});
    }, (err) => {
        res.status(400).send(err);
    })
});

// GET /foods/:id
app.get('/foods/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findById(id).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.status(400).send());
});

// POST /foods
app.post('/foods', (req, res) => {
    const food = new Food({
        name: req.body.name,
        carbs: req.body.carbs,
        prot: req.body.prot,
        fat: req.body.fat
    });

    food.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

// DELETE /foods/:id
app.delete('/foods/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findByIdAndRemove(id).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.send(400).send());
});

// PATCH /foods/:id
app.patch('/foods/:id', (req, res) => {
    const id = req.params.id;

    const body = _.pick(req.body, ['name', 'carbs', 'prot', 'fat']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findByIdAndUpdate(id, {$set: body}, {new: true}).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.status(400).send());
});

app.listen(port, () => {
    console.log(`Started server on port ${port}.`);
});

module.exports = {app};
