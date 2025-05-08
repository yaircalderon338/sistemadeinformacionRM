const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @swagger
 * /orderdetail:
 *   get:
 *     summary: Obtener todos los detalles de las órdenes
 *     responses:
 *       200:
 *         description: Lista de detalles de las órdenes
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_orderdetail');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orderdetail/{orderDetailID}:
 *   get:
 *     summary: Obtener un detalle de orden por su ID
 *     parameters:
 *       - name: orderDetailID
 *         in: path
 *         required: true
 *         description: ID del detalle de la orden
 *     responses:
 *       200:
 *         description: Detalle de la orden encontrado
 *       404:
 *         description: Detalle de la orden no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:orderDetailID', async (req, res) => {
  const { orderDetailID } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_orderdetail WHERE orderDetailID = $1', [orderDetailID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle de orden no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orderdetail:
 *   post:
 *     summary: Crear un nuevo detalle de orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderID:
 *                 type: integer
 *               itemID:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Detalle de orden creado
 *       500:
 *         description: Error del servidor
 */
router.post('/', async (req, res) => {
  const { orderID, itemID, quantity } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_orderdetail (orderID, itemID, quantity) VALUES ($1, $2, $3) RETURNING *',
      [orderID, itemID, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orderdetail/{orderDetailID}:
 *   put:
 *     summary: Actualizar un detalle de orden por su ID
 *     parameters:
 *       - name: orderDetailID
 *         in: path
 *         required: true
 *         description: ID del detalle de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderID:
 *                 type: integer
 *               itemID:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Detalle de la orden actualizado
 *       404:
 *         description: Detalle de la orden no encontrado para actualizar
 *       500:
 *         description: Error del servidor
 */
router.put('/:orderDetailID', async (req, res) => {
  const { orderDetailID } = req.params;
  const { orderID, itemID, quantity } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_orderdetail SET orderID = $1, itemID = $2, quantity = $3 WHERE orderDetailID = $4 RETURNING *',
      [orderID, itemID, quantity, orderDetailID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle de orden no encontrado para actualizar' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orderdetail/{orderDetailID}:
 *   delete:
 *     summary: Eliminar un detalle de orden por su ID
 *     parameters:
 *       - name: orderDetailID
 *         in: path
 *         required: true
 *         description: ID del detalle de la orden
 *     responses:
 *       200:
 *         description: Detalle de la orden eliminado correctamente
 *       404:
 *         description: Detalle de la orden no encontrado para eliminar
 *       500:
 *         description: Error del servidor
 */
router.delete('/:orderDetailID', async (req, res) => {
  const { orderDetailID } = req.params;
  try {
    const result = await client.query('DELETE FROM tbl_orderdetail WHERE orderDetailID = $1 RETURNING *', [orderDetailID]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle de orden no encontrado para eliminar' });
    }
    res.status(200).json({ message: 'Detalle de orden eliminado correctamente', deletedOrderDetail: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
