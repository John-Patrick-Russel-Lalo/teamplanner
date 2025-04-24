let board = document.getElementById("board");
const projectId = localStorage.getItem("projectId");
const userId = localStorage.getItem("userId");

let boardData = {
  title: "Untitled",
  lists: []
};

// WebSocket setup
const socket = new WebSocket("wss://teamplanner-server.onrender.com");

socket.onopen = () => {
  console.log("Connected to WebSocket");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "updateBoard" && data.projectId === projectId) {
    boardData = data.boardData;
    renderFullBoard();
  }
};

let name;
let text;

// Load project from API
async function loadProject() {
  if (!projectId || !userId) {
    Swal.fire({
      title: "Missing projectId or userId",
      confirmButtonColor: "#2c3e50"
    });
    return Swal.fire({
      title: "Missing projectId or userId",
      confirmButtonColor: "#2c3e50"
    });
  }

  console.log("Loading project with:", projectId, userId);

  try {
    const res = await fetch(`/api/project?id=${projectId}&userId=${userId}`);
    const data = await res.json();

    if (!data.project) {
      throw new Error("No project found in response");
    }

    boardData = data.project.board || { title: "Untitled", lists: [] };
    console.log(data.project.board);
    renderFullBoard();
  } catch (err) {
    console.error("Failed to load project:", err);
    Swal.fire({
      title: "Cannot load the projects",
      confirmButtonColor: "#2c3e50"
    });
  }
}

function renderFullBoard() {
  board.innerHTML = "";

  boardData.lists.forEach((list) => {
    const listContainer = document.createElement("div");
    listContainer.classList.add("list");
    listContainer.id = list.id;

    const listTitle = document.createElement("h1");
    listTitle.textContent = list.name;
    listContainer.appendChild(listTitle);

    const delBtn = document.createElement("button");
    const editBtn = document.createElement("button");
  

    list.cards.forEach((cardText) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const cardP = document.createElement("p");
      cardP.textContent = cardText;

      card.appendChild(cardP);

      card.appendChild(editBtn);
      card.appendChild(delBtn);
      listContainer.appendChild(card);
    });

    const addCardButton = document.createElement("button");
    addCardButton.classList.add("add-card");
    addCardButton.textContent = "+ Add Card";
    addCardButton.addEventListener("click", () => addCard(list.id));

    listContainer.appendChild(addCardButton);

    const listDelBtn = document.createElement("button");
    const listEditBtn = document.createElement("button");
    listDelBtn.classList.add("listDelBtn");
    listEditBtn.classList.add("listEditBtn");
    listDelBtn.textContent = "Delete";
    listEditBtn.textContent = "Edit";
    
    board.appendChild(listContainer);

    listContainer.appendChild(listEditBtn);
    listContainer.appendChild(listDelBtn);

    
    delBtn.classList.add("delBtn");
    editBtn.classList.add("editBtn");
    
    delBtn.textContent = "Delete";
    editBtn.textContent = "Edit";
  
    


    listDelBtn.addEventListener("click", () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'confirmBtn',
        cancelButton: 'cancelBtn'
      }
    }).then((result) => {
      if(result.isConfirmed){
        boardData.lists = boardData.lists.filter(l => l.id !== list.id);
        listContainer.remove();
        syncBoard();
        Swal.fire({
          title: "Successfully Deleted",
          confirmButtonColor: "#2c3e50"
        })
        
      }
    })

  })

  listEditBtn.addEventListener("click", () => {
  const currentListTitle = listContainer.querySelector("h1").textContent;

  Swal.fire({
    title: 'Edit List Name',
    input: 'text',
    inputValue: currentListTitle,
    showCancelButton: true,
    confirmButtonColor: '#2c3e50',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Update'
  }).then((result) => {
    if (result.isConfirmed && result.value.trim()) {
      const newTitle = result.value.trim();

      // Update DOM
      listContainer.querySelector("h1").textContent = newTitle;

      // Update boardData
      const list = boardData.lists.find(l => l.id === listContainer.id);
      if (list) {
        list.name = newTitle;
      }

      syncBoard();
    }
  });
});

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card, .listDelBtn, .listEditBtn",
      ghostClass: "ghost",
      chosenClass: "chosen",
      onEnd: syncBoard
    });
  });
}

