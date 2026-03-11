import readline from 'readline';
import fs from 'fs';
import path from 'path';
import {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  clearTasks,
  tasks as taskStore,
} from './src/task.js';
import {
  checkTitle,
  checkDeadline,
  checkPriority,
  checkStatus,
  logAction,
} from './src/utils.js';
import { exportToJSON, exportToCSV } from './src/export.js';

const DATA_FILE = path.resolve('./data/tasks.json');

function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return;
    }

    clearTasks();
    parsed.forEach((task) => addTask(task));
  } catch (error) {
    console.error('Не вдалося завантажити задачі:', error.message);
  }
}

function saveTasks() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(taskStore, null, 2), 'utf-8');
  } catch (error) {
    console.error('Не вдалося зберегти задачі:', error.message);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

function displayTasks(list) {
  if (!list || list.length === 0) {
    console.log('🔎 Немає задач, які відповідають критеріям.');
    return;
  }

  console.log('\n📋 Список задач:');
  list.forEach((task, idx) => {
    const id = idx + 1;
    console.log(`------------------------------`);
    console.log(`ID: ${id}`);
    console.log(`Title     : ${task.title}`);
    console.log(`Description: ${task.description || '-'} `);
    console.log(`Deadline  : ${task.deadline || '-'} `);
    console.log(`Priority  : ${task.priority || '-'} `);
    console.log(`Status    : ${task.status ? 'Done' : 'Pending'}`);
  });
  console.log('------------------------------\n');
}

function parseId(input) {
  const id = Number.parseInt(input, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id - 1;
}

async function addTaskFlow() {
  const title = await question('📝 Введіть назву задачі: ');
  const titleError = checkTitle(title);
  if (titleError) {
    console.log('❌', titleError);
    return;
  }

  const description = await question('📝 Введіть опис (необовʼязково): ');
  const deadline = await question('📅 Введіть дедлайн (YYYY-MM-DD) (необовʼязково): ');
  const deadlineError = checkDeadline(deadline);
  if (deadlineError) {
    console.log('❌', deadlineError);
    return;
  }

  const priority = await question('⚡ Пріоритет (low/medium/high) (необовʼязково): ');
  const priorityError = checkPriority(priority);
  if (priorityError) {
    console.log('❌', priorityError);
    return;
  }

  const statusRaw = await question('✅ Статус (true/false) (необовʼязково): ');
  const status = statusRaw.toLowerCase() === 'true' ? true : statusRaw.toLowerCase() === 'false' ? false : undefined;
  if (status !== undefined) {
    const statusError = checkStatus(status);
    if (statusError) {
      console.log('❌', statusError);
      return;
    }
  }

  const task = addTask({
    title,
    description,
    deadline: deadline || undefined,
    priority: priority || 'low',
    status: typeof status === 'boolean' ? status : false,
  });

  saveTasks();
  logAction(`Додано задачу: ${task.title}`);
  console.log('✅ Задачу додано!');
}

async function listTasksFlow({ search } = {}) {
  if (search) {
    const tasksList = getTasks({ search });
    displayTasks(tasksList);
  } else {
    displayTasks(taskStore);
  }
}

async function updateTaskFlow() {
  const idInput = await question('🆔 Введіть ID задачі для редагування: ');
  const index = parseId(idInput);
  if (index === null) {
    console.log('❌ Невірний ID. Введіть ціле число більше 0.');
    return;
  }

  const existing = taskStore[index];
  if (!existing) {
    console.log('❌ Задача з таким ID не знайдена.');
    return;
  }

  console.log('Обирайте поля для оновлення (залиште порожнім, щоб не змінювати):');
  const title = await question(`📝 Назва [${existing.title}]: `);
  if (title) {
    const titleError = checkTitle(title);
    if (titleError) {
      console.log('❌', titleError);
      return;
    }
  }

  const description = await question(`📝 Опис [${existing.description || '-'}]: `);

  const deadline = await question(`📅 Дедлайн [${existing.deadline || '-'}]: `);
  if (deadline) {
    const deadlineError = checkDeadline(deadline);
    if (deadlineError) {
      console.log('❌', deadlineError);
      return;
    }
  }

  const priority = await question(`⚡ Пріоритет [${existing.priority}]: `);
  if (priority) {
    const priorityError = checkPriority(priority);
    if (priorityError) {
      console.log('❌', priorityError);
      return;
    }
  }

  const statusRaw = await question(`✅ Статус (true/false) [${existing.status}]: `);
  let status;
  if (statusRaw) {
    status = statusRaw.toLowerCase() === 'true' ? true : statusRaw.toLowerCase() === 'false' ? false : undefined;
    if (status === undefined) {
      console.log('❌ Невірний статус. Введіть true або false.');
      return;
    }
    const statusError = checkStatus(status);
    if (statusError) {
      console.log('❌', statusError);
      return;
    }
  }

  const updated = updateTask(index, {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(deadline ? { deadline } : {}),
    ...(priority ? { priority } : {}),
    ...(status !== undefined ? { status } : {}),
  });

  if (!updated) {
    console.log('❌ Не вдалося оновити задачу.');
    return;
  }

  saveTasks();
  logAction(`Оновлено задачу: ${updated.title}`);
  console.log('✅ Задачу оновлено!');
}

async function deleteTaskFlow() {
  const idInput = await question('🆔 Введіть ID задачі для видалення: ');
  const index = parseId(idInput);
  if (index === null) {
    console.log('❌ Невірний ID. Введіть ціле число більше 0.');
    return;
  }

  const existing = taskStore[index];
  if (!existing) {
    console.log('❌ Задача з таким ID не знайдена.');
    return;
  }

  const confirm = await question(`Ви впевнені, що хочете видалити задачу "${existing.title}"? (y/n): `);
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Видалення скасовано.');
    return;
  }

  const deleted = deleteTask(index);
  if (!deleted) {
    console.log('❌ Не вдалося видалити задачу.');
    return;
  }

  saveTasks();
  logAction(`Видалено задачу: ${deleted.title}`);
  console.log('✅ Задачу видалено.');
}

async function searchTasksFlow() {
  const keyword = await question('🔍 Введіть ключове слово для пошуку: ');
  if (!keyword) {
    console.log('❌ Ключове слово не може бути порожнім.');
    return;
  }

  const results = getTasks({ search: keyword });
  displayTasks(results);
}

async function exportTasksFlow() {
  const format = await question('Виберіть формат експорту (json/csv): ');
  const allTasks = getTasks();
  let result;

  if (format.toLowerCase() === 'json') {
    result = exportToJSON(allTasks);
  } else if (format.toLowerCase() === 'csv') {
    result = exportToCSV(allTasks);
  } else {
    console.log('❌ Невідомий формат. Введіть json або csv.');
    return;
  }

  if (result.success) {
    logAction(`Експорт задач до ${format.toUpperCase()}`);
    console.log('✅', result.message);
  } else {
    console.log('❌', result.message);
  }
}

function showMenu() {
  console.log(`
===== Меню Task Manager =====
1) Додати задачу
2) Показати всі задачі
3) Редагувати задачу
4) Видалити задачу
5) Знайти задачу
6) Експортувати задачі
0) Вийти
`);
}

async function main() {
  loadTasks();
  while (true) {
    showMenu();
    const choice = await question('Виберіть опцію: ');

    switch (choice.trim()) {
      case '1':
        await addTaskFlow();
        break;
      case '2':
        await listTasksFlow();
        break;
      case '3':
        await updateTaskFlow();
        break;
      case '4':
        await deleteTaskFlow();
        break;
      case '5':
        await searchTasksFlow();
        break;
      case '6':
        await exportTasksFlow();
        break;
      case '0':
        console.log('👋 Дякую, до зустрічі!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Невірна опція, спробуйте ще раз.');
        break;
    }
  }
}

main().catch((error) => {
  console.error('Сталася помилка:', error.message);
  rl.close();
  process.exit(1);
});
