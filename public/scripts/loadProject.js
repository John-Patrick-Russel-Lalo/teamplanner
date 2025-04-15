let board = document.getElementById("board");
const userId = localStorage.getItem('userId');
const projectId = new URLSearchParams(window.location.search).get("id");

let boardData = {
  title: "Untitled",
  lists: []
};

const socket = new WebSocket("wss://teamplanner-server.onrender.com");

// WebSocket logic
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

// Load project from Vercel
async function loadProject() {
  const res = await fetch(`/api/project?id=${projectId}&userId=${userId}`);
  const result = await res.json();
  boardData = result.board || { title: "Untitled", lists: [] };
  renderFullBoard();
}

function renderFullBoard() {
  board.innerHTML = "";
  boardData.lists.forEach((list, i) => {
    const listContainer = document.createElement("div");
    listContainer.classList.add("list");
    listContainer.id = list.id;

    const listTitle = document.createElement("h1");
    listTitle.textContent = list.name;
    listContainer.appendChild(listTitle);

    const addCardButton = document.createElement("button");
    addCardButton.classList.add("add-card");
    addCardButton.textContent = "+ Add Card";
    addCardButton.addEventListener("click", () => {
        addCard(list.id);
    });

    list.cards.forEach((cardText) => {
      const card = document.createElement("div");
      card.classList.add("card");
      const cardP = document.createElement("p");
      cardP.textContent = cardText;
      card.appendChild(cardP);
      listContainer.appendChild(card);
    });

    listContainer.appendChild(addCardButton);
    board.appendChild(listContainer);

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card",
      ghostClass: "ghost",
      chosenClass: "chosen",
      onEnd: () => {
        syncBoard();
      }
    });
  });
}

// Modify your addList to update boardData and sync
function addList() {
  const listContainer = document.createElement("div");
  listContainer.classList.add("list");

  const listTitleInput = document.createElement("input");
  listTitleInput.placeholder = "List name";
  listContainer.appendChild(listTitleInput);

  const addCardButton = document.createElement("button");
  addCardButton.classList.add("add-card");
  addCardButton.textContent = "+ Add Card";

  listTitleInput.addEventListener("change", () => {
    if (!listTitleInput.value.trim()) return;

    const listTitle = document.createElement("h1");
    listTitle.textContent = listTitleInput.value;
    listContainer.appendChild(listTitle);
    listTitleInput.remove();

    const listId = `list-${Date.now()}`;
    listContainer.id = listId;
    listContainer.appendChild(addCardButton);
    board.appendChild(listContainer);

    boardData.lists.push({
      id: listId,
      name: listTitle.textContent,
      cards: []
    });

    syncBoard();

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card",
      ghostClass: "ghost",
      chosenClass: "chosen",
      onEnd: () => {
        syncBoard();
      }
    });
  });

  addCardButton.addEventListener("click", () => {
    addCard(listContainer.id);
  });

  listTitleInput.addEventListener("blur", () => {
    if (!listTitleInput.value.trim()) {
      listTitleInput.remove();
      listContainer.remove();
    }
  });

  board.appendChild(listContainer);
  listTitleInput.focus();
}

function addCard(listId) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.draggable = true;

  const renameInput = document.createElement("input");
  renameInput.classList.add("cardRename");
  card.appendChild(renameInput);

  renameInput.addEventListener("change", () => {
    if (!renameInput.value.trim()) {
      card.remove();
      return;
    }
    const content = document.createElement("p");
    content.textContent = renameInput.value;
    card.appendChild(content);
    renameInput.remove();

    const list = boardData.lists.find(l => l.id === listId);
    if (list) {
      list.cards.push(content.textContent);
      syncBoard();
    }
  });

  renameInput.addEventListener("blur", () => {
    if (!renameInput.value.trim()) {
      card.remove();
    }
  });

  document.getElementById(listId).appendChild(card);
  renameInput.focus();
}

// Send updated board to WebSocket
function syncBoard() {
  socket.send(JSON.stringify({
    type: "updateBoard",
    projectId,
    boardData
  }));
}

loadProject();
      
