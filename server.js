require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sql, getPool, init } = require('./db-mssql');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Storage for files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ts = new Date().toISOString().replace(/[-:TZ\.]/g,'');
    cb(null, ts + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

function genRef(){
  const ts = new Date().toISOString().replace(/[-:TZ\.]/g,'');
  return 'IRO-' + ts.substring(0,8) + '-' + ts.substring(8,14);
}

app.post('/api/incidents', upload.array('pieces'), async (req, res) => {
  try {
    const b = req.body || {};
    const ref = (b.reference && b.reference.trim()) || genRef();
    const perte = b.montantPerte ? Number(String(b.montantPerte).replace(',', '.')) : null;
    const recup = b.montantRecuperable ? Number(String(b.montantRecuperable).replace(',', '.')) : null;

    const pool = await getPool();

    // Insert incident
    const r = await pool.request()
      .input('reference', sql.NVarChar(64), ref)
      .input('entite', sql.NVarChar(255), b.entite || null)
      .input('declarant', sql.NVarChar(255), b.declarant || null)
      .input('date_survenance', sql.Date, b.dateSurvenance || null)
      .input('date_constatation', sql.Date, b.dateConstatation || null)
      .input('date_declaration', sql.Date, b.dateDeclaration || null)
      .input('nature', sql.NVarChar(255), b.nature || null)
      .input('description', sql.NVarChar(sql.MAX), b.description || null)
      .input('type_evenement', sql.NVarChar(255), b.typeEvenement || null)
      .input('impacts', sql.NVarChar(255), b.impacts || null)
      .input('montant_perte', sql.Decimal(18,2), perte)
      .input('montant_recuperable', sql.Decimal(18,2), recup)
      .input('impact_qualitatif', sql.NVarChar(255), b.impactQualitatif || null)
      .input('causes', sql.NVarChar(sql.MAX), b.causes || null)
      .input('actions', sql.NVarChar(sql.MAX), b.actions || null)
      .input('observations', sql.NVarChar(sql.MAX), b.observations || null)
      .query(`INSERT INTO dbo.incidents (
        reference, entite, declarant, date_survenance, date_constatation, date_declaration,
        nature, description, type_evenement, impacts, montant_perte, montant_recuperable,
        impact_qualitatif, causes, actions, observations
      ) OUTPUT INSERTED.id VALUES (
        @reference, @entite, @declarant, @date_survenance, @date_constatation, @date_declaration,
        @nature, @description, @type_evenement, @impacts, @montant_perte, @montant_recuperable,
        @impact_qualitatif, @causes, @actions, @observations
      )`);

    const incidentId = r.recordset[0].id;

    // Insert files metadata
    const files = req.files || [];
    for (const f of files){
      await pool.request()
        .input('incident_id', sql.Int, incidentId)
        .input('filename', sql.NVarChar(512), f.originalname)
        .input('path', sql.NVarChar(1024), f.path)
        .input('size', sql.BigInt, f.size)
        .query(`INSERT INTO dbo.files (incident_id, filename, path, size) VALUES (@incident_id, @filename, @path, @size)`);
    }

    return res.json({ ok: true, id: incidentId, reference: ref });
  } catch (err){
    console.error('POST /api/incidents error', err);
    return res.status(500).json({ ok:false, error: err.message });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query(`SELECT id, reference, entite, declarant, date_survenance, date_constatation, type_evenement, impacts, created_at FROM dbo.incidents ORDER BY id DESC`);
    res.json({ ok:true, data: r.recordset });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

app.get('/api/incidents/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    const inc = await pool.request().input('id', sql.Int, id).query(`SELECT * FROM dbo.incidents WHERE id = @id`);
    if (!inc.recordset.length) return res.status(404).json({ ok:false, error:'Not found' });
    const files = await pool.request().input('id', sql.Int, id).query(`SELECT id, filename, path, size, uploaded_at FROM dbo.files WHERE incident_id = @id`);
    res.json({ ok:true, data: { incident: inc.recordset[0], files: files.recordset } });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

init().then(() => {
  app.listen(PORT, () => console.log('API IRO (SQL Server) sur http://localhost:'+PORT));
}).catch(err => {
  console.error('Échec initialisation SQL Server:', err);
  process.exit(1);
});
