
document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const projectList = document.querySelector(".innerdiv2 ol");

  if (!userId) return alert("No user ID found!");

  try {
    const res = await fetch(`/api/get-projects?userId=${userId}`);
    const data = await res.json();

    if (!Array.isArray(data.projects)) {
      return alert("No projects found.");
    }

    projectList.innerHTML = ""; // Clear placeholder items

    data.projects.forEach(project => {
      const li = document.createElement("li");
      li.textContent = project.name;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        localStorage.setItem("projectId", project.id);
        window.location.href = "/loadProject.html";
      });
      projectList.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading projects:", err);
    alert("Failed to load projects.");
  }
});
