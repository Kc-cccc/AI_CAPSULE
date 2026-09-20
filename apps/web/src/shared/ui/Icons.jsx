function Icon({ children, className = '', viewBox = '0 0 24 24' }) {
  return (
    <svg className={`icon ${className}`} viewBox={viewBox} aria-hidden="true">
      {children}
    </svg>
  );
}

export function GithubIcon() {
  return (
    <Icon className="icon--fill">
      <path d="M12 .8A11.4 11.4 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.6-1.4-5.6-6A4.7 4.7 0 0 1 5.8 8c-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.5 1.3a12 12 0 0 1 6.3 0c2.4-1.6 3.5-1.3 3.5-1.3.6 1.8.2 3.1.1 3.4a4.7 4.7 0 0 1 1.2 3.3c0 4.7-2.9 5.7-5.6 6 .4.4.8 1.1.8 2.2v3c0 .3.2.7.8.6A11.4 11.4 0 0 0 12 .8Z" />
    </Icon>
  );
}

export function ArchiveIcon() {
  return <Icon><path d="M3 4h18v4H3zM5 8v12h14V8M9 12h6" /></Icon>;
}

export function PlusIcon() {
  return <Icon><path d="M12 5v14M5 12h14" /></Icon>;
}

export function EditIcon() {
  return <Icon><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></Icon>;
}

export function TrashIcon() {
  return <Icon><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></Icon>;
}

export function LockIcon() {
  return <Icon><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>;
}

export function LogoutIcon() {
  return <Icon><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></Icon>;
}

export function BackIcon() {
  return <Icon><path d="m15 18-6-6 6-6" /></Icon>;
}

export function WarningIcon() {
  return <Icon><path d="M12 9v4M12 17h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.8 3h14.8a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /></Icon>;
}
