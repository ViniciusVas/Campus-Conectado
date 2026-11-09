import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeTasks, emptyDraft, selectTasks, validate } from '../src/tasks.ts';

const example = { title: 'Projeto', course: 'Engenharia', description: 'Entregar protótipo', deadline: '29/02/2028' };
const tasks = [
  { ...example, id: '1', done: false },
  { ...example, id: '2', done: true, deadline: '01/01/2026' },
  { ...example, id: '3', done: false, deadline: '31/12/2027' },
];

test('exige todos os campos, inclusive quando contêm apenas espaços', () => {
  assert.equal(Object.keys(validate({ ...emptyDraft, title: '  ' }).errors).length, 4);
});
test('normaliza espaços e aceita datas bissextas válidas', () => {
  assert.deepEqual(validate({ ...example, title: ' Projeto ' }), { clean: example, errors: {} });
});
test('rejeita datas inexistentes ou em formato incorreto', () => {
  for (const deadline of ['31/04/2027', '29/02/2027', '2028-02-29', '01/01/0000']) {
    assert.ok(validate({ ...example, deadline }).errors.deadline);
  }
});
test('filtra por status e ordena por prazo sem alterar a lista original', () => {
  assert.deepEqual(selectTasks(tasks, 'all').map(task => task.id), ['3', '1', '2']);
  assert.deepEqual(selectTasks(tasks, 'pending').map(task => task.id), ['3', '1']);
  assert.deepEqual(selectTasks(tasks, 'done').map(task => task.id), ['2']);
  assert.equal(tasks[0].id, '1');
});
test('recupera a lista serializada e inicia vazia sem dados', () => {
  assert.deepEqual(decodeTasks(JSON.stringify(tasks)), tasks);
  assert.deepEqual(decodeTasks(null), []);
});
test('detecta dados inválidos e identificadores duplicados', () => {
  for (const value of ['{', '{}', '[{}]', JSON.stringify([tasks[0], tasks[0]])]) {
    assert.throws(() => decodeTasks(value));
  }
});

