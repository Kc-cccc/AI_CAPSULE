export default function Brand({ inverse = false }) {
  return (
    <div className={`brand${inverse ? ' brand--inverse' : ''}`} aria-label="AI Capsule">
      <svg className="brand__mark" viewBox="0 0 34 34" aria-hidden="true">
        <path
          className="brand__c"
          d="M29 8C26.2 4.2 21.8 2 17 2 8.7 2 2 8.7 2 17s6.7 15 15 15c5.1 0 9.6-2.5 12.4-6.4l-4.8-3.5A9.1 9.1 0 1 1 24.4 12L29 8Z"
        />
        <path
          className="brand__a"
          d="M9.8 27 18 6l8.2 21h-4.4l-1.5-4.3h-5.2L13.6 27H9.8Zm6.7-8.1h2.4l-1.2-3.7-1.2 3.7Z"
        />
        <circle className="brand__dot" cx="29" cy="17" r="2.2" />
      </svg>
      <span>AI CAPSULE</span>
    </div>
  );
}
