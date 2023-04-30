# RideVehicleEditor plugin for OpenRCT2

This plugin lets you edit vehicles on any ride in your park on the fly.

![(Manticore's carrousel with edited vehicles)](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/manticore-carrousel.png)

*<p align="right">Carrousel made by Manticore</p>*

## Current features
- Select and switch through **all ride vehicles** in your park, or use the **picker** to click on the vehicle directly.
- **Modify properties** like vehicle type, colour, mass, number of seats, (powered) acceleration of each vehicle.
- Switch through **different variants** of the same ride type. (E.g. locomotive, tender or passenger car.)
- Modify the **track position** of or **spacing** between different vehicles on the same train.
- **[Pick up and move](#move-vehicles-off-the-track)** stationery vehicles to different places on the map.
- [**Copy** and **paste**](#copy--paste-vehicles) the settings of a vehicle over other completely unrelated vehicles.
- Easily **[apply your changes to all vehicles](#apply-or-copy-and-paste-changes-to-multiple-vehicles)** on the train or the ride, or **[update multiple vehicles](#sychronize-changes-to-multiple-vehicles)** at the same time.
- **Edit** and **freeze** the ride's excitement, intensity or nausea ratings.

### Planned features
- Please submit any ideas under [Issues](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor/issues).

## Installation

1. This plugin requires at least OpenRCT2 version v0.4.4.
2. Download the latest version of the plugin from the [Releases page](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor/releases).
3. To install it, put the downloaded `*.js` file into your `/OpenRCT2/plugin` folder.
    - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    - Otherwise this folder is commonly found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin` on Windows.
    - If you already had this plugin installed before, you can safely overwrite the old file.
4. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

## Inspirations!

Here are some inspirations and examples of what you can do with this plugin.

| ![Toy machine, by Manticore](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/manticore-toy-machine.gif)<br>Toy machine, by Manticore | ![Parking lot, by Fidwell](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/fidwell-parking-lot.png)<br>Parking lot, by Fidwell |
|--|--|

| ![Bicycle parking, by Enox](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/enox-bicycle-parking.png)<br>Bicycle parking, by Enox | ![Space mine train, by Deurklink](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/deurklink-space-mine-train.png)<br>Space mine train, by Deurklink |
|--|--|

| ![Train with different carriages, by Emiel](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/emiel-train-travel-classes.png)<br>Train with different carriages, by Emiel | ![Shark chasing row boat, by Deurklink](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/deurklink-shark.gif)<br>Shark chasing row boat, by Deurklink |
|--|--|

| ![Horse carriage, by Zarathustra](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/zarathustra-and-left-handed-coffee-mug-horse-carriage.png)<br>Horse carriage, by Zarathustra | ![Dragon ships, by Mamarillas](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/inspirations/mamarillas-dragons.png)<br>Dragon ships, by Mamarillas |
|--|--|

## See it in action

The plugin was featured in these plugin recommendations / rankings!

- **[Top 10 OpenRCT2 Plugins](https://youtu.be/IeLoyNDq_7A)**, by Marcel Vos
- **[Top 5 Plugins for OpenRCT2](https://youtu.be/isfXGf9cUu4)**, by Fidwell

The plugin was also featured in the following videos (grouped by plugin version):

### v2.0

- **[Ride Vehicle Editor plugin v2.0 - OpenRCT2 tutorial](https://www.youtube.com/watch?v=R4BPUnKPPqU)**, by Fidwell

### v1.1

- **[OpenRCT2 hacking: Self-powered shark](https://youtu.be/YhqCHzH9-64)**, by Fidwell
- **[RCT2 Hacking Tutorial: Intamin Impulse with Holding Brake](https://youtu.be/scjxYx2GAEg)**, by Brian Andrelczyk (CP6)
- **[RCT2 Hacking Tutorial: Diagonal and Triple Launch](https://youtu.be/TaNBwGBC0n0)**,  by Brian Andrelczyk (CP6)
- **[Git Gud at OpenRCT2 #105: Turning any train into a powered train!](https://youtu.be/gQaxfdcq-Vw)**, by Deurklink

### v1.0

- **[Mini Vehicle Hacking Contest - The Results](https://youtu.be/ThXNZdzY3Ys)**, by Deurklink and his DKMP community
- **[Git Gud at OpenRCT2 #95: Basic parking lots!](https://youtu.be/kXOf1IMlkow)**, by Deurklink
- **[Git Gud at OpenRCT2 #93: Vehicle hacking with the Ride Vehicle Editor Plugin!](https://youtu.be/xSzyTD7xFss)**, by Deurklink

### v0.3

- **[The Joy of Hacking OpenRCT2: Vehicle Hacking 101](https://youtu.be/gqQHDqQQRDw)**, by Zarathustra

## Tutorials

### Copy & paste vehicles

To copy the settings of a vehicle to any other ride, you can use the copy and paste feature.

1. Click the **copy** ![Copy button](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/icons/copy.png) button to the left of the viewport.
   - If a copy is currently selected, the button will be in the pressed state.
2. Select another vehicle that you want to override.
3. Click the **paste** ![Paste button](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/icons/paste.png) button to the left of the viewport (the paper off the clipboard).
4. All settings from the copied vehicle will be pasted onto the currently selected vehicle.

![How to copy and paste](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/tutorials/copy-and-paste.gif)

### Synchronize changes to multiple vehicles

By enabling the synchronize option, all changes made to the selected vehicle will also be applied to a specific set of other vehicles on the same ride.

1. From the dropdown in the **Apply & synchronize** section, select the vehicles that should be updated alongside the currently selected vehicle.
2. Enable synchronization by clicking the **Synchronize** button.
3. Any changes you make to the selected vehicle, will instantly be applied to the other vehicles as well.

If you only want to synchronize specific settings, you can use the checkboxes in the **Apply & synchronize** section to limit what settings should synchronize.

![How to synchronize changes to multiple vehicles](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/tutorials/synchronize.gif)

### Apply or copy and paste changes to multiple vehicles

With the **Apply** button it is possible to copy and paste the currently selected vehicle to multiple other vehicles in a single click.

1. Select the vehicle you want to copy.
2. From the dropdown in the **Apply & synchronize** section, select the set of vehicles where the settings should be pasted to.
3. Optionally, use the checkboxes to specify which settings should be copied.
4. Click the **Apply** button to copy and paste all settings to selected set of vehicles.

![How to apply changes to multiple vehicles](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/tutorials/apply-multiple.gif)

### Move vehicles off the track

When a vehicle is in a stationary position, like waiting in a closed station, it is possible to move the vehicle off the track to another position on the map.

1. Put the selected vehicle in a **still-standing state**, like waiting in a station.
2. Use the **clipper** ![Clipper button](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/icons/clipper.png) button to the left of the viewport to pick up the selected currently vehicle.
3. Place it down at a new location on the map.

For more detailed placement, it is recommended to use the X, Y and Z position settings.

**Note:** if a vehicle starts "moving" again (for example: leaving the station), it will teleport back to its appropriate position on the track. To make it work permanently, keep the vehicle stationary, by for example keeping the ride closed.

![How to move a vehicle to another location](https://raw.githubusercontent.com/Basssiiie/OpenRCT2-RideVehicleEditor/main/img/tutorials/drag-vehicle.gif)


### Multiplayer! (How to setup)

This plugin supports multiplayer! A few key points to note:

1. For the plugin to work in multiplayer, **it needs to be installed on the server.** Make sure it is installed in the plugin's folder of the server's user directory.
2. When the server is started, the plugin will be distributed to every player joining the server. Players do not need to install the plugin for themselves.
3. Players need the **Ride Properties** permission to be able to modify any vehicles.
4. When a player who did not have the plugin before joining leaves the server, the plugin will be removed from the game.
5. When the plugin is installed in singleplayer, but not on the server, the plugin will be disabled on the server.

## FAQ

### Does it transfer over save games?
**Answer:** yes, all changes will be saved with your save game.

### Can someone who doesn't have the plugin still open my park after I edited my vehicles?
**Answer:** yes, all changes to vehicles will still work if the player does not have the plugin installed. The plugin is only required to make any new changes.

### I want to add 100 to a vehicle's property without clicking a 100 times, how?
**Answer:** in the bottom right corner of the editor window, there's a dropdown with the value `x1`. Change it to `x10` or `x100` to add or subtract by tens or hundreds respectively. You can also hold down the [+] and [-] buttons.

### Can I reset the changes I made to a ride?
**Answer:** yes, you can reset the ride by closing it twice (to remove the vehicles) and reopening it again. All vehicles will respawn with the original values.

### Is this cheating?
**Answer:** yes, I suppose so. This plugin replaces a previous technique involving memory hacking, which is similar to how cheat engines work. This "cheat" is not active until you have made changes in the editor window though!

### Can I still play without it when I have it installed?
**Answer:** yes, the plugin does not do anything if you do not open the editor window.

###  Is it safe to uninstall the plugin if I don't want it anymore?
**Answer:** yes, uninstalling the plugin (by removing it from the Plugins folder) does not break your game or save files.

---

## For developers: building the source code

1. Install latest version of [Node](https://nodejs.org/en/) and make sure to include NPM in the installation options.
2. Clone the project to a location of your choice on your PC.
3. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
4. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/bin/` or `C:/Program Files/OpenRCT2/`).
    - Alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2.
5. Run `npm run build` (release build) or `npm run build:dev` (develop build) to build the project.
    - For the release build, the default output folder is `(project directory)/dist`.
    - For the develop build, the project tries to put the plugin into your game's plugin directory.
    - These output paths can be changed in `rollup.config.js`.

### User interface

This plugin makes use of the [FlexUI](https://github.com/Basssiiie/OpenRCT2-FlexUI) framework to create and manage the user interface. It is automatically fetched from NPM with `npm install`.

### Hot reload

This project supports the [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) for development.

1. Make sure you've enabled it by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`.
2. Open `rollup.config.js` and change the output file path to your plugin folder.
    - Example: `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin/RideVehicleEditor.js`.
    - Make sure this path uses `/` instead of `\` slashes!
3. Open command prompt and use `cd` to change your current directory to the root folder of this project.
4. Run `npm start` to start the hot reload server.
5. Use the `/OpenRCT2/bin/openrct2.com` executable to [start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load a save or start new game.
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled plugin file inside your local OpenRCT2 plugin directory.
7. OpenRCT2 will notice file changes and it will reload the plugin.

### Final notes

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this mod and readme. Thanks to the community for the enthusiasm for this plugin and their amazing creations.
