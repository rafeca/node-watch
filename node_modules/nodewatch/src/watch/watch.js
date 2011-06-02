// [Node-watch](https://github.com/jorritd/node-watch) Is a small [nodejs](http://www.nodejs.org/) 
// module/lib to watch for filechanges.
// Filechanges are changes where the mtime (make-time) of file's changes.
// This situation happens when a file is overwritten. (e.g. safed)
// It uses the standard nodejs [EventEmitter](http://nodejs.org/docs/v0.4.8/api/events.html#events.EventEmitter) as base and therefor has all the methods
// and properties an EventEmitter has. 
// 
// ####usage:
// 
//     var watch = require('./deps/watch/watch.js');
//     
//     // Adding 2 dirs relative from process.cwd()
//     // Adding Abolute paths works as well
//     // (Nested dirs are not watched)
//     // and add the callback
//     watch.add("./spec").add("./lib/watch")
//     .onChange(function(file,prev,curr){
//       console.log(file);
//       console.log(prev.mtime);
//       console.log(curr,mtime);
//     });
//     
//     // Clear (remove) the listeners
//     watch.clearListeners();
//     
//     // Remove dirs to watch
//     watch.remove("./spec").remove("./lib/watch");
// 

// *nodejs requirements: EventEmitter, fs, path*
var EventEmitter = require("events").EventEmitter, fs = require("fs"), path = require("path");

// *private helper function:* 
// extends child with the prototypes of parent and return the extended child 

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
// ## Watch class declaration ##
// extends from [EventEmitter](http://nodejs.org/docs/v0.4.8/api/events.html#events.EventEmitter)

var WatchClass = function() {
    "use strict";
    __extends(Watch, EventEmitter);
    // ### PUBLIC METHODS ###
    // 
    // -----------------------
    //
    
    // ## Watch class Constructor ##
    
    function Watch(options) {}
    
    // ## Public method: add(string) ##
    // String is an absolute or relative path
    // to a file or dir to add (watch),
    // returns this object
    
    Watch.prototype.add = function(str_file_or_path) {
        return this.__handle(true, str_file_or_path);
    };
    
    // ## Public method: remove(string) ##
    // String is a absolute or relative path
    // to a file or dir to remove (unwatch),
    // returns this object
    
    Watch.prototype.remove = function(str_file_or_path) {
        return this.__handle(false, str_file_or_path);
    };
    
    // ## Public method: onChange(callback) ##
    // Todo: check if *cb* is a function
    // 
    // add a callback *cb* :
    //
    //      function(file,prev,curr){
    //         /* do something with file,prev,curr */
    //      };
    //
    // When an event triggers 3 arguments are send to the callback listener
    //
    //  * file String, absolute filepath
    //  * prev [stats objects](http://nodejs.org/docs/v0.4.8/api/fs.html#fs.watchFile)
    //  * curr [stats objects](http://nodejs.org/docs/v0.4.8/api/fs.html#fs.watchFile)
    //
    // and return *this* object
    
    Watch.prototype.onChange = function(cb) {
        this.on("change", cb);
        return this;
    };
    
    // ### Public method: clearListeners() ###
    
    Watch.prototype.clearListeners = function() {
        this.removeAllListeners("change");
        return this;
    };
    
    // ### PRIVATE METHODS ###
    // 
    // -----------------------
    //
    
    // ## Private method: __handle(boolean, string) ##
    // String is a absolute or relative path
    // to a file or dir. 
    //
    // First *str_file_or_path* is normalized as a valid path, relative paths
    // are made absolute depending on process.cwd()
    //
    //
    // The boolean *add* (true == add, false == remove) is passed to
    // the __file or __dir method
    //
    // returns this object
    
    Watch.prototype.__handle = function(add, str_file_or_path) {
        if (str_file_or_path.substring(0, 1) == ".") {
            str_file_or_path = process.cwd() + "/" + str_file_or_path;
        }
        str_file_or_path = path.normalize(str_file_or_path);
        if (fs.statSync(str_file_or_path).isFile()) {
            return this.__file(add, str_file_or_path);
        }
        if (fs.statSync(str_file_or_path).isDirectory()) {
            return this.__dir(add, str_file_or_path);
        }
    };
    
    // ## Private method: __dir(boolean, string) ##
    // walk a dir and pass the files with the add boolean
    Watch.prototype.__dir = function(add, dir) {
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            var full_path = dir + "/" + files[i];
            if (fs.statSync(full_path).isFile()) {
                this.__file(add, full_path);
            }
        }
        return this;
    };
    
    // ## Private method: __file(boolean, string) ##
    // Finally add (add==true) or remove a
    // file from watching
    
    Watch.prototype.__file = function(add, file) {
        var self = this;
        if (add) {
            fs.watchFile(file, function(prev, curr) {
                if (prev.mtime.getTime() != curr.mtime.getTime()) {
                    self.emit("change", file, prev, curr);
                }
            });
        } else {
            fs.unwatchFile(file);
        }
        return self;
    };
    return Watch;
}();

module.exports = new WatchClass;
