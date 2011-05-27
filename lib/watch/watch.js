"use strict";

var EventEmitter = require("events").EventEmitter, fs = require("fs"), path = require("path");

var _extends = function(a, b) {
    function d() {
        this.constructor = a;
    }
    for (var c in b) {
        if (__hasProp.call(b, c)) a[c] = b[c];
    }
    d.prototype = b.prototype;
    a.prototype = new d;
    a.__super__ = b.prototype;
    return a;
};

var Watch = function() {
    function b() {}
    _extends(b, EventEmitter);
    var a = [];
    b.prototype.addDir = function(b) {
        if (b.substring(0, 1) == ".") {
            b = process.cwd() + "/" + b;
        }
        b = path.normalize(b);
        if (fs.statSync(b).isDirectory()) {
            if (a.indexOf(b) != -1) {
                return this;
            }
            a.push(b);
            var c = fs.readdirSync(b);
            for (var d = 0; d < c.length; d++) {
                var e = b + "/" + c[d];
                if (fs.statSync(e).isFile()) {
                    this.watchFile(e);
                }
            }
        }
        return this;
    };
    b.prototype.remDir = function(b) {
        if (b.substring(0, 1) == ".") {
            b = process.cwd() + "/" + b;
        }
        b = path.normalize(b);
        var c = a.indexOf(b);
        if (c > -1) {
            a.splice(c, 1);
        } else {
            throw "No such directory to watch: " + b;
        }
        if (fs.statSync(b).isDirectory()) {
            var d = fs.readdirSync(b);
            for (var e = 0; e < d.length; e++) {
                var f = b + "/" + d[e];
                if (fs.statSync(f).isFile()) {
                    this.unwatchFile(f);
                }
            }
        }
        return this;
    };
    b.prototype.onChange = function(a) {
        this.on("change", a);
        return this;
    };
    b.prototype.clearListeners = function() {
        this.removeAllListeners("change");
        return this;
    };
    b.prototype.watchFile = function(a) {
        var b = this;
        fs.watchFile(a, function(c, d) {
            if (c.mtime.getTime() != d.mtime.getTime()) {
                b.emit("change", a, c, d);
            }
        });
        return b;
    };
    b.prototype.unwatchFile = function(a) {
        fs.unwatchFile(a);
        return this;
    };
    b.prototype._helperGetWatchedDirs = function() {
        return a;
    };
    return b;
}();

module.exports = new Watch;