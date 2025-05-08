const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Obtener todas las órdenes
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /order/{orderID}:
 *   get:
 *     summary: Obtener una orden por ID
 *     parameters:
 *       - name: orderID
 *         in: path
 *         required: true
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:orderID', async (req, res) => {
  const { orderID } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_order WHERE orderID = $1', [orderID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Crear una nueva orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               total:
 *                 type: number
 *               order_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Orden creada
 *       500:
 *         description: Error del servidor
 */
router.post('/', async (req, res) => {
  const { status, total, order_date } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_order (status, total, order_date) VALUES ($1, $2, $3) RETURNING *',
      [status, total, order_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /order/{orderID}:
 *   put:
 *     summary: Actualizar una orden por ID
 *     parameters:
 *       - name: orderID
 *         in: path
 *         required: true
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               total:
 *                 type: number
 *               order_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       404:
 *         description: Orden no encontrada para actualizar
 *       500:
 *         description: Error del servidor
 */
router.put('/:orderID', async (req, res) => {
  const { orderID } = req.params;
  const { status, total, order_date } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_order SET status = $1, total = $2, order_date = $3 WHERE orderID = $4 RETURNING *',
      [status, total, order_date, orderID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada para actualizar' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /order/{orderID}:
 *   delete:
 *     summary: Eliminar una orden por ID
 *     parameters:
 *       - name: orderID
 *         in: path
 *         required: true
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden eliminada correctamente
 *       404:
 *         description: Orden no encontrada para eliminar
 *       500:
 *         description: Error del servidor
 */
router.delete('/:orderID', async (req, res) => {
  const { orderID } = req.params;
  try {
    const result = await client.query('DELETE FROM tbl_order WHERE orderID = $1 RETURNING *', [orderID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada para eliminar' });
    }
    res.status(200).json({ message: 'Orden eliminada correctamente', deletedOrder: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
