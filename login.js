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

// Función para manejar la consulta de datos
async function consultarDatos(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Obtener los valores de los inputs
    const studentId = document.getElementById('studentId').value;
    const studentCode = document.getElementById('studentCode').value;

    try {
        // Construir la referencia al documento en Firestore
        const docRef = doc(db, String(studentId), String(studentCode));
        
        // Obtener el documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Mostrar los datos del documento
            console.log('Datos del documento:', docSnap.data());
			window.location.href = `prestamo.html?studentId=${encodeURIComponent(studentId)}&studentCode=${encodeURIComponent(studentCode)}`;
        } else {
            // Documento no existe
            console.log('No se encontró el documento.');
            alert('Datos incorrectos, por favor verifica tu información.');
        }
    } catch (error) {
        console.error('Error al consultar el documento:', error);
        alert('Error al realizar la consulta. Por favor intentelo de nuevo');
    }
}

// Añadir el listener al formulario
document.querySelector('.form').addEventListener('submit', consultarDatos);
