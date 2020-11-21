# RideVehicleEditor plugin for OpenRCT2

This plugin lets you edit vehicles on any ride in your park on the fly.

### Current features
- Select and switch through all ride vehicles in your park.
- Change the vehicle type for each vehicle independently.
- Switch through different variants of the same ride type. (E.g. locomotive, tender or passenger car.)

### Planned features
- Adjust spacing between different vehicles on the same train.
- Adjust properties like mass, number of seats, (powered) acceleration of each vehicle.

This project is based on [wisnia74's Typescript modding template](https://github.com/wisnia74/openrct2-typescript-mod-template) and uses [Nodemon](https://nodemon.io/), [ESLint](https://eslint.org/) and [TypeScript](https://www.typescriptlang.org/) from this template.

## Installation

1. Download the latest release from the [Releases page](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor/releases).
2. To install it, put the downloaded `*.js` file into your `\OpenRCT2\plugin` folder. 
    - This folder is commonly found in `C:\Users\<USER>\Documents\OpenRCT2\bin` or `C:\Program Files\OpenRCT2\openrct2.d.ts`. 
3. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

---

## Building the source code

1. Install latest versions of [Node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm).
2. Clone it anywhere to your PC.
3. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
4. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:\Users\<USER>\Documents\OpenRCT2\bin` or `C:\Program Files\OpenRCT2\openrct2.d.ts`).
    - Alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2. To do this on Windows:
      - Run command prompt as administrator.
      - `cd` into the root folder of the repository.
      - Run `mklink .\lib\openrct2.d.ts <path to openrct2.d.ts>`.
5. Run `npm build` (release build) or `npm build:dev` (develop build) to build the project.
    - The default output folder is `(project directory)\dist` and can be changed in `rollup.config.prod.js` and `rollup.config.dev.js` respectively.

### Hot reload

This project supports the [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) for development.

1. Make sure you've enabled it by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`.
2. Open `rollup.config.dev.js` and change the output file path to your plugin folder. 
    - Example: `C:/(user)/Documents/OpenRCT2/plugin/RideVehicleEditor.js`.
    - Make sure this path uses `/` instead of `\` slashes!
3. Open command prompt and use `cd` to change your current directory to the root folder of this project.
4. Run `npm start` to start the hot reload server.
5. [Start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load a save or start new game.
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled plugin file inside your local OpenRCT2 plugin directory.
7. OpenRCT2 will notice file changes and it will reload the plugin.

## Notes

Don't touch `app.js`, even though it's just an empty file. Its existence makes Nodemon happy, and Nodemon is what does the watches your files for changes & fires off new dev builds for hot reloading.

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this mod and readme.
