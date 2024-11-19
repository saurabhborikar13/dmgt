// Ensure default credentials are saved in localStorage
(function initializeDefaultCredentials() {
    if (!localStorage.getItem("users")) {
        const defaultUsers = { sab: "123" }; // Default username and password
        localStorage.setItem("users", JSON.stringify(defaultUsers));
        console.log("Default credentials initialized:", defaultUsers);
    } else {
        console.log("Existing users in localStorage:", JSON.parse(localStorage.getItem("users")));
    }
})();

// Toggle between login and register forms
document.getElementById("register-link").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("login-container").style.display = "none";
    document.getElementById("register-container").style.display = "block";
});

document.getElementById("login-link").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("login-container").style.display = "block";
    document.getElementById("register-container").style.display = "none";
});

// Handle login
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username] && users[username] === password) {
        localStorage.setItem("loggedInUser", username);
        alert("Login Successful!");
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        alert("Invalid username or password.");
    }
});

// Handle registration
document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const newUsername = document.getElementById("new-username").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || {};

    // Check username and password length
    if (newUsername.length < 6 || newUsername.length > 20) {
        alert("Username must be between 6 and 20 characters.");
    } else if (newPassword.length < 6 || newPassword.length > 20) {
        alert("Password must be between 6 and 20 characters.");
    } else if (newUsername in users) {
        alert("Username already exists. Please choose another.");
    } else if (newUsername && newPassword) {
        // Add new user if all conditions are met
        users[newUsername] = newPassword;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registration Successful! You can now log in.");
        document.getElementById("login-container").style.display = "block";
        document.getElementById("register-container").style.display = "none";
    } else {
        alert("Please fill all fields.");
    }
});






