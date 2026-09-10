import json
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from app.core.security import verify_internal_secret
from app.schemas import (
    BaseResponse,
    QuestionsGenerateRequest,
    QuestionsGenerateResponse,
    RecommendStackRequest,
    RecommendStackResponse,
    PRDGenerateRequest,
    PRDGenerateResponse,
    EditPrdRequest,
    EditPrdResponse,
    TasksGenerateRequest,
    TasksGenerateResponse,
    TasksData,
    StrukturGenerateRequest,
    StrukturGenerateResponse,
    StrukturData,
    EmbeddingRequest,
    EmbeddingResponse,
)
from app.services.gemini_client import gemini_service
from app.services.prompt_service import (
    QUESTIONS_SYSTEM_PROMPT,
    RECOMMEND_STACK_SYSTEM_PROMPT,
    PRD_SYSTEM_PROMPT,
    STRUKTUR_SYSTEM_PROMPT,
    TASKS_SYSTEM_PROMPT,
    build_prd_user_prompt,
)

logger = logging.getLogger("moryn.routers.generate")

router = APIRouter(
    prefix="/generate",
    tags=["AI Generation"],
    dependencies=[Depends(verify_internal_secret)],
)

# 1. DYNAMIC QUESTIONS
@router.post("/questions", response_model=QuestionsGenerateResponse)
async def generate_questions(payload: QuestionsGenerateRequest):
    user_prompt = f"App Name: {payload.appName or 'N/A'}\nApp Idea: {payload.appIdea}"
    if payload.stacks:
        user_prompt += f"\nTech Stack: {json.dumps(payload.stacks)}"

    try:
        result, _ = await gemini_service.generate_structured(
            system_prompt=QUESTIONS_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema_class=QuestionsGenerateResponse,
        )
        return result
    except Exception as e:
        logger.error(f"Questions generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate questions: {str(e)}",
        )

# 2. RECOMMEND STACK
@router.post("/recommend-stack", response_model=RecommendStackResponse)
async def recommend_stack(payload: RecommendStackRequest):
    user_prompt = f"App Name: {payload.appName or 'N/A'}\nApp Idea: {payload.appIdea}"
    if payload.existingStacks:
        user_prompt += f"\nInitial Preference: {json.dumps(payload.existingStacks)}"

    try:
        result, _ = await gemini_service.generate_structured(
            system_prompt=RECOMMEND_STACK_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema_class=RecommendStackResponse,
        )
        return result
    except Exception as e:
        logger.error(f"Recommend stack failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recommend stack: {str(e)}",
        )

# 3. PRD GENERATION
@router.post("/prd", response_model=PRDGenerateResponse)
async def generate_prd(payload: PRDGenerateRequest):
    user_prompt = build_prd_user_prompt(
        app_name=payload.appName,
        app_idea=payload.appIdea,
        stacks=payload.stacks,
        dynamic_answers=payload.dynamicAnswers,
        design_preference=payload.designPreference,
        custom_prompt=payload.customPrompt,
        structure_context=payload.structureContext,
    )

    try:
        markdown, model_used = await gemini_service.generate_text(
            system_prompt=PRD_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.7,
        )
        return PRDGenerateResponse(
            markdown=markdown,
            appName=payload.appName,
            modelUsed=model_used,
        )
    except Exception as e:
        logger.error(f"PRD generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PRD: {str(e)}",
        )

# 4. PRD STREAMING (SSE)
@router.post("/prd/stream")
async def stream_prd(payload: PRDGenerateRequest):
    user_prompt = build_prd_user_prompt(
        app_name=payload.appName,
        app_idea=payload.appIdea,
        stacks=payload.stacks,
        dynamic_answers=payload.dynamicAnswers,
        design_preference=payload.designPreference,
        custom_prompt=payload.customPrompt,
        structure_context=payload.structureContext,
    )

    async def sse_event_stream():
        try:
            async for chunk in gemini_service.generate_stream(
                system_prompt=PRD_SYSTEM_PROMPT,
                user_prompt=user_prompt,
            ):
                # SSE format: data: <chunk>\n\n
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(sse_event_stream(), media_type="text/event-stream")

