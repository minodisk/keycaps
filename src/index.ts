import { promises as fs } from "fs";
import { makeBlob } from "@jscad/io-utils";
import { serialize as serializeToJSON } from "@jscad/json-serializer";
import { Geometry } from "@jscad/modeling/src/geometries/types";
import { union } from "@jscad/modeling/src/operations/booleans";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { cube } from "@jscad/modeling/src/primitives";
import { serialize as serializeToSTL } from "@jscad/stl-serializer";

const Blob = makeBlob();

async function main() {
  const junk = "hello";
  const g = union(...translate([3, 3, 3], junk as any, cube(), cube()));

  // const normal = keycap({});
  // const deep = keycap({ topDimple: 2, topThickness: 0.5 });
  // // const keycaps = [];
  // // const gap = 16;
  // // for (let x = 0; x < 6; x++) {
  // //   for (let y = 0; y < 4; y++) {
  // //     keycaps.push(
  // //       translate([gap * x, gap * y, 0], x === 1 && y === 2 ? deep : normal)
  // //     );
  // //   }
  // // }
  // // const g = union(...keycaps);
  // const g = deep;
  return Promise.all([json(g), stl(g)]);
}

async function json(g: Geometry) {
  const [data] = serializeToJSON({}, g);
  await fs.writeFile("out/index.json", data);
}

async function stl(g: Geometry) {
  const data = serializeToSTL({ binary: true }, g);
  const blob = new Blob(data);
  const buf = blob.asBuffer();
  await fs.writeFile("out/index.stl", buf);
}

main();
