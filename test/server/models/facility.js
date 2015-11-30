'use strict';


const Lab = require('lab');
const Code = require('code');
const Config = require('../../../config');
const Facility = require('../../../server/models/facility');


const lab = exports.lab = Lab.script();


lab.experiment('Facility Class Methods', () => {

    lab.before((done) => {

        Facility.connect(Config.get('/hapiMongoModels/mongodb'), (err, count) => {

            done(err);
        });
    });


    lab.after((done) => {

        Facility.deleteMany({}, (err, count) => {

            Facility.disconnect();
            done(err);
        });
    });


    lab.test('it returns a new instance when create succeeds', (done) => {

        Facility.create('Space Ship', '20005ABC', 'Space Crafts Inc', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Facility);

            done();
        });
    });

    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = Facility.insertOne;
        Facility.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        Facility.create('Space Ship', '20005ABC', 'Space Crafts Inc', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Facility.insertOne = realInsertOne;

            done();
        });
    });
});
