import * as fs from "fs";
import * as path from "path";

export function readdirRecursiveSync(dir: string, dirs: string[] = []): string[] {
  const files: string[] = [];
  fs.readdirSync(path.join(dir, ...dirs)).forEach(file => {
    if (fs.lstatSync(path.join(dir, ...dirs, file)).isDirectory()) {
      files.push(...readdirRecursiveSync(dir, [...dirs, file]));
    } else {
      files.push([...dirs, file].join("/"));
    }
  });

  return files;
}