function addList() {
  
  
  
  const listContainer = document.createElement("div");
  listContainer.classList.add("list");

  const listTitleInput = document.createElement("input");
  listTitleInput.placeholder = "List name";
  listContainer.appendChild(listTitleInput);

  const addCardButton = document.createElement("button");
  addCardButton.classList.add("add-card");
  addCardButton.textContent = "+ Add Card";
  
  const listDelBtn = document.createElement("button");
  const listEditBtn = document.createElement("button");
  listDelBtn.classList.add("listDelBtn");
  listEditBtn.classList.add("listEditBtn");
  listDelBtn.textContent = "Delete";
  listEditBtn.textContent = "Edit";
  
  

  listTitleInput.addEventListener("change", () => {
    name = listTitleInput.value.trim();
    if (!name) return;

    const listTitle = document.createElement("h1");
    listTitle.textContent = name;
    listContainer.appendChild(listTitle);
    listTitleInput.remove();

    const listId = `list-${Date.now()}`;
    listContainer.id = listId;
    listContainer.appendChild(addCardButton);
    board.appendChild(listContainer);
    
    listContainer.appendChild(listEditBtn);
    listContainer.appendChild(listDelBtn);

    boardData.lists.push({ id: listId, name, cards: [] });

    syncBoard();

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card, .delBtn, .editBtn",
      ghostClass: "ghost",
      chosenClass: "chosen",
      onEnd: syncBoard
    });
  });

  addCardButton.addEventListener("click", () => addCard(listContainer.id));
  
  listDelBtn.addEventListener("click", () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'confirmBtn',
        cancelButton: 'cancelBtn'
      }
    }).then((result) => {
      if(result.isConfirmed){
        listContainer.remove();
        Swal.fire({
          title: "Successfully Deleted",
          confirmButtonColor: "#2c3e50"
        })
      }
    })

  })

  listEditBtn.addEventListener("click", () => {
  const currentListTitle = listContainer.querySelector("h1").textContent;

  Swal.fire({
    title: 'Edit List Name',
    input: 'text',
    inputValue: currentListTitle,
    showCancelButton: true,
    confirmButtonColor: '#2c3e50',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Update'
  }).then((result) => {
    if (result.isConfirmed && result.value.trim()) {
      const newTitle = result.value.trim();

      // Update DOM
      listContainer.querySelector("h1").textContent = newTitle;

      // Update boardData
      const list = boardData.lists.find(l => l.id === listContainer.id);
      if (list) {
        list.name = newTitle;
      }

      syncBoard();
    }
  });
});

  listTitleInput.addEventListener("blur", () => {
    if (!listTitleInput.value.trim()) {
      listContainer.remove();
    }
  });

  board.appendChild(listContainer);
  listTitleInput.focus();
}

function addCard(listId) {
  
  const delBtn = document.createElement("button");
  const editBtn = document.createElement("button");
  
  const card = document.createElement("div");
  card.classList.add("card");

  const renameInput = document.createElement("input");
  renameInput.classList.add("cardRename");
  card.appendChild(renameInput);

  renameInput.addEventListener("change", () => {
    text = renameInput.value.trim();
    if (!text) {
      card.remove();
      return;
    }

    const content = document.createElement("p");
    content.textContent = text;
    card.appendChild(content);
    renameInput.remove();

    const list = boardData.lists.find(l => l.id === listId);
    if (list) {
      list.cards.push(text);
      syncBoard();
    }
    
    
    
    delBtn.classList.add("delBtn");
    editBtn.classList.add("editBtn");
    
    delBtn.textContent = "Delete";
    editBtn.textContent = "Edit";
  
    card.appendChild(editBtn);
    card.appendChild(delBtn);
    
    
  });

  renameInput.addEventListener("blur", () => {
    if (!renameInput.value.trim()) {
      card.remove();
    }
  });
  
  delBtn.addEventListener("click", () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'confirmBtn',
        cancelButton: 'cancelBtn'
      }
    }).then((result) => {
      if(result.isConfirmed){
        card.remove();
        Swal.fire({
          title: "Successfully Deleted",
          confirmButtonColor: "#2c3e50"
        })
      }
    })
  
  });


  editBtn.addEventListener("click", () => {
  const currentText = card.querySelector("p")?.textContent || "";

  Swal.fire({
    title: 'Edit Card',
    input: 'text',
    inputValue: currentText,
    showCancelButton: true,
    confirmButtonColor: '#2c3e50',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Update'
  }).then((result) => {
    if (result.isConfirmed && result.value.trim()) {
      const newText = result.value.trim();

      // Update text in DOM
      card.querySelector("p").textContent = newText;

      // Update in boardData
      const list = boardData.lists.find(l => l.id === listId);
      const cardIndex = list.cards.indexOf(currentText);
      if (cardIndex !== -1) {
        list.cards[cardIndex] = newText;
      }

      syncBoard();
    }
  });
});


  
  
      
  
  

  document.getElementById(listId).appendChild(card);
  renameInput.focus();
  
  
}

function goBack(){
  history.back();
}



function syncBoard() {
  socket.send(JSON.stringify({
    type: "updateBoard",
    projectId,
    boardData
  }));
}

document.addEventListener("DOMContentLoaded", loadProject);

                                             
