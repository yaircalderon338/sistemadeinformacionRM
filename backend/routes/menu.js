const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @openapi
 * /menu:
 *   get:
 *     summary: Obtener todos los menús
 *     description: Devuelve una lista de todos los menús registrados en el sistema.
 *     responses:
 *       200:
 *         description: Lista de menús
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   menuid:
 *                     type: integer
 *                     example: 1
 *                   menuname:
 *                     type: string
 *                     example: "Menú Especial"
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_menu');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menu/{id}:
 *   get:
 *     summary: Obtener un menú por ID
 *     description: Devuelve los detalles de un menú específico utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del menú
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalles del menú
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuname:
 *                   type: string
 *                   example: "Menú Especial"
 *       404:
 *         description: Menú no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_menu WHERE menuid = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menu:
 *   post:
 *     summary: Crear un nuevo menú
 *     description: Crea un nuevo menú en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuname:
 *                 type: string
 *                 example: "Menú Especial"
 *     responses:
 *       201:
 *         description: Menú creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuname:
 *                   type: string
 *                   example: "Menú Especial"
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', async (req, res) => {
  const { menuname } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_menu (menuname) VALUES ($1) RETURNING *',
      [menuname]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menu/{id}:
 *   put:
 *     summary: Actualizar un menú
 *     description: Actualiza el nombre de un menú existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del menú a actualizar
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuname:
 *                 type: string
 *                 example: "Menú de Año Nuevo"
 *     responses:
 *       200:
 *         description: Menú actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuname:
 *                   type: string
 *                   example: "Menú de Año Nuevo"
 *       404:
 *         description: Menú no encontrado
 */
router.put('/:id', async (req, res) => {
  const { menuname } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_menu SET menuname = $1 WHERE menuid = $2 RETURNING *',
      [menuname, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menu/{id}:
 *   delete:
 *     summary: Eliminar un menú
 *     description: Elimina un menú utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del menú a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Menú eliminado correctamente
 *       404:
 *         description: Menú no encontrado
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await client.query('DELETE FROM tbl_menu WHERE menuid = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu no encontrado' });
    res.json({ message: 'Menu eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

