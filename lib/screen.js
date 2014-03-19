
var Screen = function(name, options) {
    this.name = name;
    this.options = options;
}

Screen.prototype.setOptions = function(options) {
    this.options = _.merge(this.options, options);
}


module.exports = Screen;