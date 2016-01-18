var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.bitbucket.org/2.0/'
});

var pickInputs = {
        'owner': 'owner',
        'repo_slug': 'repo_slug',
        'revision': 'revision'
    },
    pickOutputs = {
        '-': {
            key: 'values',
            fields: {
                'url': 'links.html.href',
                'content': 'content.raw',
                'created_on': 'created_on',
                'username': 'user.username',
                'user_url': 'user.links.self.href'
            }
        }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('bitbucket').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        var uriLink = 'repositories/' + inputs.owner + '/' + inputs.repo_slug + '/commit/' + inputs.revision + '/comments';
        //send API request
        request.get({
            uri: uriLink,
            oauth: credentials,
            json: true
        }, function (error, responce, body) {
            if (error || (body && body.error))
                this.fail(error || body.error);
            else if (typeof body === 'string')
                this.fail(body);
            else
                this.complete(util.pickOutputs(body, pickOutputs) || {});
        }.bind(this));
    }
};
