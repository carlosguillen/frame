'use strict';


const Lab = require('lab');
const Code = require('code');
const Path = require('path');
const Config = require('../../../../config');
const Manifest = require('../../../../manifest');
const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const Proxyquire = require('proxyquire');
const AuthPlugin = require('../../../../server/auth');
const FacilityPlugin = require('../../../../server/api/v1/facilities');
const AuthenticatedAdmin = require('../../fixtures/credentials-admin');


const lab = exports.lab = Lab.script();
let ModelsPlugin;
let request;
let server;
let stub;


lab.before((done) => {

    stub = {
        Facility: {}
    };

    const proxy = {};
    proxy[Path.join(process.cwd(), './server/models/facility')] = stub.Facility;

    ModelsPlugin = {
        register: Proxyquire('hapi-mongo-models', proxy),
        options: Manifest.get('/plugins')['hapi-mongo-models']
    };

    const plugins = [HapiAuthBasic, ModelsPlugin, AuthPlugin, FacilityPlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.initialize(done);
    });
});


lab.after((done) => {

    server.plugins['hapi-mongo-models'].BaseModel.disconnect();
    done();
});


lab.experiment('Facilities Plugin Result List', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/facilities',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when paged find fails', (done) => {

        stub.Facility.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('paged find failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an array of documents successfully', (done) => {

        stub.Facility.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { data: [{}, {}, {}] });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Facilities Plugin Read', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/facilities/93EP150D35',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when find by id fails', (done) => {

        stub.Facility.findById = function (id, callback) {

            callback(Error('find by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when find by id misses', (done) => {

        stub.Facility.findById = function (id, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it returns a document successfully', (done) => {

        stub.Facility.findById = function (id, callback) {

            callback(null, { _id: '93EP150D35' });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Facilities Plugin Create', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'POST',
            url: '/facilities',
            payload: {
                name: 'Space Craft',
                globalId: '9999BBB',
                customer: '56575c2f6da95821307762b5'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when create fails', (done) => {

        stub.Facility.create = function (name, globalId, customer, callback) {

            callback(Error('create failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it creates a document successfully', (done) => {

        stub.Facility.create = function (name, globalId, customer, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Facilities Plugin Update', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/facilities/93EP150D35',
            payload: {
                name: 'Space Craft',
                globalId: '9999BBB',
                customer: '56575c2f6da95821307762b5'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when update fails', (done) => {

        stub.Facility.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns not found when find by id misses', (done) => {

        stub.Facility.findByIdAndUpdate = function (id, update, callback) {

            callback(null, undefined);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            done();
        });
    });


    lab.test('it updates a document successfully', (done) => {

        stub.Facility.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Facilities Plugin Delete', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'DELETE',
            url: '/facilities/93EP150D35',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when delete by id fails', (done) => {

        stub.Facility.findByIdAndDelete = function (id, callback) {

            callback(Error('delete by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when delete by id misses', (done) => {

        stub.Facility.findByIdAndDelete = function (id, callback) {

            callback(null, undefined);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it deletes a document successfully', (done) => {

        stub.Facility.findByIdAndDelete = function (id, callback) {

            callback(null, 1);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.message).to.match(/success/i);

            done();
        });
    });
});
