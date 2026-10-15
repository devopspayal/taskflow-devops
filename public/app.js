import {createTask, loadTasks, summarize, samples, statuses} from './model.js';
const $ = id => document.getElementById(id);
const key = 'taskflow-demo-v1';
let tasks, editingId = null;
const deleted = [];
try { tasks = loadTasks(localStorage.getItem(key), samples); }
catch { tasks = structuredClone(samples); $('notice').textContent = 'Saved data could not be loaded. Showing sample tasks; changes will replace saved demo data.'; }
function save(message = 'Changes saved in this browser.') {
  try { localStorage.setItem(key, JSON.stringify(tasks)); $('notice').textContent = message; }
  catch { $('notice').textContent = 'Browser storage is unavailable. Changes will last only while this page is open.'; }
  render();
}
function el(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
function matches(task) {return (task.title + ' ' + task.description).toLowerCase().includes($('search').value.trim().toLowerCase()) && ($('filter').value === 'all' || task.priority === $('filter').value);}
function reveal(task) {
  if (matches(task)) return '';
  $('search').value = ''; $('filter').value = 'all'; return ' Filters cleared to show the task.';
}
function openEditor(task = null) {
  editingId = task?.id ?? null; $('task-form').reset(); $('title').setCustomValidity('');
  $('dialog-title').textContent = task ? 'Edit task' : 'Create a task';
  $('submit-task').textContent = task ? 'Save changes' : 'Create task';
  if (task) { $('title').value = task.title; $('description').value = task.description; $('priority').value = task.priority; }
  $('task-dialog').showModal(); $('title').focus();
}
function render() {
  const filtered = tasks.filter(matches);
  const active = Boolean($('search').value.trim()) || $('filter').value !== 'all';
  for (const [id, value] of Object.entries(summarize(filtered))) $(id).textContent = value + (id === 'rate' ? '%' : '');
  $('total-label').textContent = active ? 'Matching tasks' : 'Total tasks';
  $('result-count').textContent = active ? `Showing ${filtered.length} of ${tasks.length} tasks · Summary reflects these results` : `${tasks.length} tasks across your board`;
  $('clear-filters').hidden = !active;
  $('undo-delete').hidden = !deleted.length;
  $('undo-delete').textContent = deleted.length ? `Undo delete (${deleted.length})` : 'Undo delete';
  for (const status of statuses) {
    const list = $(status + '-list'); list.replaceChildren();
    const group = filtered.filter(t => t.status === status); $(status + '-count').textContent = group.length;
    if (!group.length) list.append(el('p', active ? 'No matching tasks.' : 'No tasks here yet.', 'empty'));
    for (const task of group) {
      const card = el('article', undefined, 'card');
      card.append(el('span', task.priority, 'priority ' + task.priority.toLowerCase()), el('h4', task.title), el('p', task.description));
      const actions = el('div', undefined, 'card-actions');
      const select = el('select'); select.setAttribute('aria-label', 'Status for ' + task.title);
      for (const [i,s] of statuses.entries()) { const option = el('option', ['To do','In progress','Done'][i]); option.value = s; select.append(option); }
      select.value = status; select.addEventListener('change', () => {task.status = select.value; save();});
      const edit = el('button', 'Edit', 'edit'); edit.setAttribute('aria-label', 'Edit ' + task.title); edit.addEventListener('click', () => openEditor(task));
      const remove = el('button', 'Delete', 'delete'); remove.setAttribute('aria-label', 'Delete ' + task.title);
      remove.addEventListener('click', () => {deleted.push({task: structuredClone(task), index: tasks.findIndex(t => t.id === task.id)}); tasks = tasks.filter(t => t.id !== task.id); save('Task deleted. Undo is available until you reload this page.'); $('undo-delete').focus();});
      actions.append(select, edit, remove); card.append(actions); list.append(card);
    }
  }
}
$('undo-delete').addEventListener('click', () => {const entry = deleted.pop(); if (!entry) return; tasks.splice(Math.min(entry.index, tasks.length), 0, entry.task); save('Task restored.' + reveal(entry.task)); if (!deleted.length) $('new-task').focus();});
$('new-task').addEventListener('click', () => openEditor());
$('close-dialog').addEventListener('click', () => $('task-dialog').close());
$('title').addEventListener('input', () => $('title').setCustomValidity(''));
$('task-form').addEventListener('submit', event => {
  event.preventDefault(); let task;
  try {
    task = createTask($('title').value, $('description').value, $('priority').value, editingId ?? crypto.randomUUID());
    if (editingId) {const index = tasks.findIndex(t => t.id === editingId); task.status = tasks[index].status; tasks[index] = task;}
    else tasks.push(task);
  } catch (error) {$('title').setCustomValidity(error.message); $('title').reportValidity(); return;}
  save((editingId ? 'Task updated.' : 'Task created.') + reveal(task)); $('task-dialog').close(); $('new-task').focus();
});
$('clear-filters').addEventListener('click', () => { $('search').value = ''; $('filter').value = 'all'; render(); $('search').focus(); });
$('search').addEventListener('input', render); $('filter').addEventListener('change', render); render();
