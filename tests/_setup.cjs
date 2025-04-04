// Set build configuration for unit tests.
// Options: development, production
global.__BUILD_CONFIGURATION__ = "production";


// TODO: create proper mock for ObjectManager in OpenRCT2-Mocks project
Object.defineProperty(globalThis, "objectManager",
{
	get: () => context
})
