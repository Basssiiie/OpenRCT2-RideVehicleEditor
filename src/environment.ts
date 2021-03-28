/// <reference path="environment.d.ts" />


/**
 * Environment variables for the project.
 */
module Environment
{
	/**
	 * Returns the current version of the plugin.
	 */
	export const pluginVersion = "1.1";


	/**
	 * Returns the build configuration of the plugin.
	 */
	export const buildConfiguration: BuildConfiguration = __BUILD_CONFIGURATION__;


	/**
	 * Returns true if the current build is a production build.
	 */
	export const isProduction = (buildConfiguration === "production");


	/**
	 * Returns true if the current build is a production build.
	 */
	export const isDevelopment = (buildConfiguration === "development");
}
export default Environment;