window.addEventListener("DOMContentLoaded", () => {
    const assignmentForm = document.getElementById("assignment-form");
    const assignmentUl = document.getElementById("assignment-ul");
    document.getElementById("go-back-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html"; // Redirect to dashboard
    });

    const currentUser = localStorage.getItem("loggedInUser");
    if (!currentUser) {
        alert("Please log in first.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("welcome-message").innerText = `Welcome, ${currentUser}!`;

    let assignments = JSON.parse(localStorage.getItem(`${currentUser}_assignments`)) || [];

    displaySortedAssignments();

    // Update date-time immediately on page load
    updateDateTime();

    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        alert("Logged out successfully!");
        window.location.href = "index.html";
    });

    assignmentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("assignment-title").value;
        const description = document.getElementById("assignment-description").value;
        const dueDate = document.getElementById("assignment-due-date").value;
        const dueTime = document.getElementById("assignment-time").value;

        const id = `${Date.now()}`; // Unique identifier for each assignment

        const newAssignment = { id, title, description, dueDate, dueTime, completed: false };

        assignments.push(newAssignment);
        saveAndDisplayAssignments();
        assignmentForm.reset();
    });

    function formatDueDate(dueDate, dueTime) {
        const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };
        return dueDateTime.toLocaleString("en-US", options);
    }

    function displayAssignment({ id, title, description, dueDate, dueTime }) {
        const li = document.createElement("li");
        li.classList.add("assignment-card");
        li.dataset.id = id;

        const formattedDueDate = formatDueDate(dueDate, dueTime);

        li.innerHTML = `
            <div class="details">
                <h3>${title}</h3>
                <p>${description}</p>
                <p class="due-date">Due on: ${formattedDueDate}</p>
                <div class="countdown" id="countdown-${id}">
                    <span class="clock-icon">🕰️</span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="done-btn" data-id="${id}">Done</button>
                <button class="delete-btn" data-id="${id}">Delete</button>
                <button class="edit-btn" data-id="${id}">Edit</button>
            </div>
        `;
        assignmentUl.appendChild(li);
        startCountdown(dueDate, dueTime, id);
    }

    function displaySortedAssignments() {
        assignments.sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}:00`) - new Date(`${b.dueDate}T${b.dueTime}:00`));
        assignmentUl.innerHTML = "";
        assignments.forEach(displayAssignment);
    }

    function saveAndDisplayAssignments() {
        localStorage.setItem(`${currentUser}_assignments`, JSON.stringify(assignments));
        displaySortedAssignments();
    }

    assignmentUl.addEventListener("click", (e) => {
        const button = e.target;
        const id = button.dataset.id;

        if (button.classList.contains("done-btn")) {
            markAsDone(id);
        } else if (button.classList.contains("delete-btn")) {
            deleteAssignment(id);
        } else if (button.classList.contains("edit-btn")) {
            editAssignment(id);
        }
    });

    function markAsDone(id) {
        assignments = assignments.filter((assignment) => assignment.id !== id);
        saveAndDisplayAssignments();
    }

    function deleteAssignment(id) {
        assignments = assignments.filter((assignment) => assignment.id !== id);
        saveAndDisplayAssignments();
    }

    function editAssignment(id) {
        const assignmentToEdit = assignments.find((assignment) => assignment.id === id);
        if (assignmentToEdit) {
            document.getElementById("assignment-title").value = assignmentToEdit.title;
            document.getElementById("assignment-description").value = assignmentToEdit.description;
            document.getElementById("assignment-due-date").value = assignmentToEdit.dueDate;
            document.getElementById("assignment-time").value = assignmentToEdit.dueTime;

            assignments = assignments.filter((assignment) => assignment.id !== id);
            saveAndDisplayAssignments();
        }
    }

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

    function startCountdown(dueDate, dueTime, id) {
        const countdownElement = document.getElementById(`countdown-${id}`);
        const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

        function updateCountdown() {
            const now = new Date();
            const timeLeft = dueDateTime - now;

            if (timeLeft <= 0) {
                countdownElement.innerHTML = `<span class="overdue">OverDue!</span>`;
            } else {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `<span class="clock-icon">⏰</span> ${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
});


