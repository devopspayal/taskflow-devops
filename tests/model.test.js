import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createTask, loadTasks, summarize, samples} from '../public/model.js';
test('creates a trimmed task and rejects empty or oversized titles', () => {
  assert.equal(createTask(' Deploy ').title, 'Deploy');
  for (const title of ['', '  ', 'a'.repeat(121), null]) assert.throws(() => createTask(title));
  assert.throws(() => createTask('a','b','Critical'));
});
test('empty saved boards remain empty after reload', () => {assert.deepEqual(loadTasks('[]', samples), []);});
test('restores valid changes and rejects damaged saved state', () => {
  const task = {...createTask('Deploy'),status:'done'};
  assert.deepEqual(loadTasks(JSON.stringify([task]),samples),[task]);
  for (const raw of ['oops','{}',JSON.stringify([{...task,status:'unknown'}]),JSON.stringify([task,task])]) assert.throws(() => loadTasks(raw,samples));
});
test('summary uses all tasks and handles zero denominator', () => {
  assert.deepEqual(summarize([]),{total:0,progress:0,completed:0,rate:0});
  assert.deepEqual(summarize(samples),{total:4,progress:1,completed:1,rate:25});
});
test('deployment points to real assets and valid health document', async () => {
  const root = new URL('../',import.meta.url);
  const config = JSON.parse(await readFile(new URL('wrangler.jsonc',root),'utf8'));
  const html = await readFile(new URL(config.assets.directory+'/index.html',root),'utf8');
  for (const path of ['/styles.css','/app.js']) {assert.ok(html.includes(path)); await readFile(new URL('public'+path,root));}
  assert.equal(JSON.parse(await readFile(new URL('public/health.json',root),'utf8')).status,'ok');
});
