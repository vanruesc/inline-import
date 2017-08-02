# Inline Import

[![Build status](https://travis-ci.org/vanruesc/inline-import.svg?branch=master)](https://travis-ci.org/vanruesc/inline-import)
[![npm version](https://badge.fury.io/js/inline-import.svg)](https://badge.fury.io/js/inline-import)
[![Dependencies](https://david-dm.org/vanruesc/inline-import.svg?branch=master)](https://david-dm.org/vanruesc/inline-import)

A tool that inlines custom file imports.


## Use Case

Instead of loading external files during runtime, you may wish to integrate the 
raw file contents directly into your JavaScript files during build time. This
can be achieved using the native ```import``` syntax:

```javascript
import data from "./data.png";
```

The type of the external file is irrelevant. You only need to specify a
preferred encoding for each file type.


## Installation

```sh
npm install inline-import
``` 


## Usage

The inlining process is __destructive__. Affected files will be changed __permanently__.  
To inline your file imports, you need to specify the path to the JavaScript 
file that should be modified. Additionally, you need to define the 
```extensions``` of the relevant import statements.

##### text.txt

```
hello world
```

##### index.js

```javascript
import stuff from "garage";
import text from "./text.txt";
```

##### inline.js

```javascript
import InlineImport from "inline-import";

InlineImport.transform("index.js", {

	extensions: {
		".txt": "utf8"
	}

}, function done(error) {});
```

##### index.js (inlined)

```javascript
import stuff from "garage";
const text = "hello world";
```


## Options

- You may define a specific ```encoding``` for the JavaScript files that should be processed. 
Use one of the possible encoding values specified in node's [Buffer](https://github.com/nodejs/node/blob/master/lib/buffer.js) class. 
The default encoding is _utf8_.
- Only imports with matching file ```extensions``` will be considered. Each extension must define its own encoding.
- If, for some reason, you don't want to use the _const_ statement, set ```useVar``` to _true_.  

```javascript
InlineImport.transform(file, {
	encoding: "utf8",
	useVar: true,
	extensions: {
		".html": "utf8",
		".png": "base64"
	}
});
```


## Build Tools

 - [Inline Import Grunt plugin](https://github.com/vanruesc/grunt-inline-import)


## Contributing

Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
