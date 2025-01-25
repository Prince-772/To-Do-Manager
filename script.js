const input = document.getElementById("todo-input");
const cont = document.querySelector(".todo-container");
const checkbox_input = document.getElementById("dark-mode");
const list = document.getElementById("todo-list");
const add_btn = document.getElementById("add-btn");
const search_btn = document.getElementById("search-btn");
let todos = [];
let taskId = 0;
let user_info = [{ dark_mode: true }];
let dragging;
let startY = null;

add_btn.addEventListener("click", add_to_do);
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    add_to_do();
  } else if (!input.value.trim()) {
    input.value = input.value.trim();
  }
});
list.addEventListener("dragstart", (e) => dragstart(e));
list.addEventListener("dragover", (e) => dragover(e));
list.addEventListener("dragend", (e) => drop(e));

function add_to_do() {
  const taskText = input.value.trim();
  if (taskText && !searching) {
    taskId++;
    const listItem = document.createElement("li");
    listItem.draggable = "true";
    listItem.dataset.id = taskId;
    listItem.innerHTML = `
            <input type="checkbox" class="done" name="done">
            <div class="text-area">${taskText}</div>
            <id style="display:none;">${taskId}</id>
            <div class="flex">
            <hr class="sep-text-btn">
            <button class="delete-btn fa fa-trash"></button>
            <button class="edit-btn fa fa-edit"></button>
            </div>`;
    list.appendChild(listItem);
    AttachEventListeners(listItem);
    listItem.classList.add("add-animate");
    setTimeout(() => {
      listItem.classList.remove("add-animate");
    }, 250);
    let currenttask = {
      task: taskText,
      completed: false,
      id: taskId,
    };
    todos.push(currenttask);
    localStorage.setItem("todos--1", JSON.stringify(todos));
    input.value = "";
    toggleDarkMode();
  }
}
async function delete_task(li, edit = false) {
  let id = li.querySelector("id").textContent; //id of current task which we have to delete
  if (edit) {
    if (input.value.trim() == "") {
      input.value = li.querySelector("div.text-area").textContent;
      li.classList.add("animate-edit");
    } else {
      document.querySelector(".msg").style.visibility = "visible";
      document.querySelector(".msg").classList.add("animate");
      await new Promise((res) =>
        setTimeout(() => {
          document.querySelector(".msg").style.visibility = "hidden";
          document.querySelector(".msg").classList.remove("animate");
          res();
        }, 600)
      );
      return;
    }
  } else {
    li.classList.add("animate-delete");
  }
  await new Promise((resolve) =>
    setTimeout(() => {
      li.remove();
      resolve();
    }, 250)
  );
  todos = todos.filter((todo) => todo.id != id); //remove from todos array
  localStorage.setItem("todos--1", JSON.stringify(todos));
}

function edit_to_do(li) {
  delete_task(li, true);
}
function done_or_not(li) {
  let check_done = li.querySelector(".done");
  let id = li.querySelector("id").textContent;
  todos.forEach((todo) => {
    if (check_done.checked && todo.id == id) {
      todo.completed = true;
    } else if (!check_done.checked && todo.id == id) {
      todo.completed = false;
    }
  });
  localStorage.setItem("todos--1", JSON.stringify(todos));
}
function dragstart(e) {
  startY = e.clientY;
  dragging = e.target;
  dragging.classList.add("dragging");
}
function dragover(e) {
  e.preventDefault();
  let lis = Array.from(list.children);
  let y = e.clientY + list.scrollTop;
  lis.forEach((li) => {
    let top = li.offsetTop;
    let bottom = top + li.offsetHeight;
    if (top < y && bottom > y && startY > y) {
      list.insertBefore(dragging, li);
    } else if (top < y && bottom > y && startY < y) {
      list.insertBefore(dragging, li.nextSibling);
    }
  });
}
function drop(e) {
  dragging.classList.remove("dragging");
  dragging = null;
  updateArray();
}

