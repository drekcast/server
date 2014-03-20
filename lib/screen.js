var _ = require('lodash');

var Screen = function(name, options) {
    this.name = name;
    this.options = options;
}

Screen.prototype.setOptions = function(options) {
    this.options = _.extend(this.options, options);
}

Screen.prototype.getClientOptions = function() {
    return _.omit(this.options, [ 'providers' ]);
}

module.exports = Screen;