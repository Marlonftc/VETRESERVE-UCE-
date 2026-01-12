from app.core.database import Base, engine

# ⚠️ IMPORTAR MODELOS PARA QUE SQLALCHEMY LOS REGISTRE
from app.models.schedule import Schedule  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)


