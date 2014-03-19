var _ = require('lodash');

var Overlay = function(name, options, visible) {
    this.name = name;
    this.options = options || {};
    this.visible = visible || false;
}

Overlay.prototype.setOptions = function(options) {
    this.options = _.merge(this.options, options);
}

Overlay.prototype.setVisible = function(visible) {
    this.visible = visible;
}

module.exports = Overlay;