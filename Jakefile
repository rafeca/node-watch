desc("create docs");
task("doc",function(){
    var spawn = require('child_process').spawn,
        doc = spawn('docco', ['lib/watch/watch.js']);
    
    doc.stdout.on('data', function (data) {
         process.stdout.write(data);
    });
    doc.stderr.on('data', function (data) {
        process.stderr.write( data);
    });
});
desc("run specs");
task("test",function(){
    // Jasmine is cool
    var jasmine = require('./deps/jasmine-node');
    var Path= require('path')
    var specFolder = Path.join(process.cwd(), "spec");

    for (var key in jasmine)
      global[key] = jasmine[key];
    
    var isVerbose = false;
    var showColors = true;
    var extentions = "js";
    jasmine.loadHelpersInFolder(specFolder, new RegExp("[-_]helper\\.(" + extentions + ")$"));
    jasmine.executeSpecsInFolder(specFolder, function(runner, log){
      if (runner.results().failedCount == 0) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    }, isVerbose, showColors, new RegExp(".spec\\.(" + extentions + ")$", 'i'));
});
desc("Autorun specs");
task('autotest',function(){
    console.log('Quit autotest with CTRL - C');
    var watch = require('./deps/watch/watch.js'),
        spawn = require('child_process').spawn,
        busy = false,
        test = null;
        
    watch.addDir("./spec").addDir("./lib/watch").onChange(function(file){
        if(!busy){
            busy = true;
            test    = spawn('jake', ['test']);
            test.stdout.on('data', function (data) {
                process.stdout.write(data);
            });
            
            test.stderr.on('data', function (data) {
                process.stderr.write( data);
            });
            test.on('exit', function (code) {
              // Clear test (possible memory leak?)
              test.stdout.removeAllListeners("data");
              test.stderr.removeAllListeners("date");
              test.removeAllListeners("exit");
              test = null;
              busy = false;
            });
        }
    });
    

});