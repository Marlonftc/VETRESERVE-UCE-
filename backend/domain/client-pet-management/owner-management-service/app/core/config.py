import os

SQLSERVER_HOST = os.getenv("SQLSERVER_HOST", "localhost")
SQLSERVER_PORT = os.getenv("SQLSERVER_PORT", "1433")
SQLSERVER_DB = os.getenv("SQLSERVER_DB", "vetreserve_clientpet")
SQLSERVER_USER = os.getenv("SQLSERVER_USER", "sa")
SQLSERVER_PASSWORD = os.getenv("SQLSERVER_PASSWORD", "YourStrong!Passw0rd")

SQLSERVER_DRIVER = "ODBC Driver 17 for SQL Server"
