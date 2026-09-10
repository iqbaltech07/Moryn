import json
import logging
from typing import Optional, List, Any, AsyncGenerator, Type
from pydantic import BaseModel
from google import genai
from google.genai import types
import httpx
from app.core.config import get_settings

logger = logging.getLogger("moryn.gemini")

class GeminiClientService:
    def __init__(self):
        self.settings = get_settings()

    def _get_clients(self) -> List[tuple[str, genai.Client]]:
        """Returns list of (key_identifier, client) for key rotation."""
        clients = []
        for idx, key in enumerate(self.settings.gemini_keys):
            try:
                c = genai.Client(api_key=key)
                clients.append((f"key_{idx+1}", c))
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client with key_{idx+1}: {e}")
        return clients

    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
    ) -> tuple[str, str]:
        """Generates text with automatic key rotation and model fallback."""
        clients = self._get_clients()
        models = [model or self.settings.DEFAULT_GEMINI_MODEL] + [
            m for m in self.settings.GEMINI_FALLBACK_MODELS if m != model
        ]

        last_error = None
        for key_id, client in clients:
            for m in models:
                try:
                    logger.info(f"Attempting generation with {key_id} and model {m}")
                    config = types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=temperature,
                    )
                    # Running in executor/async
                    response = client.models.generate_content(
                        model=m,
                        contents=user_prompt,
                        config=config,
                    )
                    if response and response.text:
                        return response.text, m
                except Exception as e:
                    last_error = e
                    logger.warning(f"Error on {key_id} ({m}): {str(e)[:150]}")
                    continue

        # OpenRouter fallback if available
        if self.settings.OPENROUTER_API_KEY:
            try:
                logger.info("Falling back to OpenRouter...")
                text = await self._call_openrouter(system_prompt, user_prompt)
                if text:
                    return text, "openrouter"
            except Exception as e:
                logger.error(f"OpenRouter fallback failed: {e}")

        raise RuntimeError(f"All AI providers failed. Last error: {last_error}")

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema_class: Type[BaseModel],
        model: Optional[str] = None,
    ) -> tuple[Any, str]:
        """Generates structured output strictly validated against a Pydantic model."""
        clients = self._get_clients()
        models = [model or self.settings.DEFAULT_GEMINI_MODEL] + [
            m for m in self.settings.GEMINI_FALLBACK_MODELS if m != model
        ]

        last_error = None
        for key_id, client in clients:
            for m in models:
                try:
                    logger.info(f"Attempting structured generation with {key_id} and model {m}")
                    config = types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=schema_class,
                    )
                    response = client.models.generate_content(
                        model=m,
                        contents=user_prompt,
                        config=config,
                    )
                    if response and response.text:
                        data = json.loads(response.text)
                        validated = schema_class.model_validate(data)
                        return validated, m
                except Exception as e:
                    last_error = e
                    logger.warning(f"Structured error on {key_id} ({m}): {str(e)[:150]}")
                    # Try manual JSON fallback if schema enforcement had API nuance
                    try:
                        raw_text, used_m = await self.generate_text(
                            system_prompt=f"{system_prompt}\nReturn strictly valid JSON matching this schema: {json.dumps(schema_class.model_json_schema())}",
                            user_prompt=user_prompt,
                            model=m,
                            temperature=0.2,
                        )
                        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
                        data = json.loads(cleaned)
                        validated = schema_class.model_validate(data)
                        return validated, used_m
                    except Exception:
                        pass
                    continue

        raise RuntimeError(f"Structured generation failed. Last error: {last_error}")

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Streams content chunks in real-time."""
        clients = self._get_clients()
        if not clients:
            raise RuntimeError("No Gemini API keys configured.")
        
        _, client = clients[0]
        m = model or self.settings.DEFAULT_GEMINI_MODEL
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
        )
        response_stream = client.models.generate_content_stream(
            model=m,
            contents=user_prompt,
            config=config,
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    async def embed_texts(self, texts: List[str], model: Optional[str] = None) -> List[List[float]]:
        """Generates 768-dim embeddings using official Google Gemini gemini-embedding-001 in high-speed batches."""
        if not texts:
            return []

        target_model = model or getattr(self.settings, "GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
        clients = self._get_clients()
        last_error = None

        for key_id, client in clients:
            try:
                logger.info(f"Generating batch embeddings for {len(texts)} chunks using {key_id} ({target_model})")
                embeddings: List[List[float]] = []
                config = types.EmbedContentConfig(output_dimensionality=768) if target_model == "gemini-embedding-001" else None

                # Batch embed in slices of 50 for max speed & API safety
                batch_size = 50
                for i in range(0, len(texts), batch_size):
                    batch = texts[i:i + batch_size]
                    res = client.models.embed_content(
                        model=target_model,
                        contents=batch,
                        config=config,
                    )
                    if hasattr(res, "embeddings") and res.embeddings:
                        for emb in res.embeddings:
                            embeddings.append(emb.values)
                    elif hasattr(res, "embedding") and res.embedding:
                        embeddings.append(res.embedding.values)
                    else:
                        raise ValueError("No embedding vector returned by Gemini API")
                return embeddings
            except Exception as e:
                last_error = e
                logger.warning(f"Embedding failed on {key_id}: {str(e)[:150]}")
                continue

        raise RuntimeError(f"Failed to generate embeddings. Last error: {last_error}")

    async def _call_openrouter(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            res = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.settings.DEFAULT_OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                },
            )
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"]

gemini_service = GeminiClientService()
