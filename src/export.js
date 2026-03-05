import fs from 'fs';

export function exportToJSON(tasks, filename = 'tasks-export.json') {
    try {
        const data = JSON.stringify(tasks, null, 2);
        fs.writeFileSync(filename, data, 'utf-8');
        return { success: true, message: `Задачі експортовано в ${filename}` };
    } catch (error) {
        return { success: false, message: `Помилка експорту: ${error.message}` };
    }
}

export function exportToCSV(tasks, filename = 'tasks-export.csv') {
    try {
        const headers = ['Title', 'Description', 'Deadline', 'Priority', 'Status'];
        const csvRows = [headers.join(',')];

        tasks.forEach(task => {
            const row = [
                `"${task.title.replace(/"/g, '""')}"`,
                `"${task.description.replace(/"/g, '""')}"`,
                task.deadline || '',
                task.priority,
                task.status ? 'Done' : 'Pending'
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        fs.writeFileSync(filename, csvContent, 'utf-8');
        return { success: true, message: `Задачі експортовано в ${filename}` };
    } catch (error) {
        return { success: false, message: `Помилка експорту: ${error.message}` };
    }
}
