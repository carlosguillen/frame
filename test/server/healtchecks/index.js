'use strict';


const Lab = require('lab');
const Code = require('code');
const Config = require('../../../config');
const Hapi = require('hapi');
const HealthcheckPlugin = require('../../../server/healthchecks');

const lab = exports.lab = Lab.script();
let server;


lab.experiment('Healthchecks Plugin Result', () => {

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection({ port: Config.get('/port/web') });
        const plugin = HealthcheckPlugin;

        server.register(plugin, { }, (err) => {

            if (err) {
                return done(err);
            }

            server.initialize(done);
        });
    });

    lab.test('it returns a pong when calling /ping end point', (done) => {

        const request = {
            method: 'GET',
            url: '/status/healthcheck/ping'
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            done();
        });
    });

    lab.test('it returns n/a when build file is not available', (done) => {

        const request = {
            method: 'GET',
            url: '/status/healthcheck'
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result.version).to.be.a.string();
            Code.expect(response.result.started).to.be.a.date();
            Code.expect(response.result.uptime).to.be.a.string();
            done();
        });
    });


    lab.test('it returns an array of documents successfully', (done) => {

        const request = {
            method: 'GET',
            url: '/status/healthcheck'
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result.version).to.be.a.string();
            Code.expect(response.result.started).to.be.a.date();
            Code.expect(response.result.uptime).to.be.a.string();
            done();
        });
    });

});

lab.experiment('Healthchecks Plugin with missing files', () => {

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection({ port: Config.get('/port/web') });
        const plugin = HealthcheckPlugin;

        server.register({
            register: plugin,
            options: { packFile: '/missing', buildFile: '/missing' }
        }, (err) => {

            if (err) {
                return done(err);
            }

            server.initialize(done);
        });
    });

    lab.test('it returns a pong when calling /ping end point', (done) => {

        const request = {
            method: 'GET',
            url: '/status/healthcheck'
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result.version).to.equal('n/a');
            Code.expect(response.result.started).to.be.a.date();
            Code.expect(response.result.uptime).to.be.a.string();
            Code.expect(response.result.build).to.equal('n/a');
            done();
        });
    });
});
