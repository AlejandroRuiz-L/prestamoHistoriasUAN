import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, GoogleAuthProvider, getIdToken, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Configura Firebase
const firebaseConfig1 = {
    apiKey: "AIzaSyAR5IYoeJhbghJNAhQkGv97abaJNRM_dIk",
    authDomain: "prestamos-historias-uan.firebaseapp.com",
    projectId: "prestamos-historias-uan",
    storageBucket: "prestamos-historias-uan.appspot.com",
    messagingSenderId: "211491937606",
    appId: "1:211491937606:web:52aeded947686895fd5947",
    measurementId: "G-254LX31W1X"
};

// Inicializa la primera instancia de Firebase
const app1 = initializeApp(firebaseConfig1, 'app1');
const auth1 = getAuth(app1);
const db1 = getFirestore(app1);
const provider = new GoogleAuthProvider();

// Configura la segunda instancia de Firebase
const firebaseConfig2 = {
    apiKey: "AIzaSyD2MTUAKDXVPuoq_4l-5iYf1Mf-q4VoCI8",
    authDomain: "prestamos-historias-uan-db2.firebaseapp.com",
    projectId: "prestamos-historias-uan-db2",
    storageBucket: "prestamos-historias-uan-db2.appspot.com",
    messagingSenderId: "321730191089",
    appId: "1:321730191089:web:db45bfbe1c7fac2c80d350",
    measurementId: "G-YXD17DHHEN"
};

const app2 = initializeApp(firebaseConfig2, 'app2');
const auth2 = getAuth(app2)
const db2 = getFirestore(app2);

// Maneja la entrada del número del usuario
document.getElementById('submit-number').addEventListener('click', () => {
    const userNumber = document.getElementById('user-number').value.trim();
    if (userNumber) {
        // Verifica si el número ingresado existe en Firestore
        const numberDocRef = doc(db1, 'historias', userNumber);
        getDoc(numberDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                document.getElementById('login').style.display = 'block'; // Mostrar botón de login
                localStorage.setItem('userNumber', userNumber); // Guardar el número en almacenamiento local
            } else {
                alert('El código no fue encontrado.');
            }
        }).catch((error) => {
            console.error('Error checking document:', error);
            alert("Se produjo un error al consultar el código.");
        });
    } else {
        alert('Por favor ingrese un número válido.');
    }
});

