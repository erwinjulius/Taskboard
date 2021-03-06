/**
 * User
 *
 * @module      ::  Model
 * @description ::  Model to represents taskboard user.
 */
var bcrypt = require("bcrypt");
var gravatar = require("gravatar");
var http = require("http");
var async = require("async");

/**
 * Generic password hash function.
 *
 * @param   {sails.model.user}  values
 * @param   {Function}          next
 */
function hashPassword(values, next) {
    bcrypt.hash(values.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }

        values.password = hash;
        next();
    });
}

module.exports = {
    schema: true,
    attributes: {
        username: {
            type:       'string',
            required:   true,
            unique:     true
        },
        firstName: {
            type:       'string',
            required:   true
        },
        lastName: {
            type:       'string',
            required:   true
        },
        email: {
            type:       'email',
            required:   true,
            unique:     true
        },
        admin: {
            type:       'boolean',
            defaultsTo: false
        },
        password: {
            type:       'string',
            required:   false
        },

        // Computed user fullName string
        fullName: function() {
            return this.lastName + ' ' + this.firstName;
        },

        lastLoginObject: function() {
            return new Date(this.lastLogin);
        },

        gravatarImage: function() {
            return gravatar.url(this.email, {s: '25', r: 'pg', d: '404'});
        },

        // ObjectTitle
        objectTitle: function() {
            return this.lastName + ' ' + this.firstName;
        },

        // Override toJSON instance method to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;

            return obj;
        },

        // Validate password
        validPassword: function(password, callback) {
            var obj = this.toObject();

            if (callback) {
                return bcrypt.compare(password, obj.password, callback);
            }

            return bcrypt.compareSync(password, obj.password);
        }
    },

    // Life cycle callbacks

    /**
     * Before create callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          next
     */
    beforeCreate: function(values, next) {
        hashPassword(values, next);
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          next
     */
    beforeUpdate: function(values, next) {
        if (values.password) {
            hashPassword(values, next);
        } else if (values.id) {
            User
                .findOne(values.id)
                .done(function(err, user) {
                    if (err) {
                        next(err);
                    } else {
                        values.password = user.password;
                        next();
                    }
                });
        } else {
            next();
        }
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('User', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('User', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        User
            .findOne(terms)
            .done(function(error, user) {
                HistoryService.remove('User', user.id);

                cb();
            });
    }
};
