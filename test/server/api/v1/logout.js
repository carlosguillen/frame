'use strict';


const Lab = require('lab');
const Code = require('code');
const Path = require('path');
const Hoek = require('hoek');
const Config = require('../../../../config');
const Manifest = require('../../../../manifest');
const Hapi = require('hapi');
const HapiAuthBasic = require('hapi-auth-basic');
const Proxyquire = require('proxyquire');
const AuthPlugin = require('../../../../server/auth');
const LogoutPlugin = require('../../../../server/api/v1/logout');
const AuthenticatedUser = require('../../fixtures/credentials-admin');


const lab = exports.lab = Lab.script();
let ModelsPlugin;
let request;
let server;
let stub;


lab.before((done) => {

    stub = {
        Session: {}
    };

    const proxy = {};
    proxy[Path.join(process.cwd(), './server/models/session')] = stub.Session;

    ModelsPlugin = {
        register: Proxyquire('hapi-mongo-models', proxy),
        options: Manifest.get('/plugins')['hapi-mongo-models']
    };

    const plugins = [HapiAuthBasic, ModelsPlugin, AuthPlugin, LogoutPlugin];
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


lab.experiment('Logout Plugin (Delete Session)', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'DELETE',
            url: '/logout',
            credentials: AuthenticatedUser
        };

        done();
    });


    lab.test('it returns an error when delete fails', (done) => {

        stub.Session.findByIdAndDelete = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('delete failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when delete misses (no credentials)', (done) => {

        stub.Session.findByIdAndDelete = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, 0);
        };

        delete request.credentials;

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it returns a not found when delete misses (missing user from credentials)', (done) => {

        stub.Session.deleteOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, 0);
        };

        const CorruptedAuthenticatedUser = Hoek.clone(AuthenticatedUser);
        CorruptedAuthenticatedUser.user = undefined;
        request.credentials = CorruptedAuthenticatedUser;

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it deletes the authenticated user session successfully', (done) => {

        stub.Session.findByIdAndDelete = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, 1);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.message).to.match(/success/i);

            done();
        });
    });
});
