-- Seed api_registry with known APIs used across Echoverse apps
INSERT INTO api_registry (name, vendor, category, status, auth_type, endpoint_url, purpose)
VALUES 
  ('Supabase', 'Supabase', 'storage', 'active', 'api-key', 'https://supabase.co/rest/v1/', 'Backend database, auth, and storage'),
  ('Gemini AI', 'Google', 'ai', 'active', 'api-key', 'https://generativelanguage.googleapis.com/v1/', 'AI image analysis and generation'),
  ('ElevenLabs', 'ElevenLabs', 'ai', 'active', 'api-key', 'https://api.elevenlabs.io/v1/', 'Voice synthesis and TTS'),
  ('OpenAI', 'OpenAI', 'ai', 'active', 'api-key', 'https://api.openai.com/v1/', 'AI text generation and embeddings'),
  ('Web Audio API', 'Browser', 'integration', 'active', 'none', NULL, 'Browser audio processing and analysis'),
  ('Web Speech API', 'Browser', 'integration', 'active', 'none', NULL, 'Browser speech recognition');