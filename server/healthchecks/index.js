'use strict';


const path = require('path');
const started = new Date();
const moment = require('moment');
const internals = {};


let buildNumber;
const version = require('../../package').version;


internals.pingHandler = function (request, reply) {

    reply({ message: 'pong' });
};


internals.mainHandler = function (request, reply) {

    const totalUptime = moment.duration(Date.now() - Number(started), 'ms').humanize();


    reply({
        version: version,
        started: started,
        uptime: totalUptime,
        build: buildNumber
    });
};


exports.register = function (plugin, options, next) {

    if (!options.buildFile) {
        options.buildFile = '../../build_number.json';
    }

    try {
        buildNumber = require(path.join(options.buildFile)).build_number;
    }
    catch (e) {
        buildNumber = 'n/a';
    }

    plugin.route([
        { path: '/status/healthcheck', method: 'GET', handler: internals.mainHandler },
        { path: '/status/healthcheck/ping', method: 'GET', handler: internals.pingHandler }
    ]);

    next();
};


exports.register.attributes = {
    name: 'health-checks'
};
