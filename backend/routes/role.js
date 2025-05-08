const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @swagger
 * /role:
 *   get:
 *     summary: Obtener todos los roles
 *     responses:
 *       200:
 *         description: Lista de roles
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_role');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /role/{role}:
 *   get:
 *     summary: Obtener un rol por su nombre
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Nombre del rol (insensible a mayúsculas)
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:role', async (req, res) => {
  const { role } = req.params; // Obtiene el parámetro `role` desde la URL
  try {
    const result = await client.query(
      'SELECT * FROM tbl_role WHERE LOWER(role) = LOWER($1)',
      [role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Rol "${role}" no encontrado` });
    }

    res.json(result.rows[0]); // Devuelve el rol encontrado
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Crear un nuevo rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.post('/', async (req, res) => {
  const { role } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_role (role) VALUES ($1) RETURNING *',
      [role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /role/{role}:
 *   put:
 *     summary: Actualizar un rol por su nombre
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Nombre del rol a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRole:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       404:
 *         description: Rol no encontrado para actualizar
 *       500:
 *         description: Error del servidor
 */
router.put('/:role', async (req, res) => {
  const { role } = req.params;
  const { newRole } = req.body; // Aquí asumimos que pasas el nuevo rol en el cuerpo de la solicitud
  try {
    const result = await client.query(
      'UPDATE tbl_role SET role = $1 WHERE LOWER(role) = LOWER($2) RETURNING *',
      [newRole, role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Rol "${role}" no encontrado para actualizar` });
    }

    res.json(result.rows[0]); // Devuelve el rol actualizado
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /role/{role}:
 *   delete:
 *     summary: Eliminar un rol por su nombre
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: Nombre del rol a eliminar
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *       404:
 *         description: Rol no encontrado para eliminar
 *       500:
 *         description: Error del servidor
 */
router.delete('/:role', async (req, res) => {
  const { role } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM tbl_role WHERE LOWER(role) = LOWER($1) RETURNING *',
      [role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Rol "${role}" no encontrado para eliminar` });
    }

    res.json({ message: `Rol "${role}" eliminado correctamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

