const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @openapi
 * /menuitem:
 *   get:
 *     summary: Obtener todos los ítems del menú
 *     description: Devuelve una lista de todos los ítems del menú registrados en el sistema.
 *     responses:
 *       200:
 *         description: Lista de ítems del menú
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemid:
 *                     type: integer
 *                     example: 1
 *                   menuid:
 *                     type: integer
 *                     example: 1
 *                   menuitemname:
 *                     type: string
 *                     example: "Sushi"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 15.99
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_menuitem');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menuitem/{id}:
 *   get:
 *     summary: Obtener un ítem del menú por ID
 *     description: Devuelve los detalles de un ítem del menú específico utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del ítem del menú
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalles del ítem del menú
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 itemid:
 *                   type: integer
 *                   example: 1
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuitemname:
 *                   type: string
 *                   example: "Sushi"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 15.99
 *       404:
 *         description: Ítem del menú no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_menuitem WHERE itemid = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu item no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menuitem:
 *   post:
 *     summary: Crear un nuevo ítem del menú
 *     description: Crea un nuevo ítem en el menú.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuid:
 *                 type: integer
 *                 example: 1
 *               menuitemname:
 *                 type: string
 *                 example: "Sushi"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 15.99
 *     responses:
 *       201:
 *         description: Ítem del menú creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 itemid:
 *                   type: integer
 *                   example: 1
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuitemname:
 *                   type: string
 *                   example: "Sushi"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 15.99
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', async (req, res) => {
  const { menuid, menuitemname, price } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_menuitem (menuid, menuitemname, price) VALUES ($1, $2, $3) RETURNING *',
      [menuid, menuitemname, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menuitem/{id}:
 *   put:
 *     summary: Actualizar un ítem del menú
 *     description: Actualiza el nombre y el precio de un ítem del menú existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del ítem del menú a actualizar
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
 *               menuid:
 *                 type: integer
 *                 example: 1
 *               menuitemname:
 *                 type: string
 *                 example: "Sushi Especial"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 19.99
 *     responses:
 *       200:
 *         description: Ítem del menú actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 itemid:
 *                   type: integer
 *                   example: 1
 *                 menuid:
 *                   type: integer
 *                   example: 1
 *                 menuitemname:
 *                   type: string
 *                   example: "Sushi Especial"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 19.99
 *       404:
 *         description: Ítem del menú no encontrado
 */
router.put('/:id', async (req, res) => {
  const { menuid, menuitemname, price } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_menuitem SET menuid = $1, menuitemname = $2, price = $3 WHERE itemid = $4 RETURNING *',
      [menuid, menuitemname, price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu item no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /menuitem/{id}:
 *   delete:
 *     summary: Eliminar un ítem del menú
 *     description: Elimina un ítem del menú utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del ítem del menú a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ítem del menú eliminado correctamente
 *       404:
 *         description: Ítem del menú no encontrado
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await client.query('DELETE FROM tbl_menuitem WHERE itemid = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Menu item no encontrado' });
    res.json({ message: 'Menu item eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
