// Importar las funciones necesarias desde Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Configuración de Firebase (reemplaza con tu configuración real)
const firebaseConfig = {
  apiKey: "AIzaSyAR5IYoeJhbghJNAhQkGv97abaJNRM_dIk",
  authDomain: "prestamos-historias-uan.firebaseapp.com",
  projectId: "prestamos-historias-uan",
  storageBucket: "prestamos-historias-uan.appspot.com",
  messagingSenderId: "211491937606",
  appId: "1:211491937606:web:52aeded947686895fd5947",
  measurementId: "G-254LX31W1X"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para manejar el envío del formulario
async function handleSubmit(event) {
  event.preventDefault(); // Evitar el envío por defecto del formulario

  // Capturar los valores del formulario
  const patientName = document.getElementById('patient').value.trim();
  const patientId = document.getElementById('patientId').value.trim();
  const studentName = document.getElementById('student').value.trim();
  const studentId = document.getElementById('studentId').value.trim();
  const studentCode = document.getElementById('studentCode').value.trim();
  const ortopediaChecked = document.getElementById('ortopedia').checked; // Obtener el estado del checkbox
  const ortopediaCode = ortopediaChecked ? document.getElementById('codigoOrtopedia').value.trim() : ''; // Obtener el código de ortopedia si el checkbox está marcado

  // Validar los datos
  if (!patientName || !patientId || !studentName || !studentId || !studentCode) {
    alert('Todos los campos son obligatorios.');
    return;
  }
  
  if (!/^\d+$/.test(patientId) || !/^\d+$/.test(studentId) || !/^\d+$/.test(studentCode) || (ortopediaChecked && !/^\d+$/.test(ortopediaCode))) {
    alert('Los campos de documento, código y código de ortopedia deben ser números.');
    return;
  }

  try {
    // Definir la referencia al documento en Firestore
    const userDocRef = doc(db, `usuarios/${patientId}`);

    // Crear un objeto con los datos a enviar
    const data = {
      patient: patientName,
      student: {
        name: studentName,
        id: studentId,
        code: studentCode,
      }
    };

    // Si el checkbox está marcado, incluir el código de ortopedia
    if (ortopediaChecked) {
      data.ortopedia = parseInt(ortopediaCode, 10);
    }

    // Enviar los datos a Firebase Firestore
    await setDoc(userDocRef, data);
    alert('Formulario enviado con éxito!');
    console.log("Documento escrito con ID: ", patientId);
  } catch (e) {
    console.error("Error añadiendo documento: ", e);
    alert('Hubo un problema al enviar el formulario. Inténtalo de nuevo.');
  }
}

// Asignar el manejador al formulario
document.querySelector('.form').addEventListener('submit', handleSubmit);

// Función para mostrar/ocultar el campo de texto basado en el estado del checkbox
document.getElementById('ortopedia').addEventListener('change', function() {
  const ortopediaContainer = document.getElementById('divOrtopedia');
  if (this.checked) {
    ortopediaContainer.style.display = 'flex';
  } else {
    ortopediaContainer.style.display = 'none';
  }
});