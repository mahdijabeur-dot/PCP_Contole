const sql = require('mssql');

const cfg = {
  server: process.env.SQLSERVER_HOST || 'localhost',
  port: parseInt(process.env.SQLSERVER_PORT || '1433', 10),
  database: process.env.SQLSERVER_DB || 'riskops',
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || 'Your_password123',
  options: {
    encrypt: (process.env.SQLSERVER_ENCRYPT || 'false') === 'true',
    trustServerCertificate: (process.env.SQLSERVER_TRUST_CERT || 'true') === 'true',
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let poolPromise;
async function getPool(){
  if (!poolPromise){
    poolPromise = sql.connect(cfg);
  }
  return poolPromise;
}

async function init(){
  const pool = await getPool();
  // Create tables if not exist
  await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'incidents')
    BEGIN
      CREATE TABLE dbo.incidents (
        id INT IDENTITY(1,1) PRIMARY KEY,
        reference NVARCHAR(64) UNIQUE NOT NULL,
        entite NVARCHAR(255) NULL,
        declarant NVARCHAR(255) NULL,
        date_survenance DATE NULL,
        date_constatation DATE NULL,
        date_declaration DATE NULL,
        nature NVARCHAR(255) NULL,
        description NVARCHAR(MAX) NULL,
        type_evenement NVARCHAR(255) NULL,
        impacts NVARCHAR(255) NULL,
        montant_perte DECIMAL(18,2) NULL,
        montant_recuperable DECIMAL(18,2) NULL,
        impact_qualitatif NVARCHAR(255) NULL,
        causes NVARCHAR(MAX) NULL,
        actions NVARCHAR(MAX) NULL,
        observations NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END`);

  await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'files')
    BEGIN
      CREATE TABLE dbo.files (
        id INT IDENTITY(1,1) PRIMARY KEY,
        incident_id INT NOT NULL,
        filename NVARCHAR(512) NOT NULL,
        path NVARCHAR(1024) NOT NULL,
        size BIGINT NULL,
        uploaded_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_files_incidents FOREIGN KEY (incident_id) REFERENCES dbo.incidents(id)
      );
    END`);
}

module.exports = { sql, getPool, init };
