from fastapi import FastAPI, Request, status
from fastapi.responses import HTMLResponse, JSONResponse
from scalar_fastapi import get_scalar_api_reference

# --- OS IMPORTS DE INFRA E EXCEÇÕES ---
from infra.database.database_config import engine
from infra.database.base_entity import Base
# CORREÇÃO 1: Adicionamos o UnauthorizedException aqui!
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException, UnauthorizedException
# ---------------------------------------------------------

# --- IMPORTS DOS ROTEADORES ---
# CORREÇÃO 2: Importamos o router do módulo de autenticação para o Login funcionar
from modules.auth.controllers.auth_controller import router as auth_router
from modules.user.controllers.user_controller import router as user_router
from modules.equipment.controllers.equipment_controller import router as equipment_router

from modules.user.entities.user_entity import UserEntity
from modules.equipment.entities.equipment_entity import EquipmentEntity

# IMPORTAÇÃO DA NOSSA DOCUMENTAÇÃO AUXILIAR
from shared.documentation.api_docs import API_TITLE, API_DESCRIPTION, API_VERSION, TAGS_METADATA

Base.metadata.create_all(bind=engine)

# INJETANDO OS METADADOS NO FASTAPI
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    openapi_tags=TAGS_METADATA # Aplica as descrições nas tags laterais
)

# --- HANDLERS DE EXCEÇÕES ---

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": exc.message},
    )

@app.exception_handler(BusinessRuleException)
async def business_rule_exception_handler(request: Request, exc: BusinessRuleException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": exc.message},
    )

@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request: Request, exc: UnauthorizedException):
    """Converte falhas de autenticação para HTTP 401."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"message": exc.message},
        # O header WWW-Authenticate é um padrão da web para respostas 401
        headers={"WWW-Authenticate": "Bearer"}, 
    )

# --- REGISTRO DOS ROTEADORES NA APLICAÇÃO ---
app.include_router(auth_router)  # <-- Rota de Auth registrada!
app.include_router(user_router)
app.include_router(equipment_router)

# --- DOCUMENTAÇÃO SCALAR ---
@app.get("/scalar", include_in_schema=False)
async def scalar_html() -> HTMLResponse:
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)