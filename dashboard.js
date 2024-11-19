// Ensure only logged-in user can access the dashboard
window.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    
    if (loggedInUser) {
        document.getElementById("welcome-message").textContent = `Welcome, ${loggedInUser}!`;
    } else {
        alert("No user logged in. Redirecting to login.");
        window.location.href = "index.html";
        return;
    }

    // Update date-time immediately on page load
    updateDateTime();

    // Update current date and time
    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
        };
        const formattedDate = now.toLocaleString("en-US", options);
        document.getElementById("current-date-time").textContent = formattedDate;
    }
    setInterval(updateDateTime, 1000);

    // Logout functionality
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        alert("Logged out successfully!");
        window.location.href = "index.html";
    });

    // Navigate to Assignment section
    document.getElementById("assignment-btn").addEventListener("click", () => {
        if (!loggedInUser) {
            alert("Please log in first.");
            window.location.href = "index.html";
        } else {
            window.location.href = "assignment.html"; // Redirect to assignment page
        }
    });

    // Navigate to Attendance section
    document.getElementById("attendance-btn").addEventListener("click", () => {
        if (!loggedInUser) {
            alert("Please log in first.");
            window.location.href = "index.html";
        } else {
            window.location.href = "attendance.html"; // Redirect to attendance page
        }
    });

      // Fetch and display top 3 upcoming assignments
      const assignments = JSON.parse(localStorage.getItem(`${loggedInUser}_assignments`)) || [];
      const upcomingAssignmentsList = document.getElementById("upcoming-assignments-list");
  
      function displayTopAssignments() {
          const sortedAssignments = assignments
              .filter((assignment) => new Date(`${assignment.dueDate}T${assignment.dueTime}:00`) > new Date())
              .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}:00`) - new Date(`${b.dueDate}T${b.dueTime}:00`))
              .slice(0, 3);
  
          upcomingAssignmentsList.innerHTML = "";
          sortedAssignments.forEach(({ title, description, dueDate, dueTime }) => {
              const li = document.createElement("li");
              li.innerHTML = `
                  <strong>${title}</strong>
                  <br></br>
                  Due: ${new Date(`${dueDate}T${dueTime}:00`).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                  })}
              `;
              upcomingAssignmentsList.appendChild(li);
          });
      }
  
      displayTopAssignments();
});