function updateArray() {
  let lis = Array.from(list.children);
  let CorrectOrderID = lis.map((li) => Number(li.dataset.id));
  todos = CorrectOrderID.map((data_id) => {
    return todos.find((todo) => todo.id === data_id);
  });
  localStorage.setItem("todos--1", JSON.stringify(todos));
}
function loadtasks() {
  if (
    localStorage.getItem("todos--1") &&
    localStorage.getItem("todos--1") !== "[]"
  ) {
    todos = JSON.parse(localStorage.getItem("todos--1"));
    taskId = todos[todos.length - 1].id;
    let list = document.getElementById("todo-list");
    todos.forEach((todo) => {
      const listItem = document.createElement("li");
      listItem.draggable = "true";
      listItem.dataset.id = todo.id;
      todo.id > taskId ? (taskId = todo.id) : (taskId = taskId);
      listItem.innerHTML = `
            <input type="checkbox" class="done" name="done">
            <div class="text-area">${todo.task}</div>
            <id style="display:none;">${todo.id}</id>
            <div class="flex">
            <hr class="sep-text-btn">
            <button class="delete-btn fa fa-trash"></button>
            <button class="edit-btn fa fa-edit"></button>
            </div>`;
      list.appendChild(listItem);
      AttachEventListeners(listItem);
      if (todo.completed) listItem.querySelector(".done").checked = true;
    });
  }
}
function AttachEventListeners(listItem) {
  listItem
    .querySelector(".delete-btn")
    .addEventListener("click", () => delete_task(listItem));
  listItem
    .querySelector(".edit-btn")
    .addEventListener("click", () => edit_to_do(listItem));
  listItem
    .querySelector(".done")
    .addEventListener("change", () => done_or_not(listItem));
}
checkbox_input.addEventListener("change", toggleDarkMode);
document.querySelector(".slider").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const checkbox = document.getElementById("dark-mode");
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change"));
  }
});

function toggleDarkMode() {
  const checkbox = document.querySelector("#dark-mode");

  const body = document.body;
  const todoContainer = document.querySelector(".todo-container");
  const input = document.getElementById("todo-input");
  const hrs = Array.from(document.querySelectorAll("hr.sep-text-btn"));
  const lis = Array.from(document.querySelectorAll("#todo-list li"));

  if (checkbox.checked) {
    user_info[0].dark_mode = true;
    body.classList.add("dark");
    search_btn.classList.add("dark");
    todoContainer.classList.add("dark");
    input.classList.add("dark");
    lis.forEach((li) => {
      li.classList.add("dark");
    });
    hrs.forEach((hr) => {
      hr.classList.add("dark");
    });
  } else {
    user_info[0].dark_mode = false;
    body.classList.remove("dark");
    search_btn.classList.remove("dark");
    todoContainer.classList.remove("dark");
    input.classList.remove("dark");
    lis.forEach((li) => {
      li.classList.remove("dark");
    });
    hrs.forEach((hr) => {
      hr.classList.remove("dark");
    });
  }
  localStorage.setItem("user-info-to-do--1", JSON.stringify(user_info));
}
loadtasks();
if (
  localStorage.getItem("user-info-to-do--1") &&
  localStorage.getItem("user-info-to-do--1") !== "[]"
) {
  user_info = JSON.parse(localStorage.getItem("user-info-to-do--1"));
  if (user_info[0].dark_mode) {
    checkbox_input.checked = true; //checked if dark mode is enabled
    toggleDarkMode(); //dark mode
  } else {
    checkbox_input.checked = false;
    toggleDarkMode();
  }
} else {
  checkbox_input.checked = true; //checked by default
  toggleDarkMode(); //bydefault dark mode
  user_info[0].dark_mode = true;
  localStorage.setItem("user-info-to-do--1", JSON.stringify(user_info));
}
let searching = false;

search_btn.addEventListener("click", () => {
  searching = !searching;
  if (searching) {
    search_btn.classList.add("searching");
    add_btn.disabled = true;
    input.placeholder = "Search...";
    HandleSearching()
  } else {
    search_btn.classList.remove("searching");
    add_btn.disabled = false;
    Array.from(list.children).forEach((li) => (li.style.display = "flex"));
    input.placeholder = "Add A New Task";
    input.value = ""
  }
});
input.addEventListener("input", HandleSearching);
function HandleSearching() {
  if (searching) {
    let todos = Array.from(list.children);
    let quarry = input.value.trim();
    todos.forEach((todo) => {
      let todoText = todo.querySelector(".text-area").textContent;
      if (!todoText.toLowerCase().includes(quarry.toLowerCase())) {
        todo.style.display = "none";
      } else {
        todo.style.display = "flex";
      }
    });
  }
}
