// File: ./spec/watchSpec.js
/*
TODO:
make the test faster by mocking the async callbacks

dev_mod is set in the JakeFile either src or lib
*/
var fs = require("fs"); 
var watch = require("../"+dev_mode+"/watch/watch.js"); 

describe('watch module test adding files', function(){
	it('should be an object', function(){
  		expect(typeof watch).toEqual("object");
 	}); 
 	it('has event properties', function(){
 		// http://nodejs.org/docs/v0.4.7/api/events.html#emitter.on
  		expect(typeof watch.on).toEqual("function");
	});
		
	it('should be possible to emit an event on file change', function(){
		
  		var fp1 = __dirname+"/tmp/file1.txt",
  			stime = new Date().toUTCString(),
  			event_detected = false, 
  			changed_file = "",
  			changed_prev = "",
  			changed_curr = "",
  			counter = 0;
  		
  		watch.watchFile(fp1).on("change",function(file,prev,curr){
  			counter ++;
  			changed_file = file;
  			changed_prev = prev;
  			changed_curr = curr;
  			event_detected = true;			
  		});
  		// Wat for the trigger
  		waitsFor(function() {
  		    if(event_detected){
  		    	if(counter>0){
  		    		asyncSpecDone();
  		    		expect(event_detected).toBe(true);
  		    		expect(changed_file).toEqual(fp1);
  		    		expect(changed_prev.mtime.getTime()).not.toEqual(changed_curr.mtime.getTime());
  		    		watch.removeAllListeners("change");
  		    		watch.unwatchFile(fp1);
  		    		expect(watch.listeners("change").length).toBe(0);
  		    		return true;
  		    	}
  		    }  	    
  		    return false;
    	}, "The event is not detected",10000);
    	expect(watch.listeners("change").length).toBe(1);
  		asyncSpecWait.timeout = 10 * 1000;
  		asyncSpecWait();
    	fs.writeFileSync(fp1, stime);
	}); 

});

describe('watch module test adding dirs', function(){
	
	it('should be possible to add dirs to watch', function(){
		expect(typeof watch.addDir).toEqual("function");
		// This dir does not excists (relative form process.cwd())
		expect(function(){watch.addDir("./no_dirs")}).toThrow();
		// This should be allright
		expect(function(){watch.addDir(__dirname+"/tmp")}).not.toThrow();
		// There should be 1 entry in de dirs array
		expect(watch._helperGetWatchedDirs().length).toBe(1);
		// Add a second dir (the same) which sould not be added
		expect(function(){watch.addDir(__dirname+"/tmp")}).not.toThrow();
		// Still one
		expect(watch._helperGetWatchedDirs().length).toBe(1);
	
	}); 
	it('should be possible to remove dirs to watch', function(){
		expect(typeof watch.remDir).toEqual("function");
		// Remove a non - excisting dir
		expect(function(){watch.remDir("./no_dirs")}).toThrow();
		expect(function(){watch.remDir(__dirname+"/tmp")}).not.toThrow();
		expect(watch._helperGetWatchedDirs().length).toBe(0);	
	}); 
	
	it('should emit a change on a watched dir', function(){
		var event_detected = false, 
			fp1 = __dirname+"/tmp/file1.txt",
			stime = new Date().toUTCString(),
			changed_file = "",
  			counter = 0;
  			
  		expect(function(){watch.onChange({})}).toThrow();	
		watch.addDir(__dirname+"/tmp").onChange(function(file,prev,curr){
  			counter ++;
  			event_detected = true;
  			stime = new Date().toUTCString();  	
  			changed_file = file;	
  		});
  		
  		waitsFor(function() {
  		    if(event_detected){
  		    	if(counter>0){
  		    		asyncSpecDone();
  		    		expect(fp1).toBe(changed_file);
  		    		
  		    		watch.clearListeners();
  		    		watch.remDir(__dirname+"/tmp");
  		    		expect(watch.listeners("change").length).toBe(0);
  		    		return true;
  		    	}
  		    }  	    
  		    return false;
    	}, "The event is not detected",10000);
    	
    	asyncSpecWait.timeout = 10 * 1000;
  		asyncSpecWait();
    	fs.writeFileSync(fp1, stime);
	}); 
	
});

describe('watch module chainabiliy test', function(){
	
	it('should return THIS on method calls for chainability',function(){
		var test1 = watch.addDir(__dirname+"/tmp");
		expect(test1).toBe(watch);
		var test2 = watch.remDir(__dirname+"/tmp");
		expect(test2).toBe(watch);
		var test3 = watch.onChange(function(file,prev,curr){
			// NOTHING
		});
		expect(test3).toBe(watch);
		var test4 = watch.clearListeners();
		expect(test4).toBe(watch);
	});
	
});
