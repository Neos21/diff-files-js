#!/usr/bin/env node
// $ node ./diff-files.js '/PATH/TO/SRC' '/PATH/TO/DST'

const fs   = require('node:fs');
const path = require('node:path');

const srcDirectoryPath = process.argv[2];
const dstDirectoryPath = process.argv[3];

const listFiles = targetDirectoryPath => fs.readdirSync(targetDirectoryPath, { withFileTypes: true }).flatMap(dirent => {
  const name = path.join(targetDirectoryPath, dirent.name);
  return dirent.isFile() ? [name] : listFiles(name);
});

const readText = (message = 'OK?') => {
  process.stdout.write(`${message} > `);
  process.stdin.resume();
  return new Promise(resolve => process.stdin.once('data', resolve)).finally(() => process.stdin.pause()).then(text => text.toString().trim());
};

(async () => {
  console.log(`* ${srcDirectoryPath}`);
  console.log(`* ${dstDirectoryPath}`);
  if(srcDirectoryPath == null || dstDirectoryPath == null) return console.log('ディレクトリを指定してください');
  if(await readText('チェックしますか？ (y/n)') !== 'y') return console.log('中止します');
  console.log('開始\n');
  
  const srcFiles = listFiles(srcDirectoryPath)
    .map(directoryPath => directoryPath.replace(`${srcDirectoryPath}${path.sep}`, ''))
    .sort();
  const dstFiles = listFiles(dstDirectoryPath)
    .map(directoryPath => directoryPath.replace(`${dstDirectoryPath}${path.sep}`, ''))
    .sort();
  
  const srcOnlyFiles = srcFiles.filter(srcFile => !dstFiles.includes(srcFile));
  const dstOnlyFiles = dstFiles.filter(dstFile => !srcFiles.includes(dstFile));
  console.log(`Src [${srcDirectoryPath}] にのみ存在し Dst [${dstDirectoryPath}] に存在しないファイル :`);
  console.log(srcOnlyFiles.length === 0 ? '差分なし' : srcOnlyFiles);
  console.log('');
  console.log(`Dst [${dstDirectoryPath}] にのみ存在し Src [${srcDirectoryPath}] に存在しないファイル :`);
  console.log(dstOnlyFiles.length === 0 ? '差分なし' : dstOnlyFiles);
  
  console.log('\n終了');
})();
