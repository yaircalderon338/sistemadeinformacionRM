<template>
  <div class="api-tester">
    <h1>Sistema de Información Restaurante</h1>

    <div class="form-group">
      <label>Acción:</label>
      <select v-model="accion" @change="resetForm">
        <option value="visualizar">Visualizar</option>
        <option value="eliminar">Eliminar</option>
        <option value="modificar">Modificar</option>
        <option value="agregar">Agregar</option>
      </select>
    </div>

    <div class="form-group">
      <label>Tabla:</label>
      <select v-model="tabla" @change="resetForm">
        <option value="admin">Admin</option>
        <option value="menu">Menu</option>
        <option value="menuitem">MenuItem</option>
        <option value="order">Order</option>
        <option value="orderdetail">OrderDetail</option>
        <option value="reports">Reports</option>
        <option value="role">Role</option>
        <option value="staff">Staff</option>
      </select>
    </div>

    <div class="form-group" v-if="accion !== 'agregar'">
      <label>Consulta por:</label>
      <select v-model="modoConsulta">
        <option value="todos">Todos</option>
        <option value="id">Por ID</option>
      </select>
    </div>

    <div class="form-group" v-if="modoConsulta === 'id' && accion !== 'agregar'">
      <label>ID:</label>
      <input v-model="id" placeholder="Ingrese ID" />
    </div>

    <div v-if="accion === 'agregar' || accion === 'modificar'" class="form-dinamico">
      <h3>Datos:</h3>
      <div v-if="accion === 'modificar'" class="form-group">
        <label>ID:</label>
        <input v-model="formData.id" placeholder="ID a modificar" />
      </div>

      <div v-for="(campo, key) in camposFormulario" :key="key" class="form-group">
        <label>{{ campo.label }}:</label>
        <input v-model="formData[campo.nombre]" :placeholder="campo.placeholder" />
      </div>
    </div>

    <button @click="realizarAccion">Enviar</button>
    <button class="cerrar-sesion-btn" @click="cerrarSesion">Cerrar Sesión</button>

    <button class="toggle-respuesta-btn" @click="toggleRespuesta">
      {{ mostrarRespuesta ? 'Ocultar' : 'Mostrar' }} Respuesta
    </button>

    <div v-if="mostrarRespuesta" class="respuesta">
      <h2>Respuesta:</h2>

      <div v-if="Array.isArray(respuesta)">
        <table v-if="respuesta.length > 0">
          <thead>
            <tr>
              <th v-for="(valor, key) in respuesta[0]" :key="key">{{ key }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in respuestaPaginada" :key="index">
              <td v-for="(valor, key) in item" :key="key">{{ valor }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No se encontraron registros.</p>

        <div class="paginacion" v-if="totalPaginas > 1">
          <button @click="paginaAnterior" :disabled="paginaActual === 1">← Anterior</button>
          <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas">Siguiente →</button>
        </div>
      </div>

      <div v-else-if="typeof respuesta === 'object' && respuesta !== null">
        <ul>
          <li v-for="(valor, key) in respuesta" :key="key">
            <strong>{{ key }}:</strong> {{ valor }}
          </li>
        </ul>
      </div>

      <div v-else>
        <p>{{ respuesta }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import '../assets/tester.css'

const router = useRouter()

const accion = ref('visualizar')
const tabla = ref('admin')
const modoConsulta = ref('todos')
const id = ref('')
const respuesta = ref('')

const formData = ref({})
const mostrarRespuesta = ref(true)

const toggleRespuesta = () => {
  mostrarRespuesta.value = !mostrarRespuesta.value
}

const camposPorTabla = {
  admin: [
    { nombre: 'username', label: 'Usuario', placeholder: 'Usuario' },
    { nombre: 'password', label: 'Contraseña', placeholder: 'Contraseña' }
  ],
  menu: [
    { nombre: 'menuName', label: 'Nombre del menú', placeholder: 'Nombre' }
  ],
  menuitem: [
    { nombre: 'menuid', label: 'ID de Menú', placeholder: 'menuid' },
    { nombre: 'menuitemname', label: 'Nombre del item', placeholder: 'Item' },
    { nombre: 'price', label: 'Precio', placeholder: 'Precio' }
  ],
  order: [
    { nombre: 'status', label: 'Estado', placeholder: 'Estado' },
    { nombre: 'total', label: 'Total', placeholder: 'Total' },
    { nombre: 'order_date', label: 'Fecha (YYYY-MM-DD)', placeholder: 'Fecha' }
  ],
  orderdetail: [
    { nombre: 'orderID', label: 'Order ID', placeholder: 'orderID' },
    { nombre: 'itemID', label: 'Item ID', placeholder: 'itemID' },
    { nombre: 'quantity', label: 'Cantidad', placeholder: 'Cantidad' }
  ],
  reports: [
    { nombre: 'report_date', label: 'Fecha (YYYY-MM-DD)', placeholder: 'Fecha' },
    { nombre: 'report_data', label: 'Datos', placeholder: 'Datos del reporte' },
    { nombre: 'adminid', label: 'Admin ID', placeholder: 'adminid' }
  ],
  role: [
    { nombre: 'role', label: 'Rol', placeholder: 'chef, Mesero, etc.' }
  ],
  staff: [
    { nombre: 'username', label: 'Usuario', placeholder: 'Usuario' },
    { nombre: 'password', label: 'Contraseña', placeholder: 'Contraseña' },
    { nombre: 'status', label: 'Estado', placeholder: 'Online/Offline' },
    { nombre: 'role', label: 'Rol', placeholder: 'chef/Mesero' }
  ]
}

const camposFormulario = computed(() => {
  return camposPorTabla[tabla.value] || []
})

const resetForm = () => {
  formData.value = {}
  id.value = ''
  paginaActual.value = 1
  respuesta.value = ''
}

const realizarAccion = async () => {
  let url = `http://localhost:3000/${tabla.value}`
  const options = {}

  try {
    if (accion.value === 'visualizar') {
      options.method = 'GET'
      if (modoConsulta.value === 'id') {
        if (!id.value) {
          respuesta.value = 'Debes ingresar un ID.'
          return
        }
        url += `/${id.value}`
      }
    }

    if (accion.value === 'eliminar') {
      if (!id.value) {
        respuesta.value = 'Debes ingresar un ID para eliminar.'
        return
      }
      url += `/${id.value}`
      options.method = 'DELETE'
    }

    if (accion.value === 'agregar') {
      options.method = 'POST'
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(formData.value)
    }

    if (accion.value === 'modificar') {
      if (!formData.value.id) {
        respuesta.value = 'Debes ingresar el ID a modificar.'
        return
      }
      url += `/${formData.value.id}`
      const { id: idField, ...datosModificados } = formData.value
      options.method = 'PUT'
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(datosModificados)
    }

    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    respuesta.value = data
    paginaActual.value = 1

  } catch (err) {
    respuesta.value = `Error: ${err.message}`
  }
}

const cerrarSesion = () => {
  router.push('/login')
}

const paginaActual = ref(1)
const itemsPorPagina = 5

const respuestaPaginada = computed(() => {
  if (Array.isArray(respuesta.value)) {
    const inicio = (paginaActual.value - 1) * itemsPorPagina
    const fin = inicio + itemsPorPagina
    return respuesta.value.slice(inicio, fin)
  }
  return []
})

const totalPaginas = computed(() => {
  return Array.isArray(respuesta.value)
    ? Math.ceil(respuesta.value.length / itemsPorPagina)
    : 1
})

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++
}

const paginaAnterior = () => {
  if (paginaActual.value > 1) paginaActual.value--
}
</script>
