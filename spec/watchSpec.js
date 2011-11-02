// File: ./spec/watchSpec.js
/*
TODO:
make the test faster by mocking the async callbacks

dev_mod is set in the JakeFile either src or lib
*/
var fs = require("fs"); 
var watch = require("../"+dev_mode+"/watch/watch.js"); 
// 
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
  		
  		watch.add(fp1).on("change",function(file,prev,curr){
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
  		    		watch.remove(fp1);
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
		expect(typeof watch.add).toEqual("function");
		// This dir does not excists (relative form process.cwd())
		expect(function(){watch.add("./no_dirs")}).toThrow();
		// This should be allright
		expect(function(){watch.add(__dirname+"/tmp")}).not.toThrow();
		
		// Add a second dir (the same) which sould not be added
		expect(function(){watch.add(__dirname+"/tmp")}).not.toThrow();
		
	}); 
	it('should be possible to remove dirs to watch', function(){
		expect(typeof watch.remove).toEqual("function");
		// Remove a non - excisting dir
		expect(function(){watch.remove("./no_dirs")}).toThrow();
		expect(function(){watch.remove(__dirname+"/tmp")}).not.toThrow();
	}); 
	
	it('should emit a change on a watched dir', function(){
		var event_detected = false, 
			fp1 = __dirname+"/tmp/file1.txt",
			stime = new Date().toUTCString(),
			changed_file = "",
  			counter = 0;
  			
		expect(function(){watch.onChange({})}).toThrow();	
		watch.add(__dirname+"/tmp").onChange(function(file,prev,curr){
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
					watch.remove(__dirname+"/tmp");
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
	
	it('should emit a change on a watched dir when a new file is created', function(){
		var folder = __dirname + "/tmp",
			stime = new Date().toUTCString(),
			fp1 = folder + "/new_file1.txt";
  			
		expect(function(){watch.onChange({})}).toThrow();	
		watch.add(folder).onChange(function(file,prev,curr){
			expect(file).toBe(folder);
  		
			watch.remove(folder);
			watch.clearListeners();
			expect(watch.listeners("change").length).toBe(0);
			fs.unlinkSync(fp1);
			asyncSpecDone();
		});
		fs.writeFileSync(fp1, stime);
  		    	
		asyncSpecWait.timeout = 10 * 1000;
		asyncSpecWait();
	});
	
	it('should emit a change when a newly created file is modified on a watched dir', function(){
		var folder = __dirname + "/tmp",
			stime = new Date().toUTCString(),
			fp1 = folder + "/new_file2.txt",
			fileCreated = false;

		expect(function(){watch.onChange({})}).toThrow();
		watch.add(folder).onChange(function(file,prev,curr){
			if (fileCreated === false) {
				fileCreated = true;
				expect(file).toBe(folder);

				// modify the created file
				fs.writeFileSync(fp1, stime + " - " + stime);
			} else {
				expect(file).toBe(fp1);

				watch.clearListeners();
				watch.remove(folder);
				expect(watch.listeners("change").length).toBe(0);

				fs.unlinkSync(fp1);
				asyncSpecDone();
			}
		});

		fs.writeFileSync(fp1, stime);

		asyncSpecWait.timeout = 20 * 1000;
		asyncSpecWait();
	});

	it('should emit a change when a file is removed from a folder', function(){
		var folder = __dirname + "/tmp",
			stime = new Date().toUTCString(),
			fp1 = folder + "/new_file3.txt",
			fileCreated = false;

		fs.writeFileSync(fp1, stime);

		expect(function(){watch.onChange({})}).toThrow();
		watch.add(folder).onChange(function(file,prev,curr){

			expect(file).toBe(folder);

			watch.clearListeners();
			watch.remove(folder);
			expect(watch.listeners("change").length).toBe(0);

            asyncSpecDone();
		});

		fs.unlinkSync(fp1);

		asyncSpecWait.timeout = 10 * 1000;
		asyncSpecWait();
	});


	describe('Non-recursive watching', function(){

		it('should not watch recursively by default', function(){
			var folder = __dirname + "/tmp",
			    stime = new Date().toUTCString(),
			    fp1 = folder + "/nested_folder/file1.txt",
			    changeHandlerCalled = false;

			expect(function() {watch.onChange({})}).toThrow();
			watch.add(folder).onChange(function(file, prev, curr) {
				changeHandlerCalled = true;
			});
			fs.writeFileSync(fp1, stime);

			waits(10*1000);

			runs(function () {
				expect(changeHandlerCalled).toEqual(false);
				watch.clearListeners();
				watch.remove(folder);
				expect(watch.listeners("change").length).toBe(0);
			});
		});

		it('should not emit changes in a file from a newly created subfolder', function(){
			var folder = __dirname + "/tmp",
				stime = new Date().toUTCString(),
				createdFolder = folder + "/new_nested_dir"
				fp1 = createdFolder + "/new_file2.txt",
				fileCreated = false,
				changeHandlerCalled = false;

			expect(function(){watch.onChange({})}).toThrow();
			watch.add(folder).onChange(function(file,prev,curr){
				if (fileCreated === false) {
					fileCreated = true;
					expect(file).toBe(folder);

					// Create a new file file
					fs.writeFileSync(fp1, stime);
				} else {
					changeHandlerCalled = true;
				}
			});

			fs.mkdirSync(createdFolder, "0755");

			waits(20*1000);

			runs(function () {
				expect(changeHandlerCalled).toEqual(false);

				watch.clearListeners();
				watch.remove(folder);
				expect(watch.listeners("change").length).toBe(0);

				fs.unlinkSync(fp1);
				fs.rmdirSync(createdFolder);
			});
		});
	});

	describe('Recursive watching', function(){

		it('should emit a change when a file is changed inside a subfolder', function(){
			var folder = __dirname + "/tmp",
				stime = new Date().toUTCString(),
				fp1 = folder + "/nested_folder/file1.txt";

			expect(function() {watch.onChange({})}).toThrow();
			watch.add(folder, true).onChange(function(file, prev, curr) {
				expect(file).toBe(fp1);
				watch.clearListeners();
				watch.remove(folder, true);
				expect(watch.listeners("change").length).toBe(0);
				asyncSpecDone();
			});
			fs.writeFileSync(fp1, stime);

			asyncSpecWait.timeout = 20 * 1000;
			asyncSpecWait();
		});

		it('should emit a change when a file is changed in a newly created subfolder', function(){
			var folder = __dirname + "/tmp",
				stime = new Date().toUTCString(),
				createdFolder = folder + "/new_nested_dir"
				fp1 = createdFolder + "/new_file2.txt",
				fileCreated = false;

			expect(function(){watch.onChange({})}).toThrow();
			watch.add(folder, true).onChange(function(file,prev,curr){
				if (fileCreated === false) {
                    fileCreated = true;
                    expect(file).toBe(folder);

					// Create a new file file
					fs.writeFileSync(fp1, stime);
				} else {
					expect(file).toBe(createdFolder);
					watch.clearListeners();
					watch.remove(folder, true);
					expect(watch.listeners("change").length).toBe(0);

					fs.unlinkSync(fp1);
					fs.rmdirSync(createdFolder);
					asyncSpecDone();
				}
			});

			fs.mkdirSync(createdFolder, "0755");

			asyncSpecWait.timeout = 20 * 1000;
			asyncSpecWait();
		});
	});
});

describe('watch module chainabiliy test', function(){
	
	it('should return THIS on method calls for chainability',function(){
		var test1 = watch.add(__dirname+"/tmp");
		expect(test1).toBe(watch);
		var test2 = watch.remove(__dirname+"/tmp");
		expect(test2).toBe(watch);
		var test3 = watch.onChange(function(file,prev,curr){
			// NOTHING
		});
		expect(test3).toBe(watch);
		var test4 = watch.clearListeners();
		expect(test4).toBe(watch);
	});
	
});

describe("watch module add , remove relative file", function() {
    it("should add relative files to", function() {
        var fp1 = "./tmp/file2.txt", fpa = __dirname + "/tmp/file2.txt", 
        stime = (new Date).toUTCString(), event_detected = false, 
        changed_file = "", changed_prev = "", changed_curr = "", counter = 0;
        
        expect(function() {
            watch.add(fp1);
        }).toThrow();
        expect(function() {
            watch.remove(fp1);
        }).toThrow();
        fp1 = "./spec/tmp/file2.txt";
        var tst = watch.add(fp1);
        expect(tst).toBe(watch);
        expect(watch.listeners("change").length).toBe(0);
        watch.on("change", function(file, prev, curr) {
            counter++;
            changed_file = file;
            changed_prev = prev;
            changed_curr = curr;
            event_detected = true;
        });
        expect(watch.listeners("change").length).toBe(1);
        waitsFor(function() {
            if (event_detected) {
                if (counter > 0) {
                    asyncSpecDone();
                    expect(event_detected).toBe(true);
                    expect(changed_prev.mtime.getTime()).not.toEqual(changed_curr.mtime.getTime());
                    watch.removeAllListeners("change");
                    watch.remove(fp1);
                    expect(watch.listeners("change").length).toBe(0);
                    return true;
                }
            }
            return false;
        }, "The event is not detected", 2e4);
        asyncSpecWait.timeout = 10 * 1e3;
        asyncSpecWait();
        fs.writeFileSync(fpa, stime);
    });
});