# 5. EDIT PRD
@router.post("/edit-prd", response_model=EditPrdResponse)
async def edit_prd(payload: EditPrdRequest):
    system_prompt = """You are an expert AI Product Manager and Brainstorming Partner.
You are helping the user refine, discuss, or update their Product Requirements Document (PRD).

TASK INSTRUCTIONS:
1. Analyze the user's prompt instruction.
2. Determine if the user is BRAINSTORMING / ASKING A QUESTION / DISCUSSING (answer helpfully in Indonesian, isPrdUpdated=false).
3. Determine if the user wants to REVISE / EDIT / ADD / REMOVE / UPDATE the PRD (provide friendly confirmation, isPrdUpdated=true, output FULL updated PRD markdown).

OUTPUT FORMAT:
<reply>Your conversational response in Indonesian.</reply>
<is_prd_updated>true or false</is_prd_updated>
<updated_prd>
(Full updated PRD markdown here if is_prd_updated is true, otherwise leave empty)
</updated_prd>"""

    user_prompt = f"=== CURRENT PRD START ===\n{payload.currentPrd}\n=== CURRENT PRD END ===\n\n=== USER INSTRUCTION ===\n{payload.instruction}"
    if payload.isEditIntent:
        user_prompt += "\n\nUSER INTENT: The user wants to EDIT/UPDATE the PRD. Please provide the updated PRD."

    try:
        raw_text, model_used = await gemini_service.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        import re
        reply_match = re.search(r"<reply>([\s\S]*?)</reply>", raw_text, re.IGNORECASE)
        updated_tag = re.search(r"<is_prd_updated>([\s\S]*?)</is_prd_updated>", raw_text, re.IGNORECASE)
        prd_match = re.search(r"<updated_prd>([\s\S]*?)</updated_prd>", raw_text, re.IGNORECASE)

        if reply_match or prd_match:
            reply = reply_match.group(1).strip() if reply_match else "Perubahan PRD telah diterapkan."
            is_updated_str = updated_tag.group(1).strip().lower() if updated_tag else ""
            prd_content = prd_match.group(1).strip() if prd_match else ""
            is_updated = is_updated_str == "true" or len(prd_content) > 50 or bool(payload.isEditIntent)
            return EditPrdResponse(
                reply=reply,
                isPrdUpdated=is_updated and len(prd_content) > 30,
                updatedMarkdown=prd_content if len(prd_content) > 30 else None,
                modelUsed=model_used,
            )

        # Fallback: check if JSON format
        try:
            cleaned = raw_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return EditPrdResponse(
                reply=data.get("reply", "PRD berhasil diperbarui!"),
                isPrdUpdated=bool(data.get("isPrdUpdated", False)),
                updatedMarkdown=data.get("updatedMarkdown"),
                modelUsed=model_used,
            )
        except Exception:
            return EditPrdResponse(
                reply=raw_text,
                isPrdUpdated=False,
                updatedMarkdown=None,
                modelUsed=model_used,
            )
    except Exception as e:
        logger.error(f"Edit PRD failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to edit PRD: {str(e)}",
        )

# 6. TASKS GENERATION (6-Phase Kanban)
@router.post("/tasks", response_model=TasksGenerateResponse)
async def generate_tasks(payload: TasksGenerateRequest):
    user_prompt_parts = [
        f"App Name: {payload.appName or 'N/A'}",
        f"App Idea: {payload.appIdea}",
    ]
    if payload.stacks:
        user_prompt_parts.append(
            f"=== SELECTED TECH STACK (MANDATORY IMPLEMENTATION DIRECTIVE) ===\n{json.dumps(payload.stacks, indent=2)}\nNOTE: Every technical task in Phase 1-6 must explicitly use this tech stack."
        )
    if payload.strukturSummary:
        user_prompt_parts.append(
            f"=== ARCHITECTURE FEATURE MINDMAP & MODULES ===\n{payload.strukturSummary}\nCRITICAL: In each task's 'tags' array, explicitly include the exact Module or Sub-Feature label from above so the Visual Mindmap can cleanly cluster them."
        )
    if payload.prdMarkdown:
        # Full PRD without truncation so API endpoints, Database schema, and data contracts are 100% visible
        user_prompt_parts.append(
            f"=== FULL PRD SPECIFICATIONS & ARCHITECTURE BLUEPRINT ===\n{payload.prdMarkdown}"
        )
    if payload.coreFeatures:
        user_prompt_parts.append(
            f"=== CORE PRIORITY FEATURES ===\n{json.dumps(payload.coreFeatures, indent=2)}"
        )

    user_prompt = "\n\n".join(user_prompt_parts)

    try:
        data, _ = await gemini_service.generate_structured(
            system_prompt=TASKS_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema_class=TasksData,
        )
        return TasksGenerateResponse(data=data)
    except Exception as e:
        logger.error(f"Tasks generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tasks: {str(e)}",
        )

# 7. STRUKTUR GENERATION (React Flow / Mindmap Tree)
@router.post("/struktur", response_model=StrukturGenerateResponse)
async def generate_struktur(payload: StrukturGenerateRequest):
    user_prompt_parts = [
        f"App Name: {payload.appName or 'N/A'}",
        f"App Idea: {payload.appIdea}",
    ]
    if payload.dynamicAnswers:
        user_prompt_parts.append(
            f"=== PRODUCT SCOPE, TARGET AUDIENCE & BUSINESS REQUIREMENTS ===\n{json.dumps(payload.dynamicAnswers, indent=2)}"
        )
    if payload.prdMarkdown:
        user_prompt_parts.append(
            f"=== PRD CONTEXT (IF AVAILABLE) ===\n{payload.prdMarkdown}"
        )

    user_prompt_parts.append(
        "CRITICAL REMINDER: Output PURE functional product modules and sub-features based on the app idea and scope. DO NOT use technical package names, ORM names, or library installation commands in node labels or children."
    )
    user_prompt = "\n\n".join(user_prompt_parts)

    try:
        data, _ = await gemini_service.generate_structured(
            system_prompt=STRUKTUR_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema_class=StrukturData,
        )
        return StrukturGenerateResponse(data=data)
    except Exception as e:
        logger.error(f"Struktur generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate struktur: {str(e)}",
        )

# 8. EMBEDDINGS (Official Google Gemini gemini-embedding-001)
@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(payload: EmbeddingRequest):
    if not payload.texts:
        return EmbeddingResponse(embeddings=[], modelUsed=payload.model or "gemini-embedding-001", count=0)

    try:
        model = payload.model or "gemini-embedding-001"
        vectors = await gemini_service.embed_texts(payload.texts, model=model)
        return EmbeddingResponse(
            embeddings=vectors,
            modelUsed=model,
            count=len(vectors),
        )
    except Exception as e:
        logger.error(f"Embeddings generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate embeddings: {str(e)}",
        )

