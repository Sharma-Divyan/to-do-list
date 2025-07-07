const API_URL = 'https://dummyjson.com/todos';
let todos = [];
let filteredTodos = [];
let currentPage = 1;
const pageSize = 5;

const todoList = document.getElementById('todoList');
const addTodoForm = document.getElementById('addTodoForm');
const newTodoInput = document.getElementById('newTodo');
const searchInput = document.getElementById('search');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const pagination = document.getElementById('pagination');
const resetBtn = document.getElementById('resetFilters');

const addMockDates = (data) =>
  data.map((item, index) => ({
    ...item,
    createdAt: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
  }));

const showLoading = (show) => {
  loadingDiv.classList.toggle('d-none', !show);
};

const showError = (message = '') => {
  errorDiv.classList.toggle('d-none', !message);
  errorDiv.textContent = message;
};

const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

const renderPagination = (total) => {
  pagination.innerHTML = '';
  const pageCount = Math.ceil(total / pageSize);
  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.addEventListener('click', () => {
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
};

const renderTodos = () => {
  todoList.innerHTML = '';
  let displayTodos = [...filteredTodos];

  const searchText = searchInput.value.toLowerCase();
  if (searchText) {
    displayTodos = displayTodos.filter((todo) =>
      todo.todo.toLowerCase().includes(searchText)
    );
  }

  const from = fromDateInput.value;
  const to = toDateInput.value;
  if (from) displayTodos = displayTodos.filter((t) => t.createdAt >= from);
  if (to) displayTodos = displayTodos.filter((t) => t.createdAt <= to);

  const pageTodos = paginate(displayTodos, currentPage, pageSize);
  pageTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${todo.todo}</span>
      <small class="text-muted">${todo.createdAt}</small>
    `;
    todoList.appendChild(li);
  });

  renderPagination(displayTodos.length);
};

const fetchTodos = async () => {
  showLoading(true);
  showError('');
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch todos');
    const data = await res.json();
    todos = addMockDates(data.todos);
    filteredTodos = [...todos];
    renderTodos();
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
};

const addTodo = async (text) => {
  showError('');
  try {
    const res = await fetch(API_URL + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: text, completed: false, userId: 1 }),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    const newTodo = await res.json();
    newTodo.createdAt = new Date().toISOString().split('T')[0];
    todos.unshift(newTodo);
    filteredTodos = [...todos];
    newTodoInput.value = '';
    currentPage = 1;
    renderTodos();
  } catch (err) {
    showError(err.message);
  }
};

// Event Listeners
addTodoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = newTodoInput.value.trim();
  if (text) addTodo(text);
});

searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderTodos();
});

fromDateInput.addEventListener('change', () => {
  currentPage = 1;
  renderTodos();
});

toDateInput.addEventListener('change', () => {
  currentPage = 1;
  renderTodos();
});

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  fromDateInput.value = '';
  toDateInput.value = '';
  currentPage = 1;
  renderTodos();
});

fetchTodos();
