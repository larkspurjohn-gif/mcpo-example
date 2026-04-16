<script>
    // OSM State
    let addressQuery = $state('');
    let osmLoading = $state(false);
    let osmInterpretLoading = $state(false);
    let osmError = $state('');
    let osmInterpretError = $state('');
    let osmResult = $state('');
    let osmInterpretation = $state('');

    async function postJson(url, body) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        let parsed = text;
        try { 
            parsed = JSON.parse(text); 
        } catch { 
            // Keep plain text
        }

        if (!response.ok) {
            throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
        }
        return parsed;
    }

    async function interpretResult(tool, content) {
        const result = await postJson('/api/interpret', { tool, content });
        return result.content;
    }

    async function runGeocode() {
        osmLoading = true;
        osmError = '';
        osmInterpretError = '';
        osmResult = '';
        osmInterpretation = '';

        try {
        const result = await postJson('/api/mcpo', {
            // Updated to match your specific config key: "osm-mcp-server"
            path: '/osm-mcp-server/geocode_address', 
            body: {
                address: addressQuery
            }
        });
		console.log(result);

        const formattedResult = result.content;
        osmResult = formattedResult;
            osmInterpretLoading = true;

            try {
                osmInterpretation = await interpretResult('osm', formattedResult);
				console.log('osmInterpretation', osmInterpretation);
            } catch (error) {
                osmInterpretError = error instanceof Error ? error.message : 'Interpretation failed';
            }
       } catch (error) {
        osmError = error instanceof Error ? error.message : 'Request failed';
    } finally {
        osmInterpretLoading = false;
		osmLoading = false;
    }
    }
</script>

<svelte:head>
    <title>OSM Geocoder</title>
</svelte:head>

<div class="page">
    <h1>OSM Geocoder</h1>
    <p>
        Communicating with <code>open-streetmap-mcp</code> via mcpo.
    </p>

    <section>
        <h2>Geocode Address</h2>
        <p>
            <label>
                Address Query
                <input bind:value={addressQuery} type="text" spellcheck="false" />
            </label>
        </p>
        <p>
            <button disabled={osmLoading} onclick={runGeocode}>
                {osmLoading ? 'Searching...' : 'Search Location'}
            </button>
        </p>

        {#if osmError}
            <p class="error">{osmError}</p>
        {/if}

        <h3>Raw Result</h3>
        <pre>{osmResult || 'Results will appear here.'}</pre>

        <h3>AI Interpretation</h3>
        {#if osmInterpretError}
            <p class="error">{osmInterpretError}</p>
        {/if}
        <pre>{osmInterpretLoading ? 'Interpreting...' : osmInterpretation || 'Waiting for result...'}</pre>
    </section>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: sans-serif;
        background-color: #f9f9f9;
    }

    .page {
        max-width: 40rem;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        background: white;
        min-height: 100vh;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
    }

    h1 { font-weight: 700; margin-bottom: 0.5rem; }
    h2 { font-weight: 600; color: #444; }
    h3 { font-size: 1rem; margin-top: 1.5rem; color: #666; }

    label { display: block; margin-bottom: 0.5rem; }

    input {
        display: block;
        width: 100%;
        padding: 0.75rem;
        font: inherit;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    button {
        padding: 0.75rem 1.5rem;
        font: inherit;
        font-weight: bold;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover:enabled { background-color: #0056b3; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    pre {
        padding: 1rem;
        background: #f4f4f4;
        border-radius: 4px;
        border: 1px solid #ddd;
        overflow-x: auto;
        white-space: pre-wrap;
        font-size: 0.9rem;
        min-height: 6rem;
    }

    .error { color: #d9534f; font-weight: bold; }
</style>