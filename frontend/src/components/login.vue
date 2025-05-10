<template>
    <div class="login-container">
      <h1>SISTEMA DE INFORMACION</h1>
      <div class="form-group">
        <label>Usuario:</label>
        <input v-model="username" type="text" placeholder="admin" />
      </div>
      <div class="form-group">
        <label>Contraseña:</label>
        <input v-model="password" type="password" placeholder="1234abcd" />
      </div>
      <button @click="login">Ingresar</button>
      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import '../assets/login.css'
  
  const username = ref('')
  const password = ref('')
  const error = ref('')
  const router = useRouter()
  
  const login = () => {
    if (username.value === 'admin' && password.value === '1234abcd') {
      router.push('/apitester')
    } else {
      error.value = 'Credenciales inválidas'
    }
  }
  </script>
  