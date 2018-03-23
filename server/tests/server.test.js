const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Food} = require('./../models/food');

const foods = [{
    _id: new ObjectID(),
    name: 'banana',
    carbs: 4,
    prot: 0.2,
    fat: 1
}, {
    _id: new ObjectID(),
    name: 'hamburger',
    carbs: 16,
    prot: 22,
    fat: 21
}];


// before each test, delete all 'food' and insert test data
beforeEach((done) => {
    Food.remove({}).then(() => {
        return Food.insertMany(foods);
    }).then(() => done());
});

describe('GET /foods route', () => {
    it('should return all foods', (done) => {
        request(app)
            .get('/foods')
            .expect(200)
            .expect((res) => {
                expect(res.body.foods.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /foods/:id route', () => {
    it('should return food doc', (done) => {
        const id = foods[0]._id;
        request(app)
            .get(`/foods/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.food._id).toBe(id.toHexString());
            })
            .end(done);
    });

    it('should return a 404 if food not found', (done) => {
        const randId = new ObjectID();
        request(app)
            .get(`/foods/${randId.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for invalid objectID', (done) => {
        request(app)
            .get('/foods/123')
            .expect(404)
            .end(done);
    });
});

describe('POST /foods route', () => {
    it('should create a new food', (done) => {
        // sample 'food' send data
        const food = {
          name: 'banana',
          carbs: Math.round(20 * Math.random()),
          prot: Math.round(20 * Math.random()),
          fat: Math.round(20 * Math.random())
        };

        request(app)
            .post('/foods')
            .send(food)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(food.name);
                expect(res.body.carbs).toBe(food.carbs);
                expect(res.body.prot).toBe(food.prot);
                expect(res.body.fat).toBe(food.fat);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // verify newly added 'food' is found in Food model
                Food.find({
                    carbs: food.carbs,
                    prot: food.prot,
                    fat: food.fat
                }).then((foods) => {
                    expect(foods.length).toBe(1); // expect 1
                    done();
                }).catch(e => done(e));
            });
    });

    it ('should not create food with invalid data', (done) => {
        request(app)
            .post('/foods')
            .send({}) // send empty object, invalid
            .expect(400)
            .end((err, res) => {
                done();
            });
    });
});

describe('DELETE /foods/:id route', () => {
    it('should remove a food', (done) => {
        const id = foods[0]._id;
        request(app)
            .delete(`/foods/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.food._id).toBe(id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Food.findById(id).then((food) => {
                    expect(food).toNotExist();
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return 404 if food not found', (done) => {
        const id = new ObjectID();
        request(app)
            .delete(`/foods/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if invalid objectID', (done) => {
        request(app)
            .delete('/foods/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /foods/:id route', () => {
    it('should update the food', (done) => {
        const id = foods[0]._id;
        const updatedFood = {
            name: 'apple',
            carbs: 3
        }
        request(app)
            .patch(`/foods/${id}`)
            .send(updatedFood)
            .expect(200)
            .expect((res) => {
                expect(res.body.food.name).toBe(updatedFood.name);
                expect(res.body.food.carbs).toBe(updatedFood.carbs);
                expect(res.body.food.prot).toBe(foods[0].prot);
                expect(res.body.food.fat).toBe(foods[0].fat);
            })
            .end(done);
    });
});
