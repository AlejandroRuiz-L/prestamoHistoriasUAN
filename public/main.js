import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Configura Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAR5IYoeJhbghJNAhQkGv97abaJNRM_dIk",
    authDomain: "prestamos-historias-uan.firebaseapp.com",
    projectId: "prestamos-historias-uan",
    storageBucket: "prestamos-historias-uan.appspot.com",
    messagingSenderId: "211491937606",
    appId: "1:211491937606:web:52aeded947686895fd5947",
    measurementId: "G-254LX31W1X"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Maneja la entrada del número del usuario
document.getElementById('submit-number').addEventListener('click', () => {
    const userNumber = document.getElementById('user-number').value.trim();
    if (userNumber) {
        // Verifica si el número ingresado existe en Firestore
        const numberDocRef = doc(db, 'users', userNumber);
        getDoc(numberDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                document.getElementById('login').style.display = 'block'; // Mostrar botón de login
                localStorage.setItem('userNumber', userNumber); // Guardar el número en localStorage
            } else {
                alert('Number not found. Please check and enter a valid number.');
            }
        }).catch((error) => {
            console.error('Error checking document:', error);
            alert("Se produjo un error al consultar el código.");
        });
    } else {
        alert('Please enter a valid number.');
    }
});

// Maneja el inicio de sesión con Google
document.getElementById('login').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('User:', user);

            // Recupera el número de usuario del almacenamiento local
            const userNumber = localStorage.getItem('userNumber');
            
            if (userNumber) {
                // Solo actualiza el documento si el número existe
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        // Actualiza el campo `userNumber` en el documento del usuario
                        setDoc(userDocRef, { userNumber }, { merge: true })
                            .then(() => {
                                console.log('User number updated in Firestore');
                                updateUI(true, user.uid);
                            })
                            .catch((error) => {
                                console.error('Error updating document:', error);
                            });
                    } else {
                        console.error('User document does not exist.');
                    }
                }).catch((error) => {
                    console.error('Error getting user document:', error);
                });

                // Limpia el número de usuario del almacenamiento local
                localStorage.removeItem('userNumber');
            }
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
            updateUI(false);
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});

// Observa el estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        updateUI(true, user.uid);
    } else {
        updateUI(false);
    }
});

// Actualiza la UI en función del estado de autenticación
function updateUI(isAuthenticated, uid = null) {
    if (isAuthenticated) {
        document.getElementById('number-form').style.display = 'none';
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';
        document.getElementById('protected-content').style.display = 'block';
        
        if (uid) {
            // Obtener y mostrar datos del usuario
            const userNumber = localStorage.getItem('userNumber');
            if (userNumber) {
                const userDocRef = doc(db, 'users', userNumber);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
						const userDataText = document.getElementById('user-data');
						for (const [key, value] of Object.entries(userData)) {
							let div = document.createElement('div');
							let input_check = document.createElement('input');
							input_check.type = 'checkbox';
							input_check.id = `paciente${key}`;
							input_check.value = `${key}`;
							const label = document.createElement('label');
							label.htmlFor = `paciente${key}`;
							label.textContent = 'Seleccionar historia:';
							let texto = document.createElement('p');
							let output = '';
                            output += `Documento: ${key}\n`;
                            output += `Paciente: ${value.nombrePaciente || 'N/A'}\n`;
                            output += `Estudiante: ${value.nombreEstudiante || 'N/A'}\n`;
                            output += `Código Estudiante: ${value.codigoEstudiante || 'N/A'}\n`;
							output += `Código Ortopedia: ${value.codigoOrtopedia || 'N/A'}\n`;
							div.classList.add('form');
							texto.textContent = output;
							div.appendChild(texto);
							div.appendChild(label);
							div.appendChild(input_check);
                            userDataText.appendChild(div);
						}
                    } else {
                        document.getElementById('user-data').textContent = 'No data available for this number.';
                    }
                }).catch((error) => {
                    console.error('Error getting document:', error);
                    document.getElementById('user-data').textContent = 'Error retrieving data.';
                });
            }
        }
    } else {
        document.getElementById('number-form').style.display = 'block';
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'none';
        document.getElementById('protected-content').style.display = 'none';
    }
}
