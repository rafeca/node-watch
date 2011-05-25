About deps
==========


Jasmin Node testting framework
-----------

<http://pivotal.github.com/jasmine/>
<https://github.com/pivotal/jasmine/wiki>


expect(x).toEqual(y); compares objects or primitives x and y and passes if they are equivalent
expect(x).toBe(y); compares objects or primitives x and y and passes if they are the same object
expect(x).toMatch(pattern); compares x to string or regular expression pattern and passes if they match
expect(x).toBeDefined(); passes if x is not undefined
expect(x).toBeNull(); passes if x is null
expect(x).toBeTruthy(); passes if x evaluates to true
expect(x).toBeFalsy(); passes if x evaluates to false
expect(x).toContain(y); passes if array or string x contains y
expect(x).toBeLessThan(y); passes if x is less than y
expect(x).toBeGreaterThan(y); passes if x is greater than y
expect(fn).toThrow(e); passes if function fn throws exception e when executed

Every matcher's criteria can be inverted by prepending .not:

expect(x).not.toEqual(y); compares objects or primitives x and y and passes if they are not equivalent

Watch
--------------------
Watch for a file change based on mtime.
This utility is handy for automatic testing in combination with a testing frame-work
Makes it pos

usage:
<code>
var watch = require('./deps/watch/watch.js');

// Adding 2 dirs relative from process.cwd()
// Nested dirs are not watched
watch.addDir("./spec").addDir("./lib/watch").onChange(function(file,prev,curr){
		console.log(file);
		console.log(prev.mtime);
		console.log(curr,mtime);
});

// Clear (remove) the listeners

watch.clearListeners();

// Remove dirs to watch
watch.remdDir("./spec").remdDir("./lib/watch");

</code>