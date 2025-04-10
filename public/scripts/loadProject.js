// Global variables
let draggedCard = null;
const placeholder = document.createElement("div");
placeholder.classList.add("placeholder");

let board = document.getElementById("board"); // Assuming board already exists

// Function to add a card to a specified list
function addCard(listId) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.draggable = true;

    const renameInput = document.createElement("input");
    renameInput.classList.add("cardRename");
    card.appendChild(renameInput);

    renameInput.addEventListener("change", () => {
        const content = document.createElement("p");
        content.textContent = renameInput.value;
        card.appendChild(content);
        renameInput.remove(); // Remove input after renaming
    });

    card.addEventListener("dragstart", () => {
        draggedCard = card;
        setTimeout(() => (card.style.visibility = "hidden"), 0);
    });

    card.addEventListener("dragend", () => {
        draggedCard.style.visibility = "visible";
        placeholder.remove();
    });
    
    renameInput.addEventListener("blur", () => {
      if(!renameInput.value.trim()){
        renameInput.remove();
        card.remove();
      }
      
    });
    
    document.getElementById(listId).appendChild(card);
    
    renameInput.focus();
}

// Function to enable drag-and-drop for lists
function setupDragAndDrop(list) {
    list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const closestCard = Array.from(list.querySelectorAll(".card")).reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;

        if (closestCard) {
            closestCard.parentNode.insertBefore(placeholder, closestCard);
        } else {
            list.appendChild(placeholder);
        }
    });

    list.addEventListener("dragleave", () => {
        if (placeholder.parentNode) {
            placeholder.remove();
        }
    });

    list.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedCard) {
            list.insertBefore(draggedCard, placeholder);
            draggedCard.style.visibility = "visible"; // ⬅️ Ensure visibility is restored
            placeholder.remove();
            draggedCard = null;
        }
    });
}

// Function to add a new list
function addList() {
    const listTitleInput = document.createElement("input");
    listTitleInput.classList.add("listTitleInput")
    board.appendChild(listTitleInput);

    const list = document.createElement("div");
    list.classList.add("list");

    const addCardsButton = document.createElement("button");
    addCardsButton.classList.add("add-card")
    addCardsButton.textContent = "Add Card";

    listTitleInput.addEventListener("change", () => {
        if (listTitleInput.value.trim() === "") return; // Prevent empty list creation

        const listTitle = document.createElement("h1");
        listTitle.textContent = listTitleInput.value;
        list.appendChild(listTitle);
        listTitleInput.remove(); // Remove input after entering name

        list.id = `list-${listTitleInput.value.replace(/\s+/g, "-")}`; // Unique list ID
        list.appendChild(addCardsButton);

        setupDragAndDrop(list);
        board.appendChild(list);
    });

    addCardsButton.addEventListener("click", () => {
        addCard(list.id);
    });

    listTitleInput.addEventListener("blur", () => {
        if (!listTitleInput.value.trim()) {
            listTitleInput.remove();
            list.remove(); // Remove list if unfocused and empty
        }
    });

    listTitleInput.focus(); // Automatically focus input on creation
}
