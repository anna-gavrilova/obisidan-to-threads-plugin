import esbuild from "esbuild";
import process from "node:process";

const isDev = process.argv[2] === "dev";

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  target: "es2020",
  outfile: "main.js",
  external: ["obsidian"],
  sourcemap: isDev,
  minify: !isDev,
});

console.log(isDev ? "Dev build done" : "Production build done");
