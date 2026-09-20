import { useEffect, useState } from 'react';
import { BackIcon } from '../../../shared/ui/Icons.jsx';

const emptyCapsule = {
  project_name: '',
  prompt_title: '',
  prompt_version: 'v1',
  prompt_text: '',
  response_summary: '',
  category: 'Coding',
  usefulness: 'Good',
  reviewed: false,
  improved: false,
  screenshot_url: '',
  notes: ''
};

function formatCreatedAt(value) {
  if (!value) return 'After saving';
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export default function CapsuleForm({ capsule, user, busy, error, onBack, onSave }) {
  const [values, setValues] = useState(emptyCapsule);
  const isEditing = Boolean(capsule?.id);

  useEffect(() => {
    setValues(capsule ? { ...emptyCapsule, ...capsule } : emptyCapsule);
  }, [capsule]);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(values);
  }

  return (
    <div className="form-view">
      <header className="form-view__header">
        <button className="back-button" type="button" aria-label="Back to prompt library" onClick={onBack}><BackIcon /></button>
        <div>
          <h1>{isEditing ? 'Edit prompt' : 'New prompt'}</h1>
          <p>{isEditing ? 'Update the record and save the changes when it is ready.' : 'Add a useful prompt to your private library.'}</p>
        </div>
      </header>

      {error && <div className="inline-error" role="alert">{error}</div>}

      <div className="form-layout">
        <form className="capsule-form" onSubmit={submit}>
          <section className="form-section">
            <header><span>01</span><h2>Prompt details</h2><small>Required fields are marked *</small></header>
            <div className="form-grid form-grid--details">
              <label className="field field--project">Project name *<input name="project_name" value={values.project_name} onChange={update} maxLength="160" required /></label>
              <label className="field">Prompt version<input name="prompt_version" value={values.prompt_version} onChange={update} maxLength="40" /></label>
              <label className="field">Category<select name="category" value={values.category} onChange={update}><option>Coding</option><option>Writing</option><option>Research</option></select></label>
              <label className="field field--wide">Prompt title *<input name="prompt_title" value={values.prompt_title} onChange={update} maxLength="180" required /></label>
              <label className="field field--wide">Prompt text *<textarea name="prompt_text" value={values.prompt_text} onChange={update} maxLength="12000" rows="4" required /></label>
            </div>
          </section>

          <section className="form-section">
            <header><span>02</span><h2>Review</h2><small>Keep the result useful for the next iteration</small></header>
            <div className="form-grid form-grid--review">
              <label className="field field--summary">Response summary<textarea name="response_summary" value={values.response_summary} onChange={update} maxLength="3000" rows="3" /></label>
              <label className="field">Usefulness<select name="usefulness" value={values.usefulness} onChange={update}><option>Good</option><option>Needs Improvement</option></select></label>
              <fieldset className="field check-field">
                <legend>Review status</legend>
                <div className="check-options">
                  <label className={values.reviewed ? 'check-option check-option--active' : 'check-option'}><input type="checkbox" name="reviewed" checked={values.reviewed} onChange={update} /><span>✓</span>Reviewed</label>
                  <label className={values.improved ? 'check-option check-option--active' : 'check-option'}><input type="checkbox" name="improved" checked={values.improved} onChange={update} /><span>✓</span>Improved</label>
                </div>
              </fieldset>
              <label className="field">Screenshot URL<input type="url" name="screenshot_url" value={values.screenshot_url} onChange={update} maxLength="1000" placeholder="https://..." /></label>
              <label className="field field--wide">Notes<textarea name="notes" value={values.notes} onChange={update} maxLength="4000" rows="2" /></label>
            </div>
          </section>

          <footer className="form-actions">
            <button className="button button--secondary" type="button" disabled={busy} onClick={onBack}>Cancel</button>
            <button className="button button--rust" type="submit" disabled={busy}>{busy ? 'Saving…' : isEditing ? 'Save changes' : 'Create capsule'}</button>
          </footer>
        </form>

        <aside className="form-aside">
          <section>
            <h2>Record details</h2>
            <dl><div><dt>Account</dt><dd>{user?.login || 'Current user'}</dd></div><div><dt>Created</dt><dd>{formatCreatedAt(capsule?.created_at)}</dd></div></dl>
          </section>
          <section><h2>Keep it reusable</h2><p>Save enough context to understand why this prompt worked when you return to it.</p></section>
        </aside>
      </div>
    </div>
  );
}
