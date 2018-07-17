# Inline Import

[![Build status](https://travis-ci.org/vanruesc/inline-import.svg?branch=master)](https://travis-ci.org/vanruesc/inline-import)
[![npm version](https://badge.fury.io/js/inline-import.svg)](https://badge.fury.io/js/inline-import)
[![Dependencies](https://david-dm.org/vanruesc/inline-import.svg?branch=master)](https://david-dm.org/vanruesc/inline-import)

A tool that inlines custom file imports.


## Use Case

Instead of loading external files during runtime, you may wish to integrate the raw file contents directly into your
JavaScript files during build time. This tool allows you to use the native ```import``` syntax to include any data:

```javascript
import data from "./data.png";
```

The type of the imported file can be anything. You only need to specify a preferred encoding for each file type.


## Installation

```sh
npm install inline-import
``` 


## Usage

### Command Line Interface (CLI)

The command line tool can be invoked using the `inline-import` command. It requires a configuration in which the
source paths and the [options](#options) are specified. You can decide whether you want to provide the configuration
via `package.json` or as a standalone file. 

If there is no configuration in `package.json`, the tool will look for a configuration file with the
default name `.inline-import.json` in the current working directory.

```sh
inline-import -c config/inline-import.json
```

Affected files will automatically be copied into a backup directory before they are modified.
You can restore the original files by using the `--restore` option.

| Option    | Shorthand | Description                               |
|-----------|-----------|-------------------------------------------|
| --config  | -c        | Specifies an alternative config path      |
| --backup  | -b        | Only copies files into a backup directory |
| --restore | -r        | Restores files from the backup directory  |


### JavaScript API

The immediate inlining process is __destructive__. Affected files will be changed __permanently__.  
To inline your file imports, you need to specify the path to the JavaScript 
file that should be modified. Additionally, you need to define the 
```extensions``` of the relevant import statements.

#### text.txt

```
hello world
```

#### index.js

```javascript
import component from "module";
import text from "./text.txt";
```

#### inline.js

```javascript
import InlineImport from "inline-import";

InlineImport.transform("index.js", {

	extensions: {
		".txt": "utf8"
	}

}).then(modified => {

	console.log(modified ? "Success!" : "Nothing changed");

}).catch(console.error);
```

#### index.js (inlined)

```javascript
import component from "module";
const text = "hello world";
```


## Options

- Command line exclusive:
  - You must specify a source path or a list of paths under `src`. Glob patterns are supported.
  - An alternative `backup` path may be specified. The default path is _.backup_.
- You may define a specific `encoding` for the JavaScript files that will be processed. 
Use one of the possible encoding values specified in node's [Buffer](https://github.com/nodejs/node/blob/master/lib/buffer.js) class. 
The default encoding is _utf8_.
- Only imports with matching file `extensions` will be considered. Each extension must define its own encoding.
- If, for some reason, you don't want to use the _const_ statement, set `useVar` to _true_.  

#### .inline-import.json

```javascript
{
	"src": ["src/**/*.js"],
	"backup": "path/to/backup",
	"encoding": "utf8",
	"useVar": true,
	"extensions": {
		".html": "utf8",
		".png": "base64"
	}
}
```

#### package.json

```javascript
{
	"inlineImport": {
		"src": "src/**/*.js",
		"extensions": {}
	}
}
```

#### inline.js

```javascript
InlineImport.transform(filePath, {
	encoding: "utf8",
	useVar: true,
	extensions: {}
}).catch(e => console.error(e));
```


## Build Tool Integration

 - [Inline Import Grunt plugin](https://github.com/vanruesc/grunt-inline-import)


## Contributing

Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
