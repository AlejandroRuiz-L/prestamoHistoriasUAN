// Importar las funciones necesarias desde Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
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
		//referencia a la collecion y documento 
        const docRef = doc(db, String(studentId), String(patientId));

        const docSnapshot = await getDoc(docRef);
		
		//comprobacion de existencia de la coleccion y documento consultado
        if (docSnapshot.exists()) {
            await updateDoc(docRef, {
                updateAt: serverTimestamp()
            });
            alert('Solicitud actualizada exitosamente!');
        } else {
            const data = {
                patient: { patientName, patientId, ortopediaCode },
                student: { studentName, studentId, studentCode },
                createdAt: serverTimestamp(),
                updateAt: serverTimestamp()
            };

            await setDoc(docRef, data);
            alert('Solicitud enviada con éxito!');
        }
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