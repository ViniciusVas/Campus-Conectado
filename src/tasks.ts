export type Draft = {
  title: string;
  course: string;
  description: string;
  deadline: string;
};

export type Task = Draft & { id: string; done: boolean };
export type Filter = 'all' | 'pending' | 'done';

export const emptyDraft: Draft = { title: '', course: '', description: '', deadline: '' };

function dateKey(value: string): string | undefined {
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!parts) return;
  const [, day, month, year] = parts;
  const key = `${year}-${month}-${day}`;
  const date = new Date(`${key}T00:00:00Z`);
  if (year !== '0000' && Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === key) {
    return key;
  }
}

export function validate(draft: Draft) {
  const clean = {
    title: draft.title.trim(),
    course: draft.course.trim(),
    description: draft.description.trim(),
    deadline: draft.deadline.trim(),
  };
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!clean.title) errors.title = 'Informe o título.';
  if (!clean.course) errors.course = 'Informe a disciplina.';
  if (!clean.description) errors.description = 'Informe a descrição.';
  if (!dateKey(clean.deadline)) errors.deadline = 'Informe uma data válida no formato DD/MM/AAAA.';
  return { clean, errors };
}

export function selectTasks(tasks: Task[], filter: Filter) {
  return tasks
    .filter(task => filter === 'all' || task.done === (filter === 'done'))
    .sort((a, b) =>
      Number(a.done) - Number(b.done) ||
      (dateKey(a.deadline) ?? '').localeCompare(dateKey(b.deadline) ?? '')
    );
}

export function decodeTasks(raw: string | null): Task[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Formato inválido');
  const ids = new Set<string>();
  for (const task of value) {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
        typeof task.done !== 'boolean' || typeof task.title !== 'string' ||
        typeof task.course !== 'string' || typeof task.description !== 'string' ||
        typeof task.deadline !== 'string' || !dateKey(task.deadline)) {
      throw new Error('Atividade inválida');
    }
    ids.add(task.id);
  }
  return value;
}

