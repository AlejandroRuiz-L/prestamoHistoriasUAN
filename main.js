/*
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
  const patientIdText = document.getElementById('patientId').value.trim();
  const patientId = parseInt(patientIdText, 10);
  const studentName = document.getElementById('student').value.trim();
  const studentIdText = document.getElementById('studentId').value.trim();
  const studentId = parseInt(studentIdText, 10);
  const studentCodeText = document.getElementById('studentCode').value.trim();
  const studentCode = parseInt(studentCodeText, 10);
  const ortopediaChecked = document.getElementById('ortopedia').checked; // Obtener el estado del checkbox
  const ortopediaCode = ortopediaChecked ? document.getElementById('codigoOrtopedia').value.trim() : ''; // Obtener el código de ortopedia si el checkbox está marcado

  // Validar los datos
  if (!patientName || !patientId || !studentName || !studentId || !studentCode) {
    alert('Todos los campos son obligatorios.');
    return;
  }
  
  if (!/^\d+$/.test(patientId) || !/^\d+$/.test(studentId) || !/^\d+$/.test(studentCode) || (ortopediaChecked && !/^\d+$/.test(ortopediaCode))) {
    alert('Los campos de documentos, código y código de ortopedia deben ser números.');
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
    //console.log("Documento escrito con ID: ", patientId);
  } catch (e) {
    //console.error("Error añadiendo documento: ", e);
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

document.addEventListener('DOMContentLoaded', function() {
    // Obtener la fecha y hora actuales
    const now = new Date();

    // Formatear la fecha en el formato YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Formatear la hora en el formato HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    // Establecer valores por defecto y desactivar los campos
    document.getElementById('fecha').value = formattedDate;
    document.getElementById('hora').value = formattedTime;
    document.getElementById('fecha').disabled = true;
    document.getElementById('hora').disabled = true;
});
*/

// Importar las funciones necesarias desde Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

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
const functions = getFunctions(app);

// Función para manejar el envío del formulario
async function handleSubmit(event) {
    event.preventDefault(); // Evitar el envío por defecto del formulario

    // Capturar los valores del formulario
    const patientName = document.getElementById('patient').value.trim();
    const patientIdText = document.getElementById('patientId').value.trim();
    const patientId = parseInt(patientIdText, 10);
    const studentName = document.getElementById('student').value.trim();
    const studentIdText = document.getElementById('studentId').value.trim();
    const studentId = parseInt(studentIdText, 10);
    const studentCodeText = document.getElementById('studentCode').value.trim();
    const studentCode = parseInt(studentCodeText, 10);
    const ortopediaCodeText = document.getElementById('codigoOrtopedia').value.trim();
    const ortopediaCode = ortopediaCodeText ? parseInt(ortopediaCodeText, 10) : null;
    //const fecha = document.getElementById('fecha').value;
    //const hora = document.getElementById('hora').value;

    // Validar los datos
    if (!patientName || isNaN(patientId) || !studentName || isNaN(studentId) || isNaN(studentCode)) {
        alert('Por favor, asegúrate de que todos los campos numéricos contengan solo números.');
        return;
    }

    if (ortopediaCodeText && isNaN(ortopediaCode)) {
        alert('El código de ortopedia debe ser un número válido.');
        return;
    }

    try {
        // Definir la ruta del documento en Firestore
        const docRef = doc(db, studentId, createdAt: serverTimestamp());

        // Crear un objeto con los datos a enviar
        const data = {
            patientName,
            patientId,
            studentName,
            studentCode,
            ortopediaCode,
            updatedAt: serverTimestamp()  // Fecha y hora del servidor al crear
        };

        // Enviar los datos a Firebase Firestore
        await setDoc(docRef, data);

        alert('Formulario enviado con éxito!');
    } catch (e) {
        console.error("Error al enviar el formulario: ", e);
        alert('Hubo un problema al enviar el formulario. Inténtalo de nuevo.');
    }
}

// Función para mostrar/ocultar el campo de texto basado en el estado del checkbox
function toggleOrtopedia() {
    const ortopediaContainer = document.getElementById('divOrtopedia');
    const ortopediaCheckbox = document.getElementById('ortopedia');
    if (ortopediaCheckbox.checked) {
        ortopediaContainer.style.display = 'flex';
    } else {
        ortopediaContainer.style.display = 'none';
    }
}

// Asignar el manejador al formulario y otros eventos
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.form').addEventListener('submit', handleSubmit);
    document.getElementById('ortopedia').addEventListener('change', toggleOrtopedia);
});