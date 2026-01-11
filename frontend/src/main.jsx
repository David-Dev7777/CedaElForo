import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App }from './App' 
import './index.css'; // 🚨 ¡Verifica esta línea!
import './App.css';
 

//main de nuestro proyecto react , es el punto de entrada
const root = createRoot(document.getElementById('root'));
root.render(<App />);

  




