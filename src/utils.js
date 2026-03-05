export function checkTitle(title) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return 'Назва не може бути порожньою';
    }
    return null;
}

export function checkDeadline(deadline) {
    if (!deadline) {
        return null;
    }

    const parsed = Date.parse(deadline);
    if (Number.isNaN(parsed)) {
        return 'Невалідний дедлайн: має бути коректна дата';
    }

    return null;
}

export function checkPriority(priority) {
    if (!priority) {
        return null;
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority.toLowerCase())) {
        return 'Невалідний пріоритет: має бути low/medium/high';
    }

    return null;
}

export function checkStatus(status) {
    if (typeof status !== 'boolean') {
        return 'Невалідний статус: має бути boolean (true/false)';
    }
    return null;
}
