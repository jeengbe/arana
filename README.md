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
- `--noBackend`: Do not build or start the backend (available for `arana start`)
- `--noFrontend`: Do not build or start the frontend (available for `arana start`)
# TL;DR
## Setup
Run `npm run build-arana`.
## Development server
Run `npm run start`.
### HTTPS
Set `DEV_SERVER_SSL=true` and `DEV_SERVER_SSL_CRT`, `DEV_SERVER_SSL_KEY` accordingly.
## Build
Run `npm run build`.
