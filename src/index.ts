import { Plugin } from 'vite';
import { transformSync, NodePath } from '@babel/core';
import { ParserPlugin } from '@babel/parser';
import { ImportDeclaration } from '@babel/types';
import * as fs from 'fs';

function autoCSSModulePlugin() {
  return () => {
    return {
      visitor: {
        ImportDeclaration: (path: NodePath<ImportDeclaration>) => {
          const { node } = path;
          if (!node) {
            return;
          }
          if (
            node.specifiers &&
            node.specifiers.length > 0 &&
            /\.(css|less|sass|scss|styl|stylus|postcss)($|\?)/.test(
              node.source.value
            )
          ) {
            const cssFile = node.source.value;
            node.source.value =
              cssFile +
              (cssFile.indexOf('?') > -1 ? '&' : '?') +
              '.module.styl';
          }
        },
      },
    };
  };
}

function transform(
  code: string,
  { sourceMap, file }
): { code: string; map?: any } {
  const parsePlugins: ParserPlugin[] = ['jsx'];
  if (/\.tsx?$/.test(file)) {
    parsePlugins.push('typescript');
  }
  const result = transformSync(code, {
    configFile: false,
    parserOpts: {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
      plugins: parsePlugins,
    },
    sourceMaps: true,
    sourceFileName: file,
    inputSourceMap: sourceMap,
    plugins: [autoCSSModulePlugin()],
  });

  return {
    code: result.code,
    map: result.map,
  };
}

export default function viteAutoCSSModulesPlugin(): Plugin {
  const name = 'vite-plugin-auto-css-modules';
  return {
    name,
    transform(code, id) {
      if (
        /\.(js|mjs|ts|jsx|tsx)/.test(id) &&
        /import\s+([\S]+)\s+from\s+('|")([\S]+)\.(css|less|sass|scss|styl|stylus|postcss)(\?[\S]*)?('|")/.test(
          code
        )
      ) {
        const result = transform(code, {
          file: id,
          sourceMap: this.getCombinedSourcemap(),
        });
        if (result) {
          return result;
        }
      }
      return undefined;
    },
    load(id) {
      if (/(\?|&)\.module\.styl$/.test(id)) {
        return new Promise((resolve, reject) => {
          fs.readFile(id.split('?')[0], 'utf-8', (err, contents) => {
            if (err) {
              reject(err);
            } else {
              resolve(contents);
            }
          });
        });
      }
    },
  };
}
