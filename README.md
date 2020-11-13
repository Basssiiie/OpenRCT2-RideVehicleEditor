# 🎢 openrct2-typescript-mod-template
![GitHub](https://img.shields.io/github/license/wisnia74/openrct2-typescript-mod-template) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/wisnia74/openrct2-typescript-mod-template) [![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)

Template repository for OpenRCT2 mods written in TypeScript.

## Table of contents
  * [About](#about)
  * [Installation](#installation)
  * [Usage](#usage)
     * [How it works](#how-it-works)
     * [npm scripts](#npm-scripts)
  * [Releasing your mod](#releasing-your-mod)
  * [Notes](#notes)
  * [Useful links](#useful-links)

## About

This repository was created to serve as a template TypeScript mod repository for OpenRCT2.

I wanted to leverage [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) to make it even more painless to write and debug mods in real time.

This template repository comes with [Nodemon](https://nodemon.io/), [ESLint](https://eslint.org/) and [TypeScript](https://www.typescriptlang.org/) on board.

The idea was to use Nodemon to start a local server that will be watching your mod files, then on each save make it build `.ts` files to ES5 `.js` files, place them inside OpenRCT2 `plugin` directory, and let hot reload feature do the rest (i.e. reload the mod in-game).

## Installation

1. Install latest versions of [Node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm)
2. [Create your own repository using this one as a template](https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) and clone it anywhere to your PC
3. `cd` into it and run `npm install`
4. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:\Users\<USER>\Documents\OpenRCT2\bin` or `C:\Program Files\OpenRCT2\openrct2.d.ts`)
    - alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2. To do this on Windows:
      - run command prompt as administrator
      - `cd` into your repo (wherever you cloned it)
      - run `mklink .\lib\openrct2.d.ts <path to openrct2.d.ts>`  
5. Edit `./config.json`:
    - `modName` - will be used in `./src/registerPlugin.ts`, `./rollup.config.dev.js` and `./rollup.config.prod.js`
    - `modURL` - will be used in `./src/registerPlugin.ts` and `package.json`
      - use the URL created as a result of step 2 (link to your mod repo) - it should look like `https://github.com/<author>/<repository>`
    - `pathToOpenRCT2` - will be used in `./rollup.config.dev.js`
      - make sure this path uses `/` instead of `\`
      - this path is the one that holds the `plugin` folder, not the installation path
      - typically `C:\Users\<USER>\Documents\OpenRCT2`
6. Run `npm run init` - it will replace all the data and then commit the results
7. You can start modding :)

Of course it's a template, so you can edit anything you like.

If you want to alter plugin data, refer to [OpenRCT2 scripting guide](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md).

## Usage

1. Make sure you've enabled [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`
2. `cd` into repo
3. run `npm start` (this will place compiled and minified mod inside `PATH_TO_OPENRCT2/plugin/` directory)
4. Open `./src/main.ts` in your code editor
5. [Start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load save/start new game
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled file inside `PATH_TO_OPENRCT2/plugin/` directory as `MOD_NAME.js`
7. OpenRCT2 will notice file changes and it will reload the mods

### How it works

Your mod files live in `./src/` directory. That's the ones you will be writing code in.
Upon starting Nodemon server, it will start watching changes you make to files in `./src/`, and it will build them accordingly.

The entry point is `./src/registerPlugin.ts`. Any file, class, module you create in `./src/` needs to be imported to `registerPlugin.ts` one way or another.

Template uses [Terser](https://github.com/terser/terser) to minify your output mod bundle file and to resolve any dependencies.

### npm scripts

|script|function|
|--|--|
|`npm start`|starts Nodemon server that will be watching `./src/` directory for any changes you make to any files inside it|
|`npm run lint`|lints your `.ts` and `.js` files from `./src/` directory|
|`npm run build:dev`|compiles `registerPlugin.ts` and minifies it, then places it inside `PATH_TO_OPENRCT2/plugin/` as `MOD_NAME.js`|
|`npm run build`|runs `npm run lint` and if no linting errors are found, compiles `registerPlugin.ts` and minifies it, then places it inside `./dist/` folder as `MOD_NAME.js` - this is your final mod file|

## Releasing your mod

After running `npm run build` locally, `./dist/` directory will be created that will contain `MOD_NAME.js`.
It's up to you, if you want to edit `.gitignore` to actually include `./dist/` contents and push them to your remote or if you want to manually copy the contents of `./dist/` and publish them somewhere. However creating a GitHub release using contents of `./dist/` directory sounds like a cool idea. You would have your mod file available for download straight from the repo.
Don't forget to update `README.md` to reflect your mod and update version numbers for future releases.

## Notes

If you've added a new mod folder to `plugin`, and the OpenRCT2 didn't seem like it registered it (and you had a running park), just load the save/start a new park, so OpenRCT2 loads the mods again. Now when you overwrite them during development, there shouldn't be any problems with hot reload noticing file changes.

Don't touch `app.js`, even though it's just an empty file. Its existence makes Nodemon happy, and Nodemon is what does the watches your files for changes & fires off new dev builds for hot reloading.

Nodemon will watch all the files in `./src/` directory. You can also freely create classes, modules, import them in your mod files.
Sky's the limit :)

## Useful links

- [OpenRCT2 website](https://openrct2.io/)
- [OpenRCT2 on GitHub](https://github.com/OpenRCT2)
- [OpenRCT2 on Reddit](https://www.reddit.com/r/openrct2)
- [OpenRCT2 plugins website](https://openrct2plugins.org/)
- [OpenRCT2 example plugins repository](https://github.com/OpenRCT2/plugin-samples)
- [OpenRCT2 scripting guide](https://github.com/OpenRCT2/OpenRCT2/blob/develop/distribution/scripting.md)
- [OpenRCT2 hot reload feature presentation](https://www.youtube.com/watch?v=jmjWzEhmDjk)
