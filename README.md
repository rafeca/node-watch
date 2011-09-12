# node-watch

Simple utility for nodejs to watch file changes
a file change is a file whom's mtime is changed

This utility is handy for e.g. automatic testing in combination with a testing frame-work,
An example lives within the JakeFile (jake and docco required)

    run: jake autotest

and make changes in the src/watch/watch.js file or the spec/watchSpec.js file and see te specs running automaticly

## Install:



     npm install nodewatch
     
(Use the "-g" global switch for installing nodewatch global)

## Usage:


     var watch = require('nodewatch');
     // Adding 2 dirs relative from process.cwd()
     // Nested dirs are not watched
     // dirs can also be added absolute
     watch.add("./spec").add("./lib/watch").onChange(function(file,prev,curr){
        console.log(file);
        console.log(prev.mtime.getTime());
        console.log(curr.mtime.getTime());
     });
     
     // Clear (remove) the listeners
     watch.clearListeners();
     
     // Remove dirs to watch
     watch.remove("./spec").remdDir("./lib/watch");
 

## Methods:


     // Add a dir or file relative from process.cwd()
     watch.add("./spec");
     // or
     watch.add("../spec");
     // or
     watch.add("../path/to/my/file.js")
     // Add a dir absolute
     watch.add("/absolute/path");
     
     // Set a listener
     // It will provide a file (filename as string), prev and curr stats objects
     watch.onChange(function(file,prev,curr){
            console.log(file);
            console.log(prev.mtime.getTime());
            console.log(curr.mtime.getTime());
      });
     
     // Remove a dir or file (absolute or relative)
     watch.remove("./spec");
     
     // Clear the listener(s) attached via onChange();
     watch.clearListeners();



