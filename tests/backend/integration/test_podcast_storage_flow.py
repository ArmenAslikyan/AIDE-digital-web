"""
covers: Static integration contract for Gemini script generation and Gemini TTS audio.
does_not_cover: Real audio generation, provider availability, browser playback, or payload size limits.
prerequisites: Provider calls must be mocked for any runtime execution.
"""


def test_generate_podcast_calls_script_generation_before_tts_before_usage_log(read_source):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    gemini_index = source.index("let geminiRes = await requestGemini")
    eleven_index = source.index("const ttsRes = await fetch")
    usage_index = source.index("await supabaseAdmin.from('usage_logs').insert")

    assert gemini_index < eleven_index < usage_index


def test_generate_podcast_returns_playable_podcast_data_url(read_source, expect_snippets):
    source = read_source("supabase/functions/generate-podcast/index.ts")

    expect_snippets(
        source,
        [
            "audioPart.inlineData.data",
            "podcast_script: JSON.stringify(script)",
            "podcast_url: `data:${audioPart.inlineData.mimeType || 'audio/wav'};base64,${audioPart.inlineData.data}`",
        ],
    )


def test_content_detail_updates_user_content_after_podcast_generation(read_source, expect_snippets):
    source = read_source("src/pages/ContentDetail.tsx")

    expect_snippets(
        source,
        [
            "supabase.functions.invoke('generate-podcast'",
            "podcast_url: scriptOrUrl",
            "podcast: true",
            ".eq('id', content.id)",
        ],
    )
