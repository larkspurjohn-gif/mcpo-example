<script>
	let fetchUrl = $state('https://en.wikipedia.org/wiki/Pizza');
	let fetchMaxLength = $state(600);
	let timezone = $state('UTC');

	let fetchLoading = $state(false);
	let timeLoading = $state(false);
	let fetchError = $state('');
	let timeError = $state('');
	let fetchResult = $state('');
	let timeResult = $state('');

	async function postJson(path, body) {
		const response = await fetch('/api/mcpo', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				path,
				body
			})
		});

		const text = await response.text();
		let parsed = text;

		try {
			parsed = JSON.parse(text);
		} catch {
			// Keep plain text responses as-is.
		}

		if (!response.ok) {
			throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
		}

		return parsed;
	}

	async function runFetch() {
		fetchLoading = true;
		fetchError = '';
		fetchResult = '';

		try {
			const result = await postJson('/fetch/fetch', {
				url: fetchUrl,
				max_length: Number(fetchMaxLength)
			});

			fetchResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
		} catch (error) {
			fetchError = error instanceof Error ? error.message : 'Request failed';
		} finally {
			fetchLoading = false;
		}
	}

	async function runTime() {
		timeLoading = true;
		timeError = '';
		timeResult = '';

		try {
			const result = await postJson('/time/get_current_time', {
				timezone
			});

			timeResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
		} catch (error) {
			timeError = error instanceof Error ? error.message : 'Request failed';
		} finally {
			timeLoading = false;
		}
	}
	</script>

	<svelte:head>
		<title>mcpo Example</title>
		<meta
			name="description"
			content="Svelte example that calls mcpo fetch and time endpoints on port 8000."
		/>
	</svelte:head>

	<div class="page">
		<h1>mcpo example</h1>
		<p>
			Keep <code>uvx mcpo --port 8000 --config ./mcp_config.json</code> running. This page calls the local SvelteKit proxy, which forwards requests to mcpo.
		</p>

		<hr />

		<section>
			<h2>Fetch</h2>
			<p>POST /fetch/fetch</p>
			<p>
				<label>
					URL
					<input bind:value={fetchUrl} type="url" spellcheck="false" />
				</label>
			</p>
			<p>
				<label>
					Max length
					<input bind:value={fetchMaxLength} min="50" step="50" type="number" />
				</label>
			</p>
			<p>
				<button disabled={fetchLoading} onclick={runFetch}>
					{fetchLoading ? 'Loading...' : 'Run fetch'}
				</button>
			</p>
			{#if fetchError}
				<p>{fetchError}</p>
			{/if}
			<pre>{fetchResult || 'Response will appear here.'}</pre>
		</section>

		<hr />

		<section>
			<h2>Time</h2>
			<p>POST /time/get_current_time</p>
			<p>
				<label>
					Timezone
					<input bind:value={timezone} type="text" spellcheck="false" />
				</label>
			</p>
			<p>
				<button disabled={timeLoading} onclick={runTime}>
					{timeLoading ? 'Loading...' : 'Get current time'}
				</button>
			</p>
			{#if timeError}
				<p>{timeError}</p>
			{/if}
			<pre>{timeResult || 'Response will appear here.'}</pre>
		</section>
	</div>

	<style>
		:global(body) {
			margin: 0;
			font-family: sans-serif;
		}

		.page {
			max-width: 48rem;
			margin: 0 auto;
			padding: 2rem 1rem 3rem;
		}

		section {
			margin: 1.5rem 0;
		}

		hr {
			margin: 2rem 0;
		}

		label {
			display: block;
			font-weight: 600;
		}

		input {
			display: block;
			width: 100%;
			max-width: 32rem;
			margin-top: 0.35rem;
			padding: 0.5rem;
			font: inherit;
			box-sizing: border-box;
		}

		button {
			padding: 0.5rem 0.9rem;
			font: inherit;
		}

		pre {
			padding: 0.75rem;
			border: 1px solid;
			overflow: auto;
			white-space: pre-wrap;
			word-break: break-word;
			min-height: 8rem;
		}
	</style>
