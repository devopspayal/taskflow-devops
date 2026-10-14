export const statuses = ['todo', 'doing', 'done'];
export const priorities = ['High', 'Medium', 'Low'];
export function createTask(title, description = '', priority = 'Medium', id = crypto.randomUUID()) {
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) throw new Error('Enter a title between 1 and 120 characters.');
  if (typeof description !== 'string' || description.length > 500) throw new Error('Description must be under 501 characters.');
  if (!priorities.includes(priority)) throw new Error('Choose a valid priority.');
  return {id, title: title.trim(), description: description.trim(), priority, status: 'todo'};
}
export function validTask(t) {
  return t && typeof t.id === 'string' && typeof t.title === 'string' && t.title.trim().length > 0 && t.title.length <= 120 && typeof t.description === 'string' && t.description.length <= 500 && priorities.includes(t.priority) && statuses.includes(t.status);
}
export function loadTasks(raw, fallback) {
  if (raw === null) return structuredClone(fallback);
  const tasks = JSON.parse(raw);
  if (!Array.isArray(tasks) || !tasks.every(validTask) || new Set(tasks.map(t => t.id)).size !== tasks.length) throw new Error('Saved task data is invalid.');
  return tasks;
}
export function summarize(tasks) {
  const completed = tasks.filter(t => t.status === 'done').length;
  return {total: tasks.length, progress: tasks.filter(t => t.status === 'doing').length, completed, rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0};
}
export const samples = [
  {...createTask('Define release acceptance criteria', 'Document what a successful release should deliver.', 'High', 'sample-1')},
  {...createTask('Review application accessibility', 'Check keyboard navigation and readable labels.', 'Medium', 'sample-2')},
  {...createTask('Prepare the next feature', 'Break the work into small, testable changes.', 'High', 'sample-3'), status:'doing'},
  {...createTask('Write a project brief', 'Capture the goal and scope of the demo.', 'Low', 'sample-4'), status:'done'}
];
