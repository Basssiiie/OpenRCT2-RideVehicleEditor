# RideVehicleEditor plugin for OpenRCT2

This plugin lets you edit vehicles on any ride in your park on the fly.

![(Image of train with edited vehicles)](img/train.png)

### Current features
- Select and switch through all ride vehicles in your park.
- Change the vehicle type for each vehicle independently.
- Switch through different variants of the same ride type. (E.g. locomotive, tender or passenger car.)
- Modify properties like mass, number of seats, (powered) acceleration of each vehicle.
- Modify spacing between different vehicles on the same train.

### Planned features
- Buttons to apply changes to all vehicles or all trains.

## See it in action

A few people made some great videos showcasing how to use the plugin.

- **[Git Gud at OpenRCT2 #93: Vehicle hacking with the Ride Vehicle Editor Plugin!](https://youtu.be/xSzyTD7xFss)**, by Deurklink (using v1.0)
- **[The Joy of Hacking OpenRCT2: Vehicle Hacking 101](https://youtu.be/gqQHDqQQRDw)**, by Zarathustra (using v0.3)

## Installation

1. This plugin requires a OpenRCT2 develop version newer than the 29th of December, or release version v0.3.3 or higher when it is available. 
    - Update OpenRCT2 if you are still playing an older version of the game, otherwise the plugin will not load.
2. Download the latest version of the plugin from the [Releases page](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor/releases).
3. To install it, put the downloaded `*.js` file into your `/OpenRCT2/plugin` folder. 
    - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    - Otherwise this folder is commonly found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin` on Windows.
    - If you already had this plugin installed before, you can safely overwrite the old file.
4. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

## FAQ

### Does it transfer over save games?
**Answer:** yes, all changes will be saved with your save game.

### Can someone who doesn't have the plugin still open my park after I edited my vehicles?
**Answer:** yes, all changes to vehicles will still work if the player does not have the plugin installed. The plugin is only required to make any new changes.

### I want to add 100 to a vehicle's property without clicking a 100 times, how?
**Answer:** in the bottom right corner of the editor window, there's a dropdown with the value `1x`. Change it to `10x` or `100x` to add or subtract by tens or hundreds respectively.

### Can I reset the changes I made to a ride?
**Answer:** yes, you can reset the ride by closing it twice (to remove the vehicles) and reopening it again. All vehicles will respawn with the original values.

### Is this cheating?
**Answer:** yes, I suppose so. This plugin replaces a previous technique involving memory hacking, which is similar to how cheat engines work. This "cheat" is not active until you have made changes in the editor window though!

### Can I still play without it when I have it installed?
**Answer:** yes, the plugin does not do anything if you do not open the editor window.

###  Is it safe to uninstall the plugin if I don't want it anymore?
**Answer:** yes, uninstalling the plugin (by removing it from the Plugins folder) does not break your game or save files.

---

## Building the source code

This project is based on [wisnia74's Typescript modding template](https://github.com/wisnia74/openrct2-typescript-mod-template) and uses [Nodemon](https://nodemon.io/), [ESLint](https://eslint.org/) and [TypeScript](https://www.typescriptlang.org/) from this template.

1. Install latest version of [Node](https://nodejs.org/en/) and make sure to include NPM in the installation options.
2. Clone the project to a location of your choice on your PC.
3. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
4. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/bin/` or `C:/Program Files/OpenRCT2/`).
    - Alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2.
5. Run `npm run build` (release build) or `npm run build:dev` (develop build) to build the project.
    - The default output folder is `(project directory)/dist` and can be changed in `rollup.config.prod.js` and `rollup.config.dev.js` respectively.

### Hot reload

This project supports the [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) for development.

1. Make sure you've enabled it by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`.
2. Open `rollup.config.dev.js` and change the output file path to your plugin folder. 
    - Example: `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin/RideVehicleEditor.js`.
    - Make sure this path uses `/` instead of `\` slashes!
3. Open command prompt and use `cd` to change your current directory to the root folder of this project.
4. Run `npm start` to start the hot reload server.
5. Use the `/OpenRCT2/bin/openrct2.com` executable to [start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load a save or start new game.
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled plugin file inside your local OpenRCT2 plugin directory.
7. OpenRCT2 will notice file changes and it will reload the plugin.

## Notes

Don't touch `app.js`, even though it's just an empty file. Its existence makes Nodemon happy, and Nodemon is what watches your files for changes & fires off new dev builds for hot reloading.

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this mod and readme.
