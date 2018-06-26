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

	return InlineImport.transform("test/inline/a/index.js", options).then(() => {

		const actual = fs.readFileSync("test/inline/a/index.js", "utf8").replace(EOL, "");
		const expected = fs.readFileSync("test/expected/a", "utf8");

		t.is(actual, expected);

	});

});

test("ignores unrelated imports", t => {

	return InlineImport.transform("test/inline/b/index.js", options).then(() => {

		const actual = fs.readFileSync("test/inline/b/index.js", "utf8").replace(EOL, "");
		const expected = fs.readFileSync("test/expected/b", "utf8");

		t.is(actual, expected);

	});

});

test("inlines image files", t => {

	return InlineImport.transform("test/inline/c/index.js", options).then(() => {

		const actual = fs.readFileSync("test/inline/c/index.js", "utf8").replace(EOL, "");
		const expected = fs.readFileSync("test/expected/c", "utf8");

		t.is(actual, expected);

	});

});
