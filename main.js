import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig); // Initialize Firebase
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Auth

document.addEventListener("DOMContentLoaded", function () {
  const username = sessionStorage.getItem("username");

  if (username) {
    document.querySelector(".profile-icon").style.display = "block";
    document.querySelector(".profile-name").textContent = username;
  } else {
    window.location.href = "./login.html";
  }
});

document.getElementById("logout-button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "./login.html";
    })
    .catch((error) => {
      console.error("Logout Error:", error);
    });
});

document
  .querySelector(".hackathon-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const hackathon = {
      name: event.target.querySelector("#hackathon-name").value,
      title: event.target.querySelector("#hackathon-title").value,
      description: event.target.querySelector("#hackathon-description").value,
      startDate: event.target.querySelector("#hackathon-start").value,
      submissionDeadline: event.target.querySelector("#hackathon-end").value,
      judgingDate: event.target.querySelector("#hackathon-result").value,
    };
    try {
      await addDoc(collection(db, "hackathons"), hackathon);
      alert("Hackathon added successfully!");
      toggleForm();
      loadHackathons(); // Reload hackathons after adding new one
    } catch (error) {
      console.error("Error adding hackathon: ", error);
    }
  });

function toggleForm() {
  const formContainer = document.querySelector(".hackathon-form-container");
  if (formContainer) {
    formContainer.style.display =
      formContainer.style.display === "none" ? "block" : "none";
  } else {
    console.error("Form container not found.");
  }
}

function calculateCountdown(startDate, deadlineDate) {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }); // Mumbai time zone
  const start = new Date(startDate);
  const deadline = new Date(deadlineDate);
  const nowDate = new Date(now);

  if (nowDate < start) {
    return `Coming up in ${Math.floor(
      (start - nowDate) / (1000 * 60 * 60 * 24)
    )} days`;
  } else if (nowDate > deadline) {
    return "Completed";
  } else {
    const timeRemaining = deadline - nowDate;
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    return daysRemaining > 3
      ? `${daysRemaining} days`
      : `${hoursRemaining} hours`;
  }
}
async function loadHackathons() {
  const hackathonList = document.querySelector(".hackathon-list");
  hackathonList.innerHTML = ""; // Clear current list

  const q = query(collection(db, "hackathons"), orderBy("startDate")); // Sort by start date
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const hackathon = doc.data();
    const hackathonId = doc.id; // Get the ID of the document
    const div = document.createElement("div");
    div.className = "hackathon-item";
    div.innerHTML = `
      <h3>${hackathon.name}</h3>
      <h5>${hackathon.title}</h5>
      <p>${hackathon.description}</p>
      <div class="timeline">
        <p>Start Date: ${new Date(hackathon.startDate).toLocaleDateString()}</p>
        <p>Submission Deadline: ${new Date(
          hackathon.submissionDeadline
        ).toLocaleDateString()}</p>
        <p>Judging: ${new Date(hackathon.judgingDate).toLocaleDateString()}</p>
        <p class="countdown">Time Remaining: ${calculateCountdown(
          hackathon.startDate,
          hackathon.submissionDeadline
        )}</p>
      </div>
      <section class="cta-buttons"><button class="explore-btn" data-id="${hackathonId}">Explore</button></section>
    `;
    
    hackathonList.appendChild(div);
  });

  // Add event listeners to all "Explore" buttons
  document.querySelectorAll(".explore-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const hackathonId = event.target.dataset.id;
      window.location.href = `hackathon.html?id=${hackathonId}`;
    });
  });
}

loadHackathons(); // Initial load