// Maneja el inicio de sesión con Google
document.getElementById('login').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth1, provider);
		// Inicia sesión en el segundo proyecto
        await signInWithPopup(auth2, provider);
        const user = result.user;
        localStorage.setItem('correo', user.email); // Guardar el correo en almacenamiento local

        // Actualiza la UI y verifica en el primer proyecto
        const docRef1 = doc(db1, 'historias', localStorage.getItem('userNumber'));
        const docSnap1 = await getDoc(docRef1);

        if (docSnap1.exists()) {
            const data = docSnap1.data();
            if (data.correo !== user.email || data.sanciones > 2) {
                // Cierra la sesión y limpia localStorage antes de mostrar el alert
                await signOut(auth1);
                localStorage.clear();
                updateUI(false);
                alert('Datos incorrectos o demasiadas sanciones. Sesión finalizada!');
            } else {
                localStorage.setItem('estudiante', data.estudiante); // Guardar el nombre del estudiante
                
                // Actualiza la UI después del inicio de sesión en el primer proyecto
                updateUI(true);
            }
        } else {
            alert('Número no encontrado. Por favor ingrese un número válido.');
        }
    } catch (error) {
        console.error('Error during sign-in:', error.message);
    }
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth1)
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
onAuthStateChanged(auth1, (user) => {
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
        const user = auth1.currentUser;
        if (user) {
            const userNumber = localStorage.getItem('userNumber');
            if (userNumber) {
                const userDocRef = doc(db1, 'historias', userNumber);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        let title_b = document.querySelector('#bienvenida'); // Obtiene la bienvenida
                        const userDataText = document.getElementById('user-data');
                        userDataText.innerHTML = ''; // Limpiar contenido previo

                        const opt_adultos = [
                            { value: "lunes-7-11", opText: "Lunes - 7:00 am/11:00 am" },
                            { value: "lunes-12-16", opText: "Lunes - 12:00 pm/4:00 pm" },
                            { value: "lunes-17-20", opText: "Lunes - 5:00 pm/8:00 pm" },
                            { value: "miercoles-7-11", opText: "Miércoles - 7:00 am/11:00 am" },
                            { value: "miercoles-12-16", opText: "Miércoles - 12:00 pm/4:00 pm" },
                            { value: "miercoles-17-20", opText: "Miércoles - 5:00 pm/8:00 pm" },
                            { value: "viernes-7-11", opText: "Viernes - 7:00 am/11:00 am" },
                            { value: "viernes-12-16", opText: "Viernes - 12:00 pm/4:00 pm" },
                            { value: "viernes-17-20", opText: "Viernes - 5:00 pm/8:00 pm" },
                            { value: "prestamo", opText: "Préstamo" }
                        ];

                        const opt_ninos = [
                            { value: "martes-7-11", opText: "Martes - 7:00 am/11:00 am" },
                            { value: "martes-11:30-15:30", opText: "Martes - 11:30 am/3:30 pm" },
                            { value: "martes-16-19", opText: "Martes - 4:00 pm/7:00 pm" },
                            { value: "jueves-7-11", opText: "Jueves - 7:00 am/11:00 am" },
                            { value: "jueves-11:30-15:30", opText: "Jueves - 11:30 am/3:30 pm" },
                            { value: "jueves-16-19", opText: "Jueves - 4:00 pm/7:00 pm" },
                            { value: "sabado-7-10", opText: "Sábado - 7:00 am/10:00 am" },
                            { value: "sabado-10-13", opText: "Sábado - 10:00 am/1:00 pm" },
                            { value: "prestamo", opText: "Préstamo" }
                        ];

                        for (const [k, val] of Object.entries(userData)) {
                            title_b.textContent = `Bienvenido ${userData.estudiante}`; // Agrega nombre del estudiante a la bienvenida
                            let div_clinica = document.createElement('div'); // Div principal (titulo-divHistoria)
                            let title_clinica = document.createElement('h3');
                            let title_clinicaText = '';
                            let div_historia = document.createElement('div');

                            if (typeof val === 'object') {
                                for (const [key, value] of Object.entries(val)) {
                                    let historia = document.createElement('p');
                                    let historia_text = '';
									let div_select = document.createElement('div');
									//div_select.classList.add('protected-content');
									//div_select.style.display = 'none';
									div_select.id = `div${k}${key}`;
									//console.log(div_select.id);
                                    let input_select = document.createElement('select');
                                    input_select.id = `hora${k}${key}`;
									input_select.classList.add('input');
                                    if (k === 'adultos'){
										opt_adultos.forEach(opt => {
											let optElement = document.createElement('option');
											optElement.value = opt.value;
											optElement.textContent = opt.opText;
											input_select.appendChild(optElement);
										});
									} else {
										opt_ninos.forEach(opt => {
											let optElement = document.createElement('option');
											optElement.value = opt.value;
											optElement.textContent = opt.opText;
											input_select.appendChild(optElement);
											
										});
									}
                                    let input_check = document.createElement('input');
                                    input_check.type = 'checkbox';
                                    input_check.id = `${k}${key}`;
									//console.log(input_check.id);
                                    input_check.value = key;

                                    let label = document.createElement('label');
                                    label.htmlFor = `${k}${key}`;
                                    label.textContent = "Seleccionar historia: ";
                                    
                                    title_clinicaText = `Clínica de ${k}`;
									let ortopedia = k === 'ortopedia' ? `\nCódigo: ${value.codigo}\n` : '\n';
                                    historia_text = `Documento: ${key}\nPaciente: ${value.paciente}${ortopedia}`;
                                    historia.textContent = historia_text;
                                    historia.classList.add('background');
                                    historia.appendChild(label);
                                    historia.appendChild(input_check);
									div_select.appendChild(input_select);
                                    historia.appendChild(div_select);
                                    div_historia.appendChild(historia);
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

// Maneja el envío del formulario
document.addEventListener('DOMContentLoaded', () => {
	console.log("DOM listo..."); 
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	console.log(`Número de checkboxes encontrados: ${checkboxes.length}`);
	checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
			const checkId = event.target.id;
			
			const div = document.querySelector(`#div${checkId}`);
			// Verifica si el div existe y oculta/muestra
			if (div) {
				console.log(`Se encontró el div${checkId}`);
				div.style.display = checkbox.checked ? 'block' : 'none';
			} else {
				console.log(`No existe el div con ID: div${checkId}`);
			}
		});
	});
	
    const form = document.getElementById('historiaForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de manera predeterminada

        // Recoge todos los checkboxes seleccionados
        const selectedCheckboxes = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'));
        const selectedValues = selectedCheckboxes.map(checkbox => {
		    const checkboxValue =  checkbox.value;
		    const selectId = `hora${checkbox.id}`;
			const selected = document.querySelector(`#${selectId}`);
			const selectValue = selected ? selected.value : 'No seleccionado';//obtiene el valor del checkbox
		    
			return {checkboxValue, selectValue};
		});
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
            // Envía los datos a Firestore en la segunda instancia
            const docRef = doc(db2, 'solicitudes', codigo);
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
/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const functionsUrl = 'https://<your-region>-<your-project-id>.cloudfunctions.net';

// Maneja la entrada del número del usuario
document.getElementById('submit-number').addEventListener('click', async () => {
    const userNumber = document.getElementById('user-number').value.trim();
    if (userNumber) {
        try {
            const response = await fetch(`${functionsUrl}/getUserData?userNumber=${userNumber}`);
            if (response.ok) {
                const userData = await response.json();
                document.getElementById('login').style.display = 'block';
                localStorage.setItem('userNumber', userNumber);
                // Guardar datos adicionales si es necesario
            } else {
                alert('El código no fue encontrado.');
            }
        } catch (error) {
            console.error('Error checking document:', error);
            alert("Se produjo un error al consultar el código.");
        }
    } else {
        alert('Por favor ingrese un número válido.');
    }
});

// Maneja el inicio de sesión con Google
document.getElementById('login').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // Usa la función de Cloud Functions para autenticar o realizar otras operaciones
        const user = result.user;
        localStorage.setItem('correo', user.email);

        // Puedes usar una función específica para manejar datos después de iniciar sesión
        // Como `signInUser` en tu backend si es necesario
        // const response = await fetch(`${functionsUrl}/signInUser`, { ... });
        
        const userNumber = localStorage.getItem('userNumber');
        if (userNumber) {
            const response = await fetch(`${functionsUrl}/getUserData?userNumber=${userNumber}`);
            if (response.ok) {
                const data = await response.json();
                if (data.correo !== user.email || data.sanciones > 2) {
                    await signOut(auth);
                    localStorage.clear();
                    updateUI(false);
                    alert('Datos incorrectos o demasiadas sanciones. Sesión finalizada!');
                } else {
                    localStorage.setItem('estudiante', data.estudiante);
                    updateUI(true);
                }
            } else {
                alert('Número no encontrado. Por favor ingrese un número válido.');
            }
        }
    } catch (error) {
        console.error('Error during sign-in:', error.message);
    }
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        updateUI(false);
        console.log('User signed out');
    } catch (error) {
        console.error('Error:', error.message);
    }
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
        const user = auth1.currentUser;
        if (user) {
            const userNumber = localStorage.getItem('userNumber');
            if (userNumber) {
                const userDocRef = doc(db1, 'historias', userNumber);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        let title_b = document.querySelector('#bienvenida'); // Obtiene la bienvenida
                        const userDataText = document.getElementById('user-data');
                        userDataText.innerHTML = ''; // Limpiar contenido previo

                        const opt_adultos = [
                            { value: "lunes-7-11", opText: "Lunes - 7:00 am/11:00 am" },
                            { value: "lunes-12-16", opText: "Lunes - 12:00 pm/4:00 pm" },
                            { value: "lunes-17-20", opText: "Lunes - 5:00 pm/8:00 pm" },
                            { value: "miercoles-7-11", opText: "Miércoles - 7:00 am/11:00 am" },
                            { value: "miercoles-12-16", opText: "Miércoles - 12:00 pm/4:00 pm" },
                            { value: "miercoles-17-20", opText: "Miércoles - 5:00 pm/8:00 pm" },
                            { value: "viernes-7-11", opText: "Viernes - 7:00 am/11:00 am" },
                            { value: "viernes-12-16", opText: "Viernes - 12:00 pm/4:00 pm" },
                            { value: "viernes-17-20", opText: "Viernes - 5:00 pm/8:00 pm" },
                            { value: "prestamo", opText: "Préstamo" }
                        ];

                        const opt_ninos = [
                            { value: "martes-7-11", opText: "Martes - 7:00 am/11:00 am" },
                            { value: "martes-11:30-15:30", opText: "Martes - 11:30 am/3:30 pm" },
                            { value: "martes-16-19", opText: "Martes - 4:00 pm/7:00 pm" },
                            { value: "jueves-7-11", opText: "Jueves - 7:00 am/11:00 am" },
                            { value: "jueves-11:30-15:30", opText: "Jueves - 11:30 am/3:30 pm" },
                            { value: "jueves-16-19", opText: "Jueves - 4:00 pm/7:00 pm" },
                            { value: "sabado-7-10", opText: "Sábado - 7:00 am/10:00 am" },
                            { value: "sabado-10-13", opText: "Sábado - 10:00 am/1:00 pm" },
                            { value: "prestamo", opText: "Préstamo" }
                        ];

                        for (const [k, val] of Object.entries(userData)) {
                            title_b.textContent = `Bienvenido ${userData.estudiante}`; // Agrega nombre del estudiante a la bienvenida
                            let div_clinica = document.createElement('div'); // Div principal (titulo-divHistoria)
                            let title_clinica = document.createElement('h3');
                            let title_clinicaText = '';
                            let div_historia = document.createElement('div');

                            if (typeof val === 'object') {
                                for (const [key, value] of Object.entries(val)) {
                                    let historia = document.createElement('p');
                                    let historia_text = '';
									let div_select = document.createElement('div');
									div_select.classList.add('protected-content');
									div_select.id = `div${k}${key}`;
                                    let input_select = document.createElement('select');
                                    input_select.id = `hora${k}${key}`;
									input_select.classList.add('input');
                                    if (k === 'adultos'){
										opt_adultos.forEach(opt => {
											let optElement = document.createElement('option');
											optElement.value = opt.value;
											optElement.textContent = opt.opText;
											input_select.appendChild(optElement);
										});
									} else {
										opt_ninos.forEach(opt => {
											let optElement = document.createElement('option');
											optElement.value = opt.value;
											optElement.textContent = opt.opText;
											input_select.appendChild(optElement);
											
										});
									}
                                    let input_check = document.createElement('input');
                                    input_check.type = 'checkbox';
                                    input_check.id = `${k}${key}`;
                                    input_check.value = key;

                                    let label = document.createElement('label');
                                    label.htmlFor = `${k}${key}`;
                                    label.textContent = "Seleccionar historia: ";
                                    
                                    title_clinicaText = `Clínica de ${k}`;
									let ortopedia = k === 'ortopedia' ? `\nCódigo: ${value.codigo}\n` : '\n';
                                    historia_text = `Documento: ${key}\nPaciente: ${value.paciente}${ortopedia}`;
                                    historia.textContent = historia_text;
                                    historia.classList.add('background');
                                    historia.appendChild(label);
                                    historia.appendChild(input_check);
									div_select.appendChild(input_select);
                                    historia.appendChild(div_select);
                                    div_historia.appendChild(historia);
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

// Maneja el envío del formulario
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('historiaForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedCheckboxes = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'));
        const selectedValues = selectedCheckboxes.map(checkbox => {
            const checkboxValue = checkbox.value;
            const selectId = `hora${checkbox.id}`;
            const selected = document.querySelector(`#${selectId}`);
            const selectValue = selected ? selected.value : 'No seleccionado';
            return { checkboxValue, selectValue };
        });

        const student = localStorage.getItem('estudiante');
        const codigo = localStorage.getItem('userNumber');
        const correo = localStorage.getItem('correo');

        const dataToSend = {
            estudiante: student,
            solicitados: selectedValues,
            timestamp: new Date().toISOString() // Asegúrate de que el timestamp esté en formato adecuado
        };

        try {
            const response = await fetch(`${functionsUrl}/updateRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
            if (response.ok) {
                alert('Solicitud actualizada exitosamente');
            } else {
                alert('Hubo un problema al solicitar las historias.');
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
            alert('Hubo un problema al solicitar las historias.');
        }
    });
});
*/