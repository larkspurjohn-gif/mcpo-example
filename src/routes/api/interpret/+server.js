import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';

const FALLBACK_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const FALLBACK_OLLAMA_MODEL = 'gemma3:1b';
const ollamaBaseUrl = new URL(env.ollama_base_url || FALLBACK_OLLAMA_BASE_URL);
const ollamaModel = env.ollama_model || FALLBACK_OLLAMA_MODEL;
const toolPrompts = {
	fetch: 'Give a short plain-English summary with the most important information.',
	time: 'Interpret this time tool response for a user. State the current time clearly and mention the timezone.',
	postgres: 'Summarize the query result briefly and mention any returned rows or key values.',
	osm: 'Can you tell me what type of building is at the location given'
};

function normalizeTool(input) {
	if (input !== 'fetch' && input !== 'time' && input !== 'postgres' && input !== 'osm') {
		throw error(400, 'tool must be fetch, time, postgres, or osm');
	}

	return input;
}

function normalizeContent(input) {
	if (typeof input !== 'string' || input.trim().length === 0) {
		throw error(400, 'content is required');
	}

	return input.trim();
}

function buildPrompt(tool, content) {
	return `${toolPrompts[tool]}\n\nKeep the answer brief.\n\nTool: ${tool}\nResponse:\n${content}`;
}

export async function POST({ request, fetch }) {
	const payload = await request.json();
	console.log(payload.tool);
	const tool = normalizeTool(payload.tool);
	const content = normalizeContent(payload.content);
	console.log(buildPrompt(tool, content));
	const ollamaResponse = await fetch(`${ollamaBaseUrl.toString().replace(/\/$/, '')}/api/generate`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			model: ollamaModel,
			prompt: buildPrompt(tool, content),
			stream: false
		})
	});

	const text = await ollamaResponse.text();
	let parsed = text;
	console.log(text);

	try {
		parsed = JSON.parse(text);
	} catch {
		// Keep non-JSON error bodies as text.
	}

	if (!ollamaResponse.ok) {
		throw error(
			ollamaResponse.status,
			typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
		);
	}

	return json({
		content: typeof parsed === 'object' && parsed && 'response' in parsed ? parsed.response : text
	});
}