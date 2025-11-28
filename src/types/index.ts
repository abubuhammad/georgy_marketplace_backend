// This module exists only so that importing `../types` from source files
// resolves to a real runtime module. It intentionally does not import
// any implementation files (which may be .d.ts only) to avoid runtime
// requires for missing JS modules in production.

export {};
