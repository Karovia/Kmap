import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { rollup } from 'rollup';
import { Scanner } from '@tailwindcss/oxide';
import { compile, optimize } from '@tailwindcss/node';
import typescript from 'typescript';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const jsEntry = path.join(rootDir, 'src', 'main.tsx');
const cssEntry = path.join(rootDir, 'src', 'index.css');

function contentHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function createCssStubPlugin() {
  return {
    name: 'kmap-css-stub',
    async resolveId(source, importer) {
      if (!source.endsWith('.css')) {
        return null;
      }

      if (!importer) {
        return path.resolve(rootDir, source);
      }

      return path.resolve(path.dirname(importer), source);
    },
    load(id) {
      if (!id.endsWith('.css')) {
        return null;
      }

      return 'export default "";';
    },
  };
}

function createTypescriptPlugin() {
  return {
    name: 'kmap-typescript',
    transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx')) {
        return null;
      }

      const result = typescript.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: typescript.ScriptTarget.ES2020,
          module: typescript.ModuleKind.ESNext,
          moduleResolution: typescript.ModuleResolutionKind.Bundler,
          jsx: typescript.JsxEmit.ReactJSX,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          importHelpers: false,
          sourceMap: false,
          verbatimModuleSyntax: false,
        },
      });

      return {
        code: result.outputText,
        map: null,
      };
    },
  };
}

async function buildCss() {
  const cssSource = await fs.readFile(cssEntry, 'utf8');
  const dependencies = new Set();
  const compiler = await compile(cssSource, {
    base: rootDir,
    from: cssEntry,
    shouldRewriteUrls: false,
    onDependency(filePath) {
      dependencies.add(filePath);
    },
  });

  const sources =
    compiler.root === 'none'
      ? []
      : compiler.root === null
        ? [
            { base: path.join(rootDir, 'src'), pattern: '**/*', negated: false },
            { base: rootDir, pattern: 'index.html', negated: false },
          ]
        : [{ ...compiler.root, negated: false }];

  const scanner = new Scanner({
    sources: [...sources, ...compiler.sources],
  });

  const candidates = scanner.scan();
  const builtCss = compiler.build(candidates);
  return optimize(builtCss, {
    file: cssEntry,
    minify: true,
  }).code;
}

async function buildJs() {
  const bundle = await rollup({
    input: jsEntry,
    treeshake: true,
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      warn(warning);
    },
    plugins: [
      createCssStubPlugin(),
      createTypescriptPlugin(),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY ?? ''),
        },
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.jsx'],
        mainFields: ['browser', 'module', 'jsnext:main', 'main'],
        exportConditions: ['browser', 'import', 'default'],
        dedupe: ['react', 'react-dom', 'react-router-dom'],
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
      }),
      json(),
    ],
  });

  try {
    const { output } = await bundle.generate({
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: false,
    });

    const entryChunk = output.find(
      (item) => item.type === 'chunk' && item.isEntry,
    );

    if (!entryChunk || entryChunk.type !== 'chunk') {
      throw new Error('未生成前端入口脚本');
    }

    return entryChunk.code;
  } finally {
    await bundle.close();
  }
}

async function writeDistFiles(jsCode, cssCode) {
  const jsHash = contentHash(jsCode);
  const cssHash = contentHash(cssCode);
  const jsFileName = `index-${jsHash}.js`;
  const cssFileName = `index-${cssHash}.css`;

  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });

  await fs.writeFile(path.join(assetsDir, jsFileName), jsCode, 'utf8');
  await fs.writeFile(path.join(assetsDir, cssFileName), cssCode, 'utf8');

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kmap</title>
    <link rel="stylesheet" href="./assets/${cssFileName}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${jsFileName}"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8');

  console.log(`已生成 ${normalizePath(path.join('dist', 'assets', jsFileName))}`);
  console.log(`已生成 ${normalizePath(path.join('dist', 'assets', cssFileName))}`);
}

async function main() {
  const [jsCode, cssCode] = await Promise.all([buildJs(), buildCss()]);
  await writeDistFiles(jsCode, cssCode);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
