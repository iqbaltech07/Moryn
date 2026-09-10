"""Integration test to verify Gemini AI Generation & Pydantic structured output."""
import asyncio
from app.schemas.questions import QuestionsGenerateRequest
from app.schemas.stack import RecommendStackRequest
from app.services.gemini_client import gemini_service
from app.services.prompt_service import QUESTIONS_SYSTEM_PROMPT, RECOMMEND_STACK_SYSTEM_PROMPT
from app.schemas import QuestionsGenerateResponse, RecommendStackResponse

async def test_recommend_stack():
    print("\n--- Testing Recommend Stack ---")
    payload = RecommendStackRequest(
        appName="QuickTrack",
        appIdea="Simple personal finance tracker for freelancers with expense categorization and tax estimation."
    )
    result, model_used = await gemini_service.generate_structured(
        system_prompt=RECOMMEND_STACK_SYSTEM_PROMPT,
        user_prompt=f"App Name: {payload.appName}\nApp Idea: {payload.appIdea}",
        schema_class=RecommendStackResponse
    )
    print(f"[PASS] Model Used: {model_used}")
    print(f"[PASS] Recommended Stacks: {result.stacks}")
    print(f"[PASS] Palette ID: {result.paletteId}")
    print(f"[PASS] Badge: {result.badge}")
    print(f"[PASS] Reasoning: {result.reasoning}")

if __name__ == "__main__":
    asyncio.run(test_recommend_stack())
