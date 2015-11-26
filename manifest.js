'use strict';


const Confidence = require('confidence');
const Config = require('./config');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web']
    }],
    plugins: {
        'hapi-auth-basic': {},
        'lout': {},
        'inert': {},
        'vision': {},
        'visionary': {
            engines: { jade: 'jade' },
            path: './server/web'
        },
        'hapi-mongo-models': {
            mongodb: Config.get('/hapiMongoModels/mongodb'),
            models: {
                Account: './server/models/account',
                AdminGroup: './server/models/admin-group',
                Admin: './server/models/admin',
                AuthAttempt: './server/models/auth-attempt',
                Session: './server/models/session',
                Status: './server/models/status',
                User: './server/models/user'
            },
            autoIndex: Config.get('/hapiMongoModels/autoIndex')
        },
        './server/auth': {},
        './server/mailer': {},
        './server/api/v1/accounts': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/admin-groups': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/admins': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/auth-attempts': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/contact': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/index': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/login': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/logout': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/sessions': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/signup': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/statuses': [{ routes: { prefix: '/api/v1' } }],
        './server/api/v1/users': [{ routes: { prefix: '/api/v1' } }],
        './server/web/index': {}
    }
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
