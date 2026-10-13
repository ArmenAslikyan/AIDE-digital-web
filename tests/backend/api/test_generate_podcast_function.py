"""
covers: API contract for the `generate-podcast` Supabase Edge Function.
does_not_cover: Real Gemini, Gemini TTS audio validation, or browser playback.
prerequisites: Provider calls must be mocked for runtime tests.
"""


def test_generate_podcast_accepts_post_only_and_validates_env(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "if (req.method !== 'POST')",
            "Deno.env.get('GEMINI_API_KEY')",
            "Deno.env.get('SUPABASE_URL')",
            "Deno.env.get('SUPABASE_ANON_KEY')",
            "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')",
            "await supabase.auth.getUser()",
        ],
    )


def test_generate_podcast_request_schema_supports_topic_variants(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "body?.topic?.trim() || body?.knowledgeGap?.trim() || body?.prompt?.trim()",
            "Topic or knowledgeGap is required",
        ],
    )


def test_generate_podcast_response_contract_is_audio_data_url_json(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "Podcast generation failed. Please try again.",
            "Gemini TTS failed",
            "Podcast voice generation returned no audio. Please try again.",
            "podcast_script: JSON.stringify(script)",
            "podcast_url: `data:${audioPart.inlineData.mimeType || 'audio/wav'};base64,${audioPart.inlineData.data}`",
        ],
    )
