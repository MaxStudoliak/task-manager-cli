import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, beforeEach } from 'node:test';

import { checkTitle, checkDeadline, checkPriority, checkStatus } from '../src/utils.js';
import { addTask, clearTasks, getTasks } from '../src/task.js';
import { exportToJSON, exportToCSV } from '../src/export.js';

const tempDir = os.tmpdir();

describe('Валідація', () => {
  it('checkTitle повертає помилку для порожньої назви', () => {
    assert.strictEqual(checkTitle(''), 'Назва не може бути порожньою');
    assert.strictEqual(checkTitle('   '), 'Назва не може бути порожньою');
    assert.strictEqual(checkTitle(null), 'Назва не може бути порожньою');
  });

  it('checkTitle не повертає помилки для валідної назви', () => {
    assert.strictEqual(checkTitle('Task 1'), null);
  });

  it('checkDeadline повертає помилку для невалідної дати', () => {
    assert.strictEqual(checkDeadline('not-a-date'), 'Невалідний дедлайн: має бути коректна дата');
  });

  it('checkDeadline повертає null для пустої дати або валідної', () => {
    assert.strictEqual(checkDeadline(''), null);
    assert.strictEqual(checkDeadline('2025-01-01'), null);
  });

  it('checkPriority повертає помилку для невалідного пріоритету', () => {
    assert.strictEqual(checkPriority('urgent'), 'Невалідний пріоритет: має бути low/medium/high');
  });

  it('checkPriority працює для допустимих значень', () => {
    assert.strictEqual(checkPriority('low'), null);
    assert.strictEqual(checkPriority('medium'), null);
    assert.strictEqual(checkPriority('high'), null);
  });

  it('checkStatus повертає помилку для не boolean', () => {
    assert.strictEqual(checkStatus('true'), 'Невалідний статус: має бути boolean (true/false)');
  });

  it('checkStatus повертає null для boolean', () => {
    assert.strictEqual(checkStatus(true), null);
    assert.strictEqual(checkStatus(false), null);
  });
});

describe('Пошук задач', () => {
  beforeEach(() => {
    clearTasks();
    addTask({ title: 'First task', description: 'Alpha', deadline: '2025-01-01', priority: 'low', status: false });
    addTask({ title: 'Second task', description: 'Beta', deadline: '2025-02-01', priority: 'medium', status: true });
    addTask({ title: 'Third task', description: 'Gamma', deadline: '2025-03-01', priority: 'high', status: false });
  });

  it('повертає задачі за ключовим словом у назві', () => {
    const results = getTasks({ search: 'second' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].title, 'Second task');
  });

  it('повертає задачі за ключовим словом у описі', () => {
    const results = getTasks({ search: 'gamma' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].description, 'Gamma');
  });
});

describe('Експорт задач', () => {
  beforeEach(() => {
    clearTasks();
    addTask({ title: 'Export task', description: 'Export me', deadline: '2025-01-01', priority: 'low', status: false });
  });

  it('експортує у JSON', () => {
    const filename = path.join(tempDir, `tasks-test-${Date.now()}.json`);
    const result = exportToJSON(getTasks(), filename);

    assert.strictEqual(result.success, true);
    assert.ok(fs.existsSync(filename));

    const content = JSON.parse(fs.readFileSync(filename, 'utf-8'));
    assert.strictEqual(content.length, 1);
    assert.strictEqual(content[0].title, 'Export task');

    fs.unlinkSync(filename);
  });

  it('експортує у CSV', () => {
    const filename = path.join(tempDir, `tasks-test-${Date.now()}.csv`);
    const result = exportToCSV(getTasks(), filename);

    assert.strictEqual(result.success, true);
    assert.ok(fs.existsSync(filename));

    const content = fs.readFileSync(filename, 'utf-8');
    assert.ok(content.includes('Title,Description,Deadline,Priority,Status'));
    assert.ok(content.includes('Export task'));

    fs.unlinkSync(filename);
  });
});
