import {createTask, loadTasks, summarize, samples, statuses} from './model.js';
const $ = id => document.getElementById(id);
const key = 'taskflow-demo-v1';
let tasks;
try { tasks = loadTasks(localStorage.getItem(key), samples); }
catch { tasks = structuredClone(samples); $('notice').textContent = 'Saved data could not be loaded. Showing sample tasks; changes will replace saved demo data.'; }
function save() {
  try { localStorage.setItem(key, JSON.stringify(tasks)); $('notice').textContent = 'Changes saved in this browser.'; }
  catch { $('notice').textContent = 'Browser storage is unavailable. Changes will last only while this page is open.'; }
  render();
}
function el(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
function render() {
  const summary = summarize(tasks);
  for (const [id, value] of Object.entries(summary)) $(id).textContent = value + (id === 'rate' ? '%' : '');
  const query = $('search').value.trim().toLowerCase();
  const filtered = tasks.filter(t => (t.title + ' ' + t.description).toLowerCase().includes(query) && ($('filter').value === 'all' || t.priority === $('filter').value));
  for (const status of statuses) {
    const list = $(status + '-list'); list.replaceChildren();
    const group = filtered.filter(t => t.status === status); $(status + '-count').textContent = group.length;
    if (!group.length) list.append(el('p', 'No tasks here yet.', 'empty'));
    for (const task of group) {
      const card = el('article', undefined, 'card');
      card.append(el('span', task.priority, 'priority ' + task.priority.toLowerCase()), el('h4', task.title), el('p', task.description));
      const actions = el('div', undefined, 'card-actions');
      const select = el('select'); select.setAttribute('aria-label', 'Status for ' + task.title);
      for (const [i,s] of statuses.entries()) { const option = el('option', ['To do','In progress','Done'][i]); option.value = s; select.append(option); }
      select.value = status; select.addEventListener('change', () => {task.status = select.value; save();});
      const remove = el('button', 'Delete', 'delete'); remove.setAttribute('aria-label', 'Delete ' + task.title);
      remove.addEventListener('click', () => {tasks = tasks.filter(t => t.id !== task.id); save();});
      actions.append(select, remove); card.append(actions); list.append(card);
    }
  }
}
$('new-task').addEventListener('click', () => $('task-dialog').showModal());
$('close-dialog').addEventListener('click', () => $('task-dialog').close());
$('title').addEventListener('input', () => $('title').setCustomValidity(''));
$('task-form').addEventListener('submit', event => {
  event.preventDefault();
  try {tasks.push(createTask($('title').value, $('description').value, $('priority').value));}
  catch (error) {$('title').setCustomValidity(error.message); $('title').reportValidity(); return;}
  save(); $('task-form').reset(); $('task-dialog').close();
});
$('search').addEventListener('input', render); $('filter').addEventListener('change', render); render();
