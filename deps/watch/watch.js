var EventEmitter = require("events").EventEmitter, fs = require("fs"), path = require("path");

var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) {
            child[key] = parent[key];
        }
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
};

var Watch = function() {
    "use strict";
    __extends(Watch, EventEmitter);
    var dirs = [];
    function Watch(options) {}
    Watch.prototype.addDir = function(dir) {
        if (dir.substring(0, 1) == ".") {
            dir = process.cwd() + "/" + dir;
        }
        dir = path.normalize(dir);
        if (fs.statSync(dir).isDirectory()) {
            if (dirs.indexOf(dir) != -1) {
                return this;
            }
            dirs.push(dir);
            var files = fs.readdirSync(dir);
            for (var i = 0; i < files.length; i++) {
                var full_path = dir + "/" + files[i];
                if (fs.statSync(full_path).isFile()) {
                    this.watchFile(full_path);
                }
            }
        }
        return this;
    };
    Watch.prototype.remDir = function(dir) {
        if (dir.substring(0, 1) == ".") {
            dir = process.cwd() + "/" + dir;
        }
        dir = path.normalize(dir);
        var index_search = dirs.indexOf(dir);
        if (index_search > -1) {
            dirs.splice(index_search, 1);
        } else {
            throw "No such directory to watch: " + dir;
        }
        if (fs.statSync(dir).isDirectory()) {
            var files = fs.readdirSync(dir);
            for (var i = 0; i < files.length; i++) {
                var full_path = dir + "/" + files[i];
                if (fs.statSync(full_path).isFile()) {
                    this.unwatchFile(full_path);
                }
            }
        }
        return this;
    };
    Watch.prototype.onChange = function(cb) {
        this.on("change", cb);
        return this;
    };
    Watch.prototype.clearListeners = function() {
        this.removeAllListeners("change");
        return this;
    };
    Watch.prototype.watchFile = function(file) {
        var self = this;
        fs.watchFile(file, function(prev, curr) {
            if (prev.mtime.getTime() != curr.mtime.getTime()) {
                self.emit("change", file, prev, curr);
            }
        });
        return self;
    };
    Watch.prototype.unwatchFile = function(file) {
        fs.unwatchFile(file);
        return this;
    };
    Watch.prototype._helperGetWatchedDirs = function() {
        return dirs;
    };
    return Watch;
}();

module.exports = new Watch({});