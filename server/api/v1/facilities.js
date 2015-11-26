'use strict';


const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Facility = server.plugins['hapi-mongo-models'].Facility;


    server.route({
        method: 'GET',
        path: '/facilities',
        config: {
            auth: {
                strategy: 'simple',
                scope: 'admin'
            },
            validate: {
                query: {
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            const fields = request.query.fields;
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            Facility.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/facilities/{id}',
        config: {
            auth: {
                strategy: 'simple',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            Facility.findById(request.params.id, (err, facility) => {

                if (err) {
                    return reply(err);
                }

                if (!facility) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(facility);
            });
        }
    });


    // TODO: Add globalId uniqueness validation
    server.route({
        method: 'POST',
        path: '/facilities',
        config: {
            auth: {
                strategy: 'simple',
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    globalId: Joi.string().required(),
                    customer: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            const name = request.payload.name;
            const globalId = request.payload.globalId;
            const customer = request.payload.customer;

            Facility.create(name, globalId, customer, (err, facility) => {

                if (err) {
                    return reply(err);
                }

                reply(facility);
            });
        }
    });


    // TODO: Add globalId uniqueness validation
    server.route({
        method: 'PUT',
        path: '/facilities/{id}',
        config: {
            auth: {
                strategy: 'simple',
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    globalId: Joi.string().required(),
                    customer: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    name: request.payload.name,
                    globalId: request.payload.globalId,
                    customer: request.payload.customer
                }
            };

            Facility.findByIdAndUpdate(id, update, (err, facility) => {

                if (err) {
                    return reply(err);
                }

                if (!facility) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(facility);
            });
        }
    });


    server.route({
        method: 'DELETE',
        path: '/facilities/{id}',
        config: {
            auth: {
                strategy: 'simple',
                scope: 'admin'
            },
            pre: [
                AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            Facility.findByIdAndDelete(request.params.id, (err, facility) => {

                if (err) {
                    return reply(err);
                }

                if (!facility) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply({ message: 'Success.' });
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'facility' // argh
};

