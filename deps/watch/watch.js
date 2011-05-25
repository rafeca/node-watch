/*
* License:
* file: watch.js
* 
* description:
* 	nodejs script that watches on file-changes based on mtime
* 
* usage:
*	
*	var watch = require('./deps/watch/watch.js');
*	
*	// Adding 2 dirs relative from process.cwd()
*	// Adding Abolute paths works as well
*	// (Nested dirs are not watched)
*	// and add the callback
*	watch.addDir("./spec").addDir("./lib/watch").onChange(function(file,prev,curr){
*			console.log(file);
*			console.log(prev.mtime);
*			console.log(curr,mtime);
*	});
*	
*	// Clear (remove) the listeners
*	
*	watch.clearListeners();
*	
*	// Remove dirs to watch
*	watch.remdDir("./spec").remdDir("./lib/watch");
*	
* Author: <jorrit.duin@gmail.com>
* 
*/

/* nodejs requirements */
var EventEmitterObject = require('events').EventEmitter,
	fs = require("fs"),
	path = require("path");
/* 
*	helper function: 
*	extends child with the prototypes of parent and return the extended child 
*/
var extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
/*
*	Watch class declaration
*/
var Watch = (function(){
	extends(Watch, EventEmitterObject);
	
	var dirs = [];
	// Constructor
	function Watch(){
		
	};
	
	Watch.prototype.addDir = function(dir){
	    // Relative?
	    if(dir.substring(0,1)=="."){
	    	dir = process.cwd()+"/"+dir;
	    }
	    dir = path.normalize(dir);
	    if(fs.statSync(dir).isDirectory()){
	    	if(dirs.indexOf(dir)!=-1){
	    		// Dir allready watched
	    		return this;
	    	}
	    	dirs.push(dir);
	    	// traverse the dir, get the files and watch
			var files = fs.readdirSync(dir);
			for(var i = 0;i<files.length;i++){
				var full_path = dir + "/" +files[i];
				if(fs.statSync(full_path).isFile()){
					this.watchFile(full_path);
				}
			}
	    }
		return this;
	};
	
	Watch.prototype.remDir = function(dir){
		// Relative?
	    if(dir.substring(0,1)=="."){
	    	dir = process.cwd()+"/"+dir;
	    }
	    dir = path.normalize(dir);
	    var index_search = dirs.indexOf(dir);
	    if(index_search>-1){
	    	dirs.splice(index_search,1);
	    }else{
	    	throw("No such directory to watch: "+dir)
	    }
	     if(fs.statSync(dir).isDirectory()){
	     	var files = fs.readdirSync(dir);
			for(var i = 0;i<files.length;i++){
				var full_path = dir + "/" +files[i];
				if(fs.statSync(full_path).isFile()){
					this.unwatchFile(full_path);
				}
			}
	     }
		return this;
	};
	
	Watch.prototype.onChange = function(cb){
		this.on("change",cb);
		return this;
	};
	
	Watch.prototype.clearListeners = function(){
		this.removeAllListeners("change");
		return this;
	}
	
	Watch.prototype.watchFile = function(file){
		var self = this;
		fs.watchFile(file,function(prev,curr){
			if(prev.mtime != curr.mtime){
				self.emit("change",file,prev,curr);
			};
		});
		return self;
	};
	Watch.prototype.unwatchFile = function(file){
		fs.unwatchFile(file);
		return this;
	};
	/* PRIVATE helper functions needed for test puproses */
	Watch.prototype._helperGetWatchedDirs = function(){
		return dirs;
	};
	return Watch;
})();


/* create a new object and export an instance of Watch */
module.exports = new Watch();

