import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"; // Updated to match app version

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0icw7RIrrTFu6qfEkWERPfDZwvrViCU8",
  authDomain: "hackathon-tracker-bc268.firebaseapp.com",
  databaseURL:
    "https://hackathon-tracker-bc268-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hackathon-tracker-bc268",
  storageBucket: "hackathon-tracker-bc268.appspot.com",
  messagingSenderId: "693646378145",
  appId: "1:693646378145:web:012ec8ae82687fb3021ce0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//submit
const submit = document.getElementById("submit");

submit.addEventListener("click", function (event) {
  event.preventDefault();

  //inputs
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      sessionStorage.setItem("username", user.email); // Use email or displayName

      window.location.href = "./index.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
});


