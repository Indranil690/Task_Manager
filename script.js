const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateProgress() {
    let total = tasks.length;
    let completed = tasks.filter(t => t.completed).length;

    if (total === 0) {
        progressText.textContent = "No tasks yet";
        progressFill.style.width = "0%";
        progressFill.style.background = "#28a745";
    } else {
        let percent = Math.round((completed / total) * 100);
        progressText.textContent = `Completed ${completed}/${total} tasks (${percent}%)`;
        progressFill.style.width = percent + "%";

        if (percent <= 30) {
            progressFill.style.background = "#dc3545"; // red
        } else if (percent <= 70) {
            progressFill.style.background = "#ffc107"; // orange
        } else {
            progressFill.style.background = "#28a745"; // green
        }
    }
}

let draggedIndex = null; // store the dragged task index
let placeholder = document.createElement("li"); // placeholder for visual insert
placeholder.className = "placeholder";

let currentFilter = "all"; // default filter
let selectedIndex = null;  // for Delete key

// Filter buttons
const filterAll = document.getElementById("filterAll");
const filterCompleted = document.getElementById("filterCompleted");
const filterIncomplete = document.getElementById("filterIncomplete");

filterAll.addEventListener("click", () => setFilter("all"));
filterCompleted.addEventListener("click", () => setFilter("completed"));
filterIncomplete.addEventListener("click", () => setFilter("incomplete"));

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    if (filter === "all") filterAll.classList.add("active");
    if (filter === "completed") filterCompleted.classList.add("active");
    if (filter === "incomplete") filterIncomplete.classList.add("active");
    renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    // Apply filter
    if (currentFilter === "completed" && !task.completed) return;
    if (currentFilter === "incomplete" && task.completed) return;

    let li = document.createElement("li");
    li.draggable = true;

    // Highlight selected task
    if (selectedIndex === index) li.classList.add("selected");

    // Drag events
    li.addEventListener("dragstart", (e) => {
        draggedIndex = index;
        li.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        placeholder.remove();
    });

    li.addEventListener("dragover", (e) => {
        e.preventDefault();
        let bounding = li.getBoundingClientRect();
        let offset = e.clientY - bounding.top;

        if (offset > bounding.height / 2) {
            if (li.nextSibling !== placeholder) {
                taskList.insertBefore(placeholder, li.nextSibling);
            }
        } else {
            if (li.previousSibling !== placeholder) {
                taskList.insertBefore(placeholder, li);
            }
        }
    });

    li.addEventListener("drop", (e) => {
        e.preventDefault();
        let newIndex = Array.from(taskList.children).indexOf(placeholder);

        let draggedTask = tasks[draggedIndex];
        tasks.splice(draggedIndex, 1);
        tasks.splice(newIndex, 0, draggedTask);
        saveTasks();
        renderTasks();
    });

    // Task name span
    let span = document.createElement("span");
    span.textContent = task.name;
    if (task.completed) span.classList.add("completed");
    span.style.cursor = "pointer";

    span.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Select task for Delete key
    li.addEventListener("click", () => {
        selectedIndex = index;
        taskList.querySelectorAll("li").forEach(item => item.classList.remove("selected"));
        li.classList.add("selected");
    });

    // Edit button
    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", () => {
      let newName = prompt("Edit task:", task.name);
      if (newName !== null && newName.trim() !== "") {
        tasks[index].name = newName.trim();
        saveTasks();
        renderTasks();
      }
    });

    // Delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  updateProgress();
}

// Add task
addBtn.addEventListener("click", () => {
  if (taskInput.value.trim() === "") return;
  tasks.push({ name: taskInput.value, completed: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

// Press Enter to add task
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBtn.click();
});

// Press Delete key to remove selected task
document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" && selectedIndex !== null) {
        tasks.splice(selectedIndex, 1);
        saveTasks();
        renderTasks();
        selectedIndex = null;
    }
});

// Clear completed tasks
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// First render
renderTasks();
