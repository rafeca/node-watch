desc("create build file");
task("build",["test_integration","doc"],function(){
    var fs = require("fs");
    var jsp = require("./deps/uglify-js/uglify-js.js").parser;
    var pro = require("./deps/uglify-js/uglify-js.js").uglify;
    var orig_code = fs.readFileSync(process.cwd()+"/src/watch/watch.js").toString();
    var ast = jsp.parse(orig_code); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    // ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var options = {};
    options.beautify = true;
    var final_code = pro.gen_code(ast,options); // compressed code here
    var fd = fs.openSync(process.cwd()+"/lib/watch/watch.js","w");
    fs.writeSync(fd, final_code);
   console.log('Build done');
   console.log('Test integration');
});


desc("create docs");
task("doc",function(){
    var spawn = require('child_process').spawn,
        doc = spawn('docco', ['src/watch/watch.js']);
    
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
    
    jasmine.dev_mode = "src";
    
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

desc("run specs for integration");
task("test_integration",function(){
    // Jasmine is cool
    var jasmine = require('./deps/jasmine-node');
    
    jasmine.dev_mode = "lib";
    
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
        
    watch.addDir("./spec").addDir("./src/watch").onChange(function(file){
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