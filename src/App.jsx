import { useState } from 'react'
import { Articulo } from './components/pages/Articulo'
import { Articulos } from './components/pages/Articulos'
import { Crear } from './components/pages/Crear'
import { Inicio } from './components/pages/Inicio'


function App() {

  return (
    <div className="App">
      <h1> probando </h1>

      <Inicio></Inicio>
      <Articulos/>
      <Articulo/>
      <Crear/>
    </div>
  )
}

export default App
