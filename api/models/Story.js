/**
 * Story
 *
 * @module      ::  Model
 * @description ::  This model represent user story on taskboard. User stories are attached to project and
 *                  sprint. Sprint relation is not required, if sprintId is 0 or null current user story is
 *                  in project backlog.
 */
module.exports = {
    schema: true,
    attributes: {
        // Relation to Project model
        projectId: {
            type:       'integer',
            required:   true
        },
        // Relation to Sprint model
        sprintId: {
            type:       'integer',
            defaultsTo: 0
        },
        // Relation to Milestone model
        milestoneId: {
            type:       'integer',
            defaultsTo: 0
        },
        // Relation to type model, note that this is just default type for story tasks
        typeId: {
            type:       'integer',
            defaultsTo: 0,
            required:   true
        },
        title: {
            type:       'string',
            required:   true,
            minLength:  5
        },
        description: {
            type:       'text',
            required:   true,
            minLength:  10
        },
        estimate: {
            type:       'integer',
            required:   true,
            defaultsTo: -1
        },
        priority: {
            type:       'integer',
            defaultsTo: 0
        },
        vfCase: {
            type:       'integer',
            defaultsTo: 0
        },
        isDone: {
            type:       'boolean',
            required:   true,
            defaultsTo: 0
        },

        estimateFormatted: function() {
            return (parseInt(this.estimate, 10) === -1) ? '???' : this.estimate;
        },

        objectTitle: function() {
            return this.title;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before create callback. Basically we want to make sure that isDone bit is set to false
     * and calculate story priority according to same project and sprint stories.
     *
     * @param   {sails.model.story} values
     * @param   {Function}          cb
     */
    beforeCreate: function(values, cb) {
        values.isDone = false;

        Story
            .findOne({
                projectId: values.projectId,
                sprintId: values.sprintId
            })
            .sort('priority DESC')
            .done(function(error, story) {
                var priority;

                if (error) {
                    cb(error)
                } else if (!story) {
                    priority = 0;
                } else {
                    priority = story.priority + 1;
                }

                values.priority = priority;

                cb();
            });
    },

    /**
     * After create callback
     *
     * @param   {sails.model.story} values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Story', values);

        cb();
    },

    /**
     * After update callback
     *
     * @param   {sails.model.story} values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Story', values);

        cb();
    },

    /**
     * Before destroy callback
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Story
            .findOne(terms)
            .done(function(error, story) {
                HistoryService.remove('Story', story.id);

                cb();
            });
    }
};
