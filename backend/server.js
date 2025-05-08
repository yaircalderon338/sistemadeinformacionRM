const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('./db');

// Importar Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path'); // Se importa el módulo path

// Crear instancia de express
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Cargar documentación Swagger desde archivo YAML
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importar rutas
const adminRoutes = require('./routes/admin');
const menuRoutes = require('./routes/menu');
const menuitemRoutes = require('./routes/menuitem');
const orderRoutes = require('./routes/order');
const orderdetailRoutes = require('./routes/orderdetail');
const staffRoutes = require('./routes/staff');
const reportsRoutes = require('./routes/reports');
const roleRoutes = require('./routes/role');

// Usar rutas
app.use('/admin', adminRoutes);
app.use('/menu', menuRoutes);
app.use('/menuitem', menuitemRoutes);
app.use('/order', orderRoutes);
app.use('/orderdetail', orderdetailRoutes);
app.use('/staff', staffRoutes);
app.use('/reports', reportsRoutes);
app.use('/role', roleRoutes);

// Ruta de prueba para verificar que Express arranca
app.get('/', (req, res) => {
  res.send('🚀 Express alive!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación Swagger disponible en http://localhost:${port}/api-docs`);
});
