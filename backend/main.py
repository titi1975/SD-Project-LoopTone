from fastapi import FastAPI, Request, status
from fastapi.responses import HTMLResponse, JSONResponse
from scalar_fastapi import get_scalar_api_reference

# --- OS IMPORTS QUE HAVIAM SIDO APAGADOS VOLTARAM AQUI ---
from infra.database.database_config import engine
from infra.database.base_entity import Base
from shared.exceptions.base_exceptions import NotFoundException, BusinessRuleException
# ---------------------------------------------------------

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

app.include_router(user_router)
app.include_router(equipment_router)

@app.get("/scalar", include_in_schema=False)
async def scalar_html() -> HTMLResponse:
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)