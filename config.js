// ======================================================
// SST Pro — Configuração Firebase
// ADMINISTRADOR: isaquebrito6@gmail.com
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyCnXCyC3SMqoF4Sps6W8n-a32RMM-eVC5s",
  authDomain: "sistema-gestao-dd8a2.firebaseapp.com",
  projectId: "sistema-gestao-dd8a2",
  storageBucket: "sistema-gestao-dd8a2.firebasestorage.app",
  messagingSenderId: "447733680715",
  appId: "1:447733680715:web:b031fd11134e9864be9bce"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Administrador
const USUARIO_ADMIN = "isaquebrito6@gmail.com";
function isAdmin(email) {
  return email && email.toLowerCase() === USUARIO_ADMIN.toLowerCase();
}
