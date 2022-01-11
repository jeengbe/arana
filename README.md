# Production
Arana can be used in several ways in production:
## Sources
When running `arana build`, the frontend, the backend, and the web server are built and can be found in the `dist` folder. You can then do with those whatever the license allows.
## Server
With `arana start`, you can start the web server and the backend server. This step does not compile any code, so it is recommended to run `arana build` before this step. (Note that `arana build` is automatically run if no sources are found.)
## Docker
Arana provides a Dockerfile that can be used to build images for both the backend and the frontend combined or separately.

# Development
Use `arana dev` to start the web server and the backend server in development mode.\
When working only on the frontend or backend respectively, by adding `--withFrontend` or `--withBackend` to the command, it is possible to only start the required services.

# Notes
backend graphql resolver comments:
function w. parameter -> Verb in comment eg: "Get ..." / "Query ..."
property/parameterless function -> No verb in comment eg: "id" / "name"

TL;DR at the bottom of the page.
# Setup
To commence working, you must (ironically) first build the build-script. This is done by running `npm run build-arana`. This automatically installs all required modules and builds all scripts required to run and build Arana.
## Start
To start Arana, simply run `npm run start`. This will start the server on your specified port.
## Build
To build Arana for production, run `npm run build`. This will build your application and place it in the `dist` folder. Note that your frontend code is located in the `dist/frontend` folder, whilst your backend code is located in the `dist/backend` folder.
## Test
Tests are not yet implemented.
# Environment Variables
## Scripts
Arana uses a list of environment variables for running and building. These can be found in the `Environment` interface in `build/settings.ts`.\
Common variables are:
- `PORT` — The port used by the development server
- `LOG_LEVEL` — The log level for scripts (Note that errors are always output to console)
### HTTPS
To enable HTTPS for the development server, simply set the `DEV_SERVER_SSL` environment variable to `true`, and `DEV_SERVER_SSL_CRT` and `DEV_SERVER_SSL_KEY` accordingly.
# Flags
## Scripts
It is also possible to pass flags to Arana scripts. These are configures to only have an effect when _present_, not _absent_.\
The following flags are available:
- `--noBackend`: Do not build or start the backend
- `--noFrontend`: Do not build or start the frontend
- `--noCatch`: Do not catch any exceptions (useful for debugging and breaking on uncaught exceptions)
# TL;DR
## Setup
Run `npm run build-arana`.
## Development server
Run `npm run start`.
### HTTPS
Set `DEV_SERVER_SSL=true` and `DEV_SERVER_SSL_CRT`, `DEV_SERVER_SSL_KEY` accordingly.
## Build
Run `npm run build`.
