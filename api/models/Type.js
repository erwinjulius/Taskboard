/**
 * Type
 *
 * @module      ::  Model
 * @description ::  This model represent task types on taskboard. Basically this types are 'static':
 *                   - 1 = normal
 *                   - 2 = bug
 *                   - 3 = test
 */
module.exports = {
    schema: true,
    attributes: {
        title: {
            type:       'string',
            required:   true
        },
        order: {
            type:       'integer',
            required:   true
        },
        class: {
            type:       'string',
            required:   true
        },
        classText: {
            type:       'string',
            required:   true
        },

        objectTitle: function() {
            return this.title;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Type', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Type', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Type
            .findOne(terms)
            .done(function(error, type) {
                HistoryService.remove('Type', type.id);

                cb();
            });
    }
};
