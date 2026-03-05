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

import fs from 'fs';
import path from 'path';

const LOG_FILE = './logs/log.txt';

export function logAction(message) {
    try {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;

        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        fs.appendFileSync(LOG_FILE, logMessage, 'utf-8');
    } catch (error) {
        console.error('Помилка логування:', error.message);
    }
}
