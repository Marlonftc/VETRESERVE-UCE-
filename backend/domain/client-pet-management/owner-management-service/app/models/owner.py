from sqlalchemy import Column, Integer, String
from app.core.database import Base



class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
     
    user_id = Column(Integer, nullable=False,index=True)
   