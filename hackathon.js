import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication Handling
document.addEventListener("DOMContentLoaded", function () {
  const username = sessionStorage.getItem("username");
  if (username) {
    document.querySelector(".profile-icon").style.display = "block";
    document.querySelector(".profile-name").textContent = username;
  } else {
    window.location.href = "./login.html";
  }
  const hackathonId = getHackathonIdFromURL();
  loadHackathonDetails(hackathonId);
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

// Load Hackathon Details
async function loadHackathonDetails(hackathonId) {
  try {
    const hackathonDoc = await getDoc(doc(db, "hackathons", hackathonId));
    if (hackathonDoc.exists()) {
      const data = hackathonDoc.data();
      document.querySelector(".hackathon-details h1").innerText = data.name;
      document.querySelector(".hackathon-details p").innerText = data.title;
      document.querySelector(".problem-statement p").innerText = data.description;
      document.querySelector("#solution-details p").innerText = data.solution;
      document.querySelector("#start-date").innerText = data.startDate;
      document.querySelector("#submission-deadline").innerText = data.submissionDeadline;
      document.querySelector("#judging-date").innerText = data.judgingDate;
      if (auth.currentUser) {
        loadUserSolutionAndProgress(hackathonId, auth.currentUser.uid);
      }
    } else {
      console.log("Hackathon not found");
    }
  } catch (error) {
    console.error("Error loading hackathon details:", error);
  }
}

function getHackathonIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Progress Form Submission
document
  .querySelector("#progress-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    const hackathonId = getHackathonIdFromURL();
    const progressDate = e.target["progress-date"].value;
    const progress = e.target.progress.value;

    await submitProgress(hackathonId, userId, progressDate, progress);
    loadUserProgress(hackathonId);
  });

// Submit Progress
async function submitProgress(hackathonId, userId, progressDate, progress) {
  try {
    const hackathonDocRef = doc(db, "hackathons", hackathonId);
    const hackathonDoc = await getDoc(hackathonDocRef);

    if (hackathonDoc.exists()) {
      const hackathonData = hackathonDoc.data();
      const participantData = hackathonData.participants || {};
      const existingProgressLog = participantData[userId]?.progressLog || [];

      participantData[userId] = {
        ...participantData[userId],
        progressLog: [
          ...existingProgressLog,
          { date: progressDate, progress },
        ],
      };

      await updateDoc(hackathonDocRef, { participants: participantData });
      console.log("Progress updated successfully.");
    } else {
      console.log("Hackathon not found");
    }
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}

// Load User Progress
async function loadUserProgress(hackathonId) {
  try {
    const hackathonDoc = await getDoc(doc(db, "hackathons", hackathonId));
    if (hackathonDoc.exists()) {
      const hackathonData = hackathonDoc.data();
      const participantData = hackathonData.participants || {};
      const userProgressTimeline = document.querySelector("#user-progress-timeline");
      userProgressTimeline.innerHTML = "";

      for (const [userId, userData] of Object.entries(participantData)) {
        const userName = userData.username || "Unknown User";
        const progressLog = userData.progressLog || [];

        const userProgressDiv = document.createElement("div");
        userProgressDiv.className = "user-progress";
        userProgressDiv.innerHTML = `<h3>${userName}</h3>`;

        progressLog.forEach((entry) => {
          const entryDiv = document.createElement("div");
          entryDiv.className = "progress-entry";
          entryDiv.innerHTML = `
            <h4>Progress for ${entry.date}</h4>
            <p>${entry.progress}</p>
          `;
          userProgressDiv.appendChild(entryDiv);
        });

        userProgressTimeline.appendChild(userProgressDiv);
      }
    } else {
      console.log("Hackathon not found");
    }
  } catch (error) {
    console.error("Error loading user progress:", error);
  }
}

// Solution Form Submission
document
  .querySelector("#solution-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    const hackathonId = getHackathonIdFromURL();
    const solution = e.target.solution.value;

    await submitSolution(hackathonId, userId, solution);
    loadUserSolutionAndProgress(hackathonId, userId);
  });

// Submit Solution
async function submitSolution(hackathonId, userId, solution) {
  try {
    const hackathonDocRef = doc(db, "hackathons", hackathonId);
    const hackathonDoc = await getDoc(hackathonDocRef);

    if (hackathonDoc.exists()) {
      const hackathonData = hackathonDoc.data();
      const participantData = hackathonData.participants || {};

      participantData[userId] = {
        ...participantData[userId],
        solution,
      };

      await updateDoc(hackathonDocRef, { participants: participantData });
      document.querySelector("#solution-details p").innerText = solution;
    } else {
      console.log("Hackathon document not found.");
    }
  } catch (error) {
    console.error("Error updating solution:", error);
  }
}

// Load User Solution and Progress
async function loadUserSolutionAndProgress(hackathonId, userId) {
  try {
    const hackathonDoc = await getDoc(doc(db, "hackathons", hackathonId));
    if (hackathonDoc.exists()) {
      const hackathonData = hackathonDoc.data();
      const participantData = hackathonData.participants || {};
      const userData = participantData[userId] || {};

      document.querySelector("#solution-details p").innerText = userData.solution || "No solution submitted yet";

      const plannedFeaturesList = document.querySelector("#planned-features");
      plannedFeaturesList.innerHTML = "";
      (userData.plannedFeatures || []).forEach((feature) => {
        const li = document.createElement("li");
        li.innerText = feature;
        plannedFeaturesList.appendChild(li);
      });

      const progressLog = document.querySelector("#progress-log");
      progressLog.innerHTML = "";
      (userData.progressLog || []).forEach((entry) => {
        const div = document.createElement("div");
        div.className = "progress-item";
        div.innerHTML = `
          <h4>Progress for ${entry.date}</h4>
          <p>${entry.progress}</p>
        `;
        progressLog.appendChild(div);
      });
    } else {
      console.log("Hackathon not found");
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

