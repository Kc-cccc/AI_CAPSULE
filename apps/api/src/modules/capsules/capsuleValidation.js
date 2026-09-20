const limits = {
  project_name: 160,
  prompt_title: 180,
  prompt_version: 40,
  prompt_text: 12000,
  response_summary: 3000,
  category: 80,
  usefulness: 80,
  screenshot_url: 1000,
  notes: 4000
};

const categories = new Set(['Coding', 'Writing', 'Research']);
const usefulnessRatings = new Set(['Good', 'Needs Improvement']);

function text(value, field, required = false) {
  const normalised = typeof value === 'string' ? value.trim() : '';
  if (required && !normalised) {
    throw new ValidationError(`${field.replaceAll('_', ' ')} is required.`);
  }
  if (normalised.length > limits[field]) {
    throw new ValidationError(`${field.replaceAll('_', ' ')} is too long.`);
  }
  return normalised;
}

function boolean(value) {
  return value === true || value === 1 || value === '1';
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCapsule(input = {}) {
  const capsule = {
    project_name: text(input.project_name, 'project_name', true),
    prompt_title: text(input.prompt_title, 'prompt_title', true),
    prompt_version: text(input.prompt_version, 'prompt_version'),
    prompt_text: text(input.prompt_text, 'prompt_text', true),
    response_summary: text(input.response_summary, 'response_summary'),
    category: text(input.category, 'category'),
    usefulness: text(input.usefulness, 'usefulness'),
    reviewed: boolean(input.reviewed),
    improved: boolean(input.improved),
    screenshot_url: text(input.screenshot_url, 'screenshot_url'),
    notes: text(input.notes, 'notes')
  };

  if (capsule.category && !categories.has(capsule.category)) {
    throw new ValidationError('Category must be Coding, Writing or Research.');
  }
  if (capsule.usefulness && !usefulnessRatings.has(capsule.usefulness)) {
    throw new ValidationError('Usefulness must be Good or Needs Improvement.');
  }

  if (capsule.screenshot_url) {
    let parsed;
    try {
      parsed = new URL(capsule.screenshot_url);
    } catch {
      throw new ValidationError('Screenshot evidence must be a valid URL.');
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('Screenshot evidence must use http or https.');
    }
  }

  return capsule;
}

export function parseRecordId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ValidationError('Invalid capsule id.');
  }
  return id;
}
