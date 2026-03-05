export class Task {
    constructor({ title, description = "", deadline, priority = "low", status = false }) {
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.priority = priority;
        this.status = status;
    }
}

export let tasks = [];

const normalizeDeadline = (deadline) => {
    const parsed = new Date(deadline);
    return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

const sortByDeadline = (a, b) => normalizeDeadline(a.deadline) - normalizeDeadline(b.deadline);

export function addTask(taskData) {
    const task = taskData instanceof Task ? taskData : new Task(taskData);
    tasks.push(task);
    return task;
}

export function getTasks(filters = {}, sortBy = "deadline") {
    const { priority, status } = filters;

    let result = tasks.filter((task) => {
        const priorityMatch = priority ? task.priority === priority : true;
        const statusMatch = typeof status === "boolean" ? task.status === status : true;
        return priorityMatch && statusMatch;
    });

    if (sortBy === "deadline") {
        result = [...result].sort(sortByDeadline);
    }

    return result;
}

export function updateTask(index, updates = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= tasks.length) {
        return null;
    }

    const currentTask = tasks[index];
    const updatedTask = {
        ...currentTask,
        ...updates,
    };

    tasks[index] = new Task(updatedTask);
    return tasks[index];
}

export function deleteTask(index) {
    if (!Number.isInteger(index) || index < 0 || index >= tasks.length) {
        return null;
    }

    const [removedTask] = tasks.splice(index, 1);
    return removedTask;
}

export function clearTasks() {
    tasks.length = 0;
}
