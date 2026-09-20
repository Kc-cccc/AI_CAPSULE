export default function DeleteDialog({ capsule, busy, onCancel, onConfirm }) {
  if (!capsule) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="delete-dialog-title">Delete this capsule?</h2>
        <p>This removes “{capsule.prompt_title}” from your prompt library. This action cannot be undone.</p>
        <div className="delete-dialog__actions">
          <button className="button button--secondary" type="button" disabled={busy} onClick={onCancel}>Keep record</button>
          <button className="button button--danger" type="button" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </section>
    </div>
  );
}
