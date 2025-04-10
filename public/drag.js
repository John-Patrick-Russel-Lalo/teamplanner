// Get the draggable element
var dragItem = document.getElementById("div1");

// Variables to hold the initial position of the mouse or touch
var offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;

// Function to handle the drag
function startDrag(e) {
    // Prevent default behavior (especially on touch devices)
    e.preventDefault();
    
    // If it's a touch event, we use the touch's position
    if (e.type === "touchstart") {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    } else {  // Mouse event
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
    
    // Calculate the offset between the mouse/touch position and the div's top-left corner
    offsetX = mouseX - dragItem.getBoundingClientRect().left;
    offsetY = mouseY - dragItem.getBoundingClientRect().top;

    // Add the move event listeners for both mousemove and touchmove
    document.addEventListener("mousemove", moveElement);
    document.addEventListener("touchmove", moveElement, { passive: false });

    // Remove the event listeners when the mouse or touch is released
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
}

// Function to move the element
function moveElement(e) {
    var newX, newY;
    
    // If it's a touch event, we use the touch's position
    if (e.type === "touchmove") {
        newX = e.touches[0].clientX - offsetX;
        newY = e.touches[0].clientY - offsetY;
    } else {  // Mouse event
        newX = e.clientX - offsetX;
        newY = e.clientY - offsetY;
    }

    // Update the position of the draggable div
    dragItem.style.left = newX + "px";
    dragItem.style.top = newY + "px";
}

// Function to stop dragging
function stopDrag() {
    // Remove the event listeners for mousemove and touchmove
    document.removeEventListener("mousemove", moveElement);
    document.removeEventListener("touchmove", moveElement);

    // Remove the event listeners for mouseup and touchend
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchend", stopDrag);
}

// Add event listeners for both mouse and touch events to start the drag
dragItem.addEventListener("mousedown", startDrag);
dragItem.addEventListener("touchstart", startDrag, { passive: false });
