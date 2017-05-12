import { x } from "alphabet";
import ignore from "./ignore.html";
import fs from "fs";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

export default function test() {

	console.log(x, ignore, fs, fragment, vertex);

}
