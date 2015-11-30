'use strict';


const Joi = require('joi');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;


const Facility = BaseModel.extend({
    constructor: function (attrs) {

        ObjectAssign(this, attrs);
    }
});


Facility._collection = 'facilities';


Facility.schema = Joi.object().keys({
    _id: Joi.object(),
    name: Joi.string().required(),
    globalId: Joi.string().required(),
    customer: Joi.string().required(),
    isActive: Joi.boolean(),
    timeCreated: Joi.date()
});


Facility.indexes = [
    { key: { 'customer': 1 } },
    { key: { 'globalId': 1 }, unique: true }
];


Facility.create = function (name, globalId, customer, callback) {

    const document = {
        name: name,
        globlaId: globalId,
        customer: customer,
        isActive: true,
        timeCreated: new Date()
    };

    this.insertOne(document, (err, docs) => {

        if (err) {
            return callback(err);
        }

        callback(null, docs[0]);
    });
};

module.exports = Facility;
