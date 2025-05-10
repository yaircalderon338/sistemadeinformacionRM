const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Obtener todos los reportes con filtro por fecha
 *     parameters:
 *       - name: desde
 *         in: query
 *         description: Fecha de inicio del rango (formato: YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - name: hasta
 *         in: query
 *         description: Fecha de fin del rango (formato: YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de reportes
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  const { desde, hasta } = req.query;
  let query = 'SELECT * FROM tbl_reports';
  let values = [];

  if (desde && hasta) {
    query += ' WHERE report_date BETWEEN $1 AND $2';
    values = [desde, hasta];
  }

  try {
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: Obtener un reporte por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte encontrado
 *       404:
 *         description: Reporte no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_reports WHERE reportID = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Crear un nuevo reporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_date:
 *                 type: string
 *                 format: date
 *               report_data:
 *                 type: string
 *               adminid:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post('/', async (req, res) => {
  const { report_date, report_data, adminid } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_reports (report_date, report_data, adminid) VALUES ($1, $2, $3) RETURNING *',
      [report_date, report_data, adminid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /report/fechas/rango:
 *   get:
 *     summary: Obtener primera y última fecha de los reportes
 *     responses:
 *       200:
 *         description: Fechas obtenidas exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/fechas/rango', async (req, res) => {
  try {
    const result = await client.query(
      `SELECT 
        MIN(report_date) AS primera_fecha, 
        MAX(report_date) AS ultima_fecha 
       FROM tbl_reports`
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
