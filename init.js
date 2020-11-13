const { readFileSync, writeFileSync, unlinkSync, rmdirSync } = require('fs');
const { execSync } = require('child_process');

const removeFile = (path) => unlinkSync(path);
const removeEmptyFolder = (path) => rmdirSync(path);
const readJSON = (path) => JSON.parse(readFileSync(path));
const saveFile = (path, data) => {
  let content;

  if (data instanceof Object) {
    content = JSON.stringify(data, undefined, 2);
  } else {
    content = data;
  }

  writeFileSync(path, content);
};

const { modName, modUrl, pathToOpenRCT2 } = readJSON('./config.json');
const [cleanModUrl, modAuthor, repoName] = modUrl.match(/github.com\/([^/]+)\/([^/]+)/);

const paths = [
  './.github/dependabot.yml',
  './.github/ISSUE_TEMPLATE/bug_report.md',
  './.github/ISSUE_TEMPLATE/feature_request.md',
  './LICENSE',
  './rollup.config.dev.js',
  './rollup.config.prod.js',
  './src/registerPlugin.ts',
];

const modNameRegex = /MOD_NAME/g;
const modAuthorRegex = /MOD_AUTHOR/g;
const templateAuthorRegex = /wisnia74(?!\/)/g;
const gamePathRegex = /PATH_TO_OPENRCT2/g;

for (let x = 0; x < paths.length; x += 1) {
  const path = paths[x];
  const content = readFileSync(path).toString();

  const replacedContent = content
    .replace(modNameRegex, modName)
    .replace(modAuthorRegex, modAuthor)
    .replace(templateAuthorRegex, modAuthor)
    .replace(gamePathRegex, pathToOpenRCT2);

  saveFile(path, replacedContent);
}

const packageJsonContent = readJSON('./package.json');
delete packageJsonContent.scripts.init;
packageJsonContent.author = modAuthor;
packageJsonContent.name = repoName;
packageJsonContent.homepage = `https://${cleanModUrl}#readme`;
packageJsonContent.bugs.url = `https://${cleanModUrl}/issues`;
packageJsonContent.repository.url = `git+https://${cleanModUrl}.git`;
saveFile('./package.json', packageJsonContent);

removeFile('./config.json');
removeFile('./init.js');

execSync('git add .');
execSync('git commit -m "init script"');
