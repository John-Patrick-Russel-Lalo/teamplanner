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

// Load project from API
async function loadProject() {
  if (!projectId || !userId) {
    console.error("Missing projectId or userId");
    return alert("Missing project or user info.");
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
    alert("Could not load project.");
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

    list.cards.forEach((cardText) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const cardP = document.createElement("p");
      cardP.textContent = cardText;

      card.appendChild(cardP);
      listContainer.appendChild(card);
    });

    const addCardButton = document.createElement("button");
    addCardButton.classList.add("add-card");
    addCardButton.textContent = "+ Add Card";
    addCardButton.addEventListener("click", () => addCard(list.id));

    listContainer.appendChild(addCardButton);
    board.appendChild(listContainer);

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card",
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

  listTitleInput.addEventListener("change", () => {
    const name = listTitleInput.value.trim();
    if (!name) return;

    const listTitle = document.createElement("h1");
    listTitle.textContent = name;
    listContainer.appendChild(listTitle);
    listTitleInput.remove();

    const listId = `list-${Date.now()}`;
    listContainer.id = listId;
    listContainer.appendChild(addCardButton);
    board.appendChild(listContainer);

    boardData.lists.push({ id: listId, name, cards: [] });

    syncBoard();

    new Sortable(listContainer, {
      group: "shared",
      animation: 150,
      draggable: ".card",
      filter: "h1, .add-card",
      ghostClass: "ghost",
      chosenClass: "chosen",
      onEnd: syncBoard
    });
  });

  addCardButton.addEventListener("click", () => addCard(listContainer.id));

  listTitleInput.addEventListener("blur", () => {
    if (!listTitleInput.value.trim()) {
      listContainer.remove();
    }
  });

  board.appendChild(listContainer);
  listTitleInput.focus();
}

function addCard(listId) {
  const card = document.createElement("div");
  card.classList.add("card");

  const renameInput = document.createElement("input");
  renameInput.classList.add("cardRename");
  card.appendChild(renameInput);

  renameInput.addEventListener("change", () => {
    const text = renameInput.value.trim();
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
  });

  renameInput.addEventListener("blur", () => {
    if (!renameInput.value.trim()) {
      card.remove();
    }
  });

  document.getElementById(listId).appendChild(card);
  renameInput.focus();
}

function syncBoard() {
  socket.send(JSON.stringify({
    type: "updateBoard",
    projectId,
    boardData
  }));
}

document.addEventListener("DOMContentLoaded", loadProject);
                                  
