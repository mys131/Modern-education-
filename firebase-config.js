<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAUrEh3bG9HvF66bd7drorwWPC9E-Y6SmU",
    authDomain: "modern-platform-4b948.firebaseapp.com",
    projectId: "modern-platform-4b948",
    storageBucket: "modern-platform-4b948.firebasestorage.app",
    messagingSenderId: "697068237369",
    appId: "1:697068237369:web:467f713d5134819702d3e8",
    measurementId: "G-2VNBWW957P"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
