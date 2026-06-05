from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from scalar_fastapi import get_scalar_api_reference

# Importações de Domínio e Infra
from infra.database.database_config import engine
from infra.database.base_entity import Base
from modules.auth.controllers.auth_controller import router as auth_router
from modules.equipment.controllers.equipment_controller import router as equipment_router
from modules.user.controllers.user_controller import router as user_router
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException

# Cria as tabelas físicas no banco de dados. 
# NOTA PARA O FUTURO: Em um projeto real/produção, substitua isso pelo Alembic (Migrations).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Clean Architecture Python API",
    description="API com design robusto baseada em princípios SOLID e estruturação em módulos.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- TRATAMENTO GLOBAL DE EXCEÇÕES ---

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    """Converte exceções de 'Não Encontrado' do domínio para HTTP 404."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": exc.message},
    )

@app.exception_handler(BusinessRuleException)
async def business_rule_exception_handler(request: Request, exc: BusinessRuleException):
    """Converte violações de regra de negócio do domínio para HTTP 400."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": exc.message},
    )

# ---------------------------------------

# Registrando os Controllers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(equipment_router)

# Configuração da Documentação via Scalar
@app.get("/scalar", include_in_schema=False)
async def scalar_html() -> HTMLResponse:
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
