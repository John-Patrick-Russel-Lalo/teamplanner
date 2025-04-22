document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const projectList = document.querySelector('.innerdiv2 ol');
  const addButton = document.querySelector('.div2 button');

  if (!userId) {
    window.location.href = '/';
    return;
  }

  // Load user's projects
  async function fetchProjects() {
    try {
      const res = await fetch(`/api/get-user-projects?userId=${userId}`);
      const data = await res.json();

      projectList.innerHTML = '';

      data.projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id;

        li.addEventListener('click', () => {
          localStorage.setItem('projectId', project.id);
          window.location.href = '/loadProject.html';
        });

        projectList.appendChild(li);
      });
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      alert('Could not load projects.');
    }
  }

  // Add new project
  addButton.addEventListener('click', async () => {
    const name = prompt('Enter a name for your new project:');
    if (!name) return;

    try {
      const res = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId, board: {} })
      });

      const data = await res.json();
      if (data.project) {
        localStorage.setItem('projectId', data.project.id);
        window.location.href = '/loadProject.html';
      } else {
        alert('Failed to create project.');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Could not create project.');
    }
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    console.log("test")
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});

// Optional: close menu on click outside
window.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');

  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.style.display = 'none';
  }
});



  setInterval(fetchProjects, 1000);
});

function logout(event) {
  event.preventDefault();

  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to logout?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, logout'
  }).then((result) => {
    if (result.isConfirmed) {
      google.accounts.id.disableAutoSelect(); // stop auto-login
      localStorage.removeItem('userId');
      window.location.href = "/";
    }
  });
}

