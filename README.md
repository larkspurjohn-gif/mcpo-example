# mcpo Frontend Example

SvelteKit frontend for testing two `mcpo`-exposed MCP tools from the browser:

- `fetch` via `POST /fetch/fetch`
- `time` via `POST /time/get_current_time`

The page lives in [src/routes/+page.svelte](src/routes/+page.svelte) and sends JSON requests directly to the running `mcpo` server.

## Prerequisites

- Node.js and npm
- `uvx` available in your shell

## Install

```sh
npm install
```

## Start mcpo

This project expects `mcpo` to run on port `8000` using [mcp_config.json](mcp_config.json):

```sh
uvx mcpo --port 8000 --config ./mcp_config.json
```

Configured MCP servers:

- `fetch` using `mcp-server-fetch`
- `time` using `mcp-server-time`

## Run the frontend

In a second terminal:

```sh
npm run dev
```

Then open the local Svelte app in your browser.

## What the page does

- Lets you set the `mcpo` base URL
- Sends a fetch request with:
	- `url`
	- `max_length`
- Sends a time request with:
	- `timezone`
- Displays either the raw response body or an error message

Default example inputs:

- Fetch URL: `https://en.wikipedia.org/wiki/Pizza`
- Timezone: `UTC`

## Build

```sh
npm run build
```

Preview the production build with:

```sh
npm run preview
```
