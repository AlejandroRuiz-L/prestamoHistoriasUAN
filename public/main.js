import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
        const numberDocRef = doc(db, 'historias', userNumber);
        getDoc(numberDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                document.getElementById('login').style.display = 'block'; // Mostrar botón de login
                localStorage.setItem('userNumber', userNumber); // Guardar el número en almacenamiento local
            } else {
                alert('Número no encontrado. Por favor ingrese un número válido.');
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
            localStorage.setItem('correo', user.email);//guardar el correo en almacenamiento local
            const docRef = doc(db, 'historias', localStorage.getItem('userNumber'));

            // Verifica si el documento del usuario existe y si el correo coincide antes de hacer la consulta
            getDoc(docRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (!data.correo === user.email || data.sanciones > 2) {
						// Cierra la sesión y limpia localStorage antes de mostrar el alert
                        signOut(auth).then(() => {
                            localStorage.clear();
                            updateUI(false);
                            alert('Datos incorrectos o demasiadas sanciones. Sesión finalizada!');
                        }).catch((error) => {
                            console.error('Error during sign-out:', error.message);
                        });
                    } else {
                        localStorage.setItem('estudiante', data.estudiante);//guardar el nombre del estudiante
                        // Actualiza la UI después del inicio de sesión
                        updateUI(true);
                    }
                } else {
                    // Maneja el caso en el que el documento no existe
                    alert('Número no encontrado. Por favor ingrese un número válido.');
                }
            }).catch((error) => {
                console.error('Error getting document:', error);
                alert("Se produjo un error al consultar los datos.");
            });
        })
        .catch((error) => {
            console.error('Error during sign-in:', error.message);
        });
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            localStorage.clear(); // Limpiar todo el almacenamiento local
            updateUI(false);
            console.log('User signed out');
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});

// Observa el estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        updateUI(true);
    } else {
        updateUI(false);
    }
});

// Actualiza la UI en función del estado de autenticación
function updateUI(isAuthenticated) {
    if (isAuthenticated) {
        document.getElementById('number-form').style.display = 'none';
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';
        document.getElementById('protected-content').style.display = 'block';
        
        // Obtener y mostrar datos del usuario
        const user = auth.currentUser;
        if (user) {
            const userNumber = localStorage.getItem('userNumber');
            if (userNumber) {
                const userDocRef = doc(db, 'historias', userNumber);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
						let title_b = document.querySelector('#bienvenida');//obtiene la bienvenida
                        const userDataText = document.getElementById('user-data');
                        userDataText.innerHTML = '';// Limpiar contenido previo
						
						
					    for (const [k, val] of Object.entries(userData)) {
							title_b.textContent = `Bienvenido ${userData.estudiante}`;//agrega nombre de estudiante a la bienvenida
							let div_clinica = document.createElement('div');//div principal(titulo-divHistoria)
							let title_clinica = document.createElement('h3');
							let title_clinicaText = '';
							let div_historia = document.createElement('div');
							
							if(typeof val === 'object'){
								for (const [key, value] of Object.entries(val)) {
									let historia = document.createElement('p');
							        let historia_text = '';
									let input_select = document.createElement('select');
									input_select.id = 'hora';
									let horarios = [
									    {value: "7am"},
										{},
										{}
									];
									let input_check = document.createElement('input');
									input_check.type = 'checkbox';
									input_check.id = `paciente${k}`;
									input_check.value = key;
									let label = document.createElement('label');
									label.htmlFor = `paciente${key}`;
									label.textContent = "Seleccionar historia: ";
									title_clinicaText = `Clínica de ${key}`;
									historia_text = `Documento: ${key}\nPaciente: ${value.paciente}\n`;
									historia.textContent = historia_text;
									historia.classList.add('background');
									historia.appendChild(label);
									historia.appendChild(input_check);
									div_historia.appendChild(historia);
								    console.log(k, key, value.paciente);
								}
								title_clinica.textContent = title_clinicaText;
								div_historia.classList.add('historias');
								div_clinica.appendChild(title_clinica);
								div_clinica.appendChild(div_historia);
								userDataText.appendChild(div_clinica);
							}
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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('historiaForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de manera predeterminada

        // Recoge todos los checkboxes seleccionados
        const selectedCheckboxes = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'));
        const selectedValues = selectedCheckboxes.map(checkbox => checkbox.value);
        const student = localStorage.getItem('estudiante');
        const codigo = localStorage.getItem('userNumber');
        const correo = localStorage.getItem('correo');

        // Configura los datos a enviar
        const dataToSend = {
			estudiante: student,
            solicitados: selectedValues,
            timestamp: serverTimestamp()
        };

        try {
            // Envía los datos a Firestore
            const docRef = doc(db, 'solicitudes', codigo);
            const docRefSnap = await getDoc(docRef);
            
            if (docRefSnap.exists()) {
                await setDoc(docRef, dataToSend, { merge: true });
                alert('Solicitud actualizada exitosamente');
            } else {
                await setDoc(docRef, dataToSend);
                alert('Solicitud creada exitosamente');
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
            alert('Hubo un problema al solicitar las historias.');
        }
    });
});
