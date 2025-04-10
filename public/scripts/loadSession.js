const currentUserId = localStorage.getItem("currentUserId"); // Replace with actual user ID from Google Auth
const currentProjectId = "project-456"; // Replace with actual project ID

// Function to get the current project state (convert UI to JSON)
function getCurrentProjectState() {
    return {
        tasks: document.querySelector("#tasks").innerHTML, // Example task state
        columns: document.querySelector("#columns").innerHTML
        column: task.closest(".column").id
    };
}

// Save session to backend
async function saveSession() {
    const sessionData = {
        user_id: currentUserId,
        project_id: currentProjectId,
        progress: JSON.stringify(getCurrentProjectState())
    };

    try {
        await fetch("/api/save-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData)
        });
        console.log("Session saved!");
    } catch (error) {
        console.error("Error saving session:", error);
    }
}

// Restore session from backend
async function restoreSession() {
    try {
        const response = await fetch(`/api/get-session?user_id=${currentUserId}&project_id=${currentProjectId}`);
        const data = await response.json();

        if (data.progress) {
            const projectState = JSON.parse(data.progress);
            document.querySelector("#tasks").innerHTML = projectState.tasks;
            document.querySelector("#columns").innerHTML = projectState.columns;
            console.log("Session restored!");
        }
    } catch (error) {
        console.error("Error restoring session:", error);
    }
}

// Auto-save every 10 seconds
//setInterval(saveSession, 10000);

// Restore session when page loads
window.addEventListener("load", restoreSession);
