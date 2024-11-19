window.addEventListener("DOMContentLoaded", () => {
    const subjectForm = document.getElementById("subject-form");
    const subjectList = document.getElementById("subject-list");
    document.getElementById("go-back-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard.html"; // Redirect to dashboard
    });

    


    // Update current date and time
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true };
        const formattedDate = now.toLocaleString("en-US", options);
        document.getElementById("current-date-time").textContent = formattedDate;
    }
    setInterval(updateDateTime, 1);
    
    // Retrieve the current user from localStorage
    const currentUser = localStorage.getItem("loggedInUser");
    if (!currentUser) {
        alert("Please log in first.");
        window.location.href = "index.html"; // Redirect to login page
        return;
    }

    // Retrieve the subjects for the current user, if they exist
    let subjects = JSON.parse(localStorage.getItem(`${currentUser}_subjects`)) || [];

    // This will track the history of actions for each subject during the current session
    let actionHistory = JSON.parse(localStorage.getItem(`${currentUser}_actionHistory`)) || {};

    

    


    // Handle adding new subject
    subjectForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const subjectName = document.getElementById("subject-name").value.trim();

        if (!subjectName) {
            alert("Please provide a valid subject name.");
            return;
        }

        // Check if the subject already exists
        const subjectExists = subjects.some(subject => subject.name.toLowerCase() === subjectName.toLowerCase());

        if (subjectExists) {
            alert("This subject is already added.");
            return;
        }

        // Create a new subject object
        const newSubject = {
            name: subjectName,
            presentCount: 0,
            absentCount: 0,
            totalClasses: 0,
            attendancePercentage: 0
        };

        // Add subject to the subjects array
        subjects.push(newSubject);

        // Save the updated subjects to localStorage
        localStorage.setItem(`${currentUser}_subjects`, JSON.stringify(subjects));

        // Update the subject list UI
        updateSubjectList();

        // Clear the input field
        subjectForm.reset();
    });

    // Update the subject list in the UI
    function updateSubjectList() {
        subjectList.innerHTML = ""; // Clear the list

        subjects.forEach((subject, index) => {
            const subjectItem = document.createElement("li");
            subjectItem.classList.add("subject-item");

            // Create subject details
            const subjectDetails = document.createElement("div");
            subjectDetails.classList.add("subject-details");
            subjectDetails.innerHTML = `
                <strong>${subject.name}</strong>
                <p>Total Classes: ${subject.totalClasses}</p>
                <p>Present: ${subject.presentCount} | Absent: ${subject.absentCount}</p>
                <p>Attendance: ${subject.attendancePercentage.toFixed(2)}%</p>
            `;

            // Create attendance action buttons
            const subjectActions = document.createElement("div");
            subjectActions.classList.add("subject-actions");

            const presentBtn = document.createElement("button");
            presentBtn.classList.add("present-btn");
            presentBtn.textContent = "Present";
            presentBtn.addEventListener("click", () => markAttendance(index, "present"));

            const absentBtn = document.createElement("button");
            absentBtn.classList.add("absent-btn");
            absentBtn.textContent = "Absent";
            absentBtn.addEventListener("click", () => markAttendance(index, "absent"));

            const undoBtn = document.createElement("button");
            undoBtn.classList.add("undo-btn");
            undoBtn.textContent = "Undo";
            undoBtn.addEventListener("click", () => undoLastAction(index)); // Undo multiple clicks will be handled here

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => confirmDelete(index));

            subjectActions.appendChild(presentBtn);
            subjectActions.appendChild(absentBtn);
            subjectActions.appendChild(undoBtn);
            subjectActions.appendChild(deleteBtn);

            // Append subject details and actions to the list item
            subjectItem.appendChild(subjectDetails);
            subjectItem.appendChild(subjectActions);

            // Append the list item to the subject list
            subjectList.appendChild(subjectItem);
        });
    }

    // Elements for image upload
    const imageUpload = document.getElementById("image-upload");
    const uploadedImage = document.getElementById("uploaded-image");

    // Load previously saved image if available
    // const savedImage = localStorage.getItem(`${currentUser}_uploadedImage`);
    // if (savedImage) {
    //     uploadedImage.src = savedImage;
    // }


    // When the page loads, check if an image is stored in localStorage
    const calendarImage = document.querySelector(".calendar-image");
    const storedImage = localStorage.getItem(`${currentUser}_uploadedImage`);

    if (storedImage) {
        // If there is a stored image, set it as the image source
        calendarImage.src = storedImage;
    } else {
        // If no image is stored, leave the image src empty (or set to a "no image" placeholder)
        calendarImage.src = "";  // Or use a placeholder if desired
    }

    // Listen for file input changes
    imageUpload.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;

                // Replace the placeholder with the uploaded image
                uploadedImage.src = imageData;

                // Save the uploaded image to localStorage
                localStorage.setItem(`${currentUser}_uploadedImage`, imageData);

                alert("Image uploaded successfully!");
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    });

    document.getElementById("delete-image-btn").addEventListener("click", () => {
    const calendarImage = document.querySelector(".calendar-image");
    calendarImage.src = ""; // Clear the image source
    
    // Remove the image from localStorage
    localStorage.removeItem(`${currentUser}_uploadedImage`);
    
    alert("Image has been deleted.");
});



    // Mark attendance as present or absent
    function markAttendance(subjectIndex, status) {
        const subject = subjects[subjectIndex];

        // Store the current state for Undo
        if (!actionHistory[subjectIndex]) {
            actionHistory[subjectIndex] = [];
        }
        actionHistory[subjectIndex].push({ prevState: { ...subject } });

        if (status === "present") {
            subject.presentCount++;
        } else if (status === "absent") {
            subject.absentCount++;
        }

        // Update the total classes and attendance percentage
        subject.totalClasses = subject.presentCount + subject.absentCount;
        subject.attendancePercentage = (subject.presentCount / subject.totalClasses) * 100;

        // Save the updated subjects and action history to localStorage
        localStorage.setItem(`${currentUser}_subjects`, JSON.stringify(subjects));
        localStorage.setItem(`${currentUser}_actionHistory`, JSON.stringify(actionHistory));

        // Update the subject list UI after marking attendance
        updateSubjectList();
    }

    // Undo last action (one action at a time per click)
    function undoLastAction(subjectIndex) {
        if (!actionHistory[subjectIndex] || actionHistory[subjectIndex].length === 0) {
            alert("No actions to undo for this subject.");
            return;
        }

        // Pop the last action from the history stack
        const lastAction = actionHistory[subjectIndex].pop();
        subjects[subjectIndex] = { ...lastAction.prevState };

        // Save the updated subjects and action history to localStorage
        localStorage.setItem(`${currentUser}_subjects`, JSON.stringify(subjects));
        localStorage.setItem(`${currentUser}_actionHistory`, JSON.stringify(actionHistory));

        // Update the subject list UI
        updateSubjectList();
    }

    // Delete a subject
    function confirmDelete(subjectIndex) {
        const confirmation = confirm("Are you sure you want to delete this subject?");
        if (confirmation) {
            subjects.splice(subjectIndex, 1); // Remove subject from array
            delete actionHistory[subjectIndex]; // Remove the action history for this subject
            localStorage.setItem(`${currentUser}_subjects`, JSON.stringify(subjects)); // Update storage
            localStorage.setItem(`${currentUser}_actionHistory`, JSON.stringify(actionHistory)); // Update action history storage
            updateSubjectList(); // Update the UI
        }
    }

    // Display user info and logout functionality
    const welcomeMessage = document.getElementById("welcome-message");
    welcomeMessage.textContent = `Welcome, ${currentUser}!`;

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", () => {
        alert("You have logged out!");
        localStorage.removeItem("loggedInUser"); // Clear logged-in user
        localStorage.removeItem(`${currentUser}_actionHistory`); // Clear session action history
        window.location.href = "index.html"; // Redirect to login page
    });

    // Initial update of the subject list UI
    updateSubjectList();
});
