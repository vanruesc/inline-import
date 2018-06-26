import test from "ava";
import fs from "fs";
import InlineImport from "../build/inline-import.js";

const options = {
	extensions: {
		".frag": "utf8",
		".vert": "utf8",
		".png": "base64"
	}
};

const EOL = /(?:\\r\\n|\\r|\\n)/g;

test("basic inlining and filtering", t => {

	t.plan(1);

	InlineImport.transform("test/inline/a/index.js", options).then(() => {

		const actual = fs.readFile("test/inline/a/index.js").replace(EOL, "");
		const expected = fs.readFile("test/expected/a");

		t.is(actual, expected);

	}).catch((error) => t.fail(error));

});

test("ignores unrelated imports", t => {

	t.plan(1);

	InlineImport.transform("test/inline/b/index.js", options).then(() => {

		const actual = fs.readFile("test/inline/b/index.js").replace(EOL, "");
		const expected = fs.readFile("test/expected/b");

		test.is(actual, expected);

	}).catch((error) => t.fail(error));

});

test("inlines image files", t => {

	t.plan(1);

	InlineImport.transform("test/inline/c/index.js", options).then(() => {

		const actual = fs.readFile("test/inline/c/index.js").replace(EOL, "");
		const expected = fs.readFile("test/expected/c");

		test.is(actual, expected);

	}).catch((error) => t.fail(error));

});
