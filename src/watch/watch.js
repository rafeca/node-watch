// [Node-watch](https://github.com/jorritd/node-watch) Is a small [nodejs](http://www.nodejs.org/) module/lib to watch for filechanges.
// Filechanges are changes where the mtime (make-time) of file's changes.
// This situation happens when a file is overwritten. (e.g. altered and safed)
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
//     watch.addDir("./spec").addDir("./lib/watch")
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
//     watch.remdDir("./spec").remdDir("./lib/watch");
// 

// *nodejs requirements: EventEmitter, fs, path*
var EventEmitter = require('events').EventEmitter,
    fs = require("fs"),
    path = require("path");
// *private helper function:* 
// extends child with the prototypes of parent and return the extended child 
var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) {
  for (var key in parent) { 
    if (__hasProp.call(parent, key)){
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
var WatchClass = (function(){
    "use strict";
    __extends(Watch, EventEmitter);
  // #### dirs, array,  holds a collection of dirs being 'watched' ####
  var dirs = [];
  // ### Watch class Constructor ###
  function Watch(options){
  //     // 
  };
  
  // ### Public method: addDir(string) ###
  Watch.prototype.addDir = function(dir){
      // Add a dir relative './mydir' or '../mydir' from process.cwd()
      // or absolute '/my_path/my_dir'
      if(dir.substring(0,1)=="."){
        dir = process.cwd()+"/"+dir;
      }
      dir = path.normalize(dir);
      // Throws an error in *fs* if the path doesn't excists.
      // If the dir is watched allready it won't be added and
      // *this* is returned
      if(fs.statSync(dir).isDirectory()){
        if(dirs.indexOf(dir)!=-1){
          return this;
        }
        dirs.push(dir);
        // walk the dir, get the files and watch
        var files = fs.readdirSync(dir);
        for(var i = 0;i<files.length;i++){
          var full_path = dir + "/" +files[i];
          if(fs.statSync(full_path).isFile()){
            this.watchFile(full_path);
          }
        }
      }
      // Return *this* ,makes it chainable
      return this;
  };
  // ### Public method: remDir(string) ###
  // Remove a dir relative './mydir' or '../mydir' from process.cwd()
  // Or absolute '/my_path/my_dir'
  Watch.prototype.remDir = function(dir){
    if(dir.substring(0,1)=="."){
      dir = process.cwd()+"/"+dir;
    }
    dir = path.normalize(dir);
     // Detetect if the dir is being watched
     // and emove the dir or
     // Throw an error if the dir isn't found
    var index_search = dirs.indexOf(dir);
    if(index_search>-1){
      dirs.splice(index_search,1);
    }else{
      throw("No such directory to watch: "+dir)
    }
    // walk the dir, get the files and UNwatch
    if(fs.statSync(dir).isDirectory()){
       var files = fs.readdirSync(dir);
       for(var i = 0;i<files.length;i++){
         var full_path = dir + "/" +files[i];
         if(fs.statSync(full_path).isFile()){
           this.unwatchFile(full_path);
         }
       }
    }
    // Return *this* ,makes it chainable
    return this;
  };
  // ### Public method: onChange(callback) ###
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
  // and return *this*
  Watch.prototype.onChange = function(cb){
    this.on("change",cb);
    return this;
  };
  // ### Public method: clearListeners() ###
  Watch.prototype.clearListeners = function(){
    this.removeAllListeners("change");
    return this;
  }
  // ### Method: watchFile(string) ###
  // *file* should be an absolute path to a file.
  // Single files aren't tracked (remembered being watched)
  // If the file has a changed mtime
  // then this will fires the *change* event
  //
  // When an event triggers 3 arguments are send to the callback listener
  //
  //  * file String, absolute filepath
  //  * prev [stats objects](http://nodejs.org/docs/v0.4.8/api/fs.html#fs.watchFile)
  //  * curr [stats objects](http://nodejs.org/docs/v0.4.8/api/fs.html#fs.watchFile)
  //
  // Did you now that the atime, mtime and ctime properties of Stat objects
  // are actually Date objects?
  Watch.prototype.watchFile = function(file){
    var self = this;
      fs.watchFile(file,function(prev,curr){
        if(prev.mtime.getTime()!= curr.mtime.getTime()){
          self.emit("change",file,prev,curr);
        };
      });
    // return *self* (this object)
    return self;
  };
  // ### Method: unwatchFile(string) ###
  // Watched files aren't tracked
  Watch.prototype.unwatchFile = function(file){
      fs.unwatchFile(file);
      return this;
  };
  // #### private helper method ####
  Watch.prototype._helperGetWatchedDirs = function(){
      return dirs;
  };
  return Watch;
})();

// create a new object and export an instance of Watch
module.exports = new WatchClass();

