import { Link, useSearchParams } from 'react-router-dom';
import Brand from '../../../shared/ui/Brand.jsx';
import { ArchiveIcon, EditIcon, GithubIcon } from '../../../shared/ui/Icons.jsx';

const errorMessages = {
  oauth_not_configured: 'Sign-in is temporarily unavailable. Please try again later.',
  oauth_failed: 'GitHub sign-in could not be completed. Please try again.'
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = errorMessages[searchParams.get('error')];

  return (
    <main className="login-page">
      <section className="login-story">
        <Brand inverse />
        <div className="login-story__copy">
          <h1>Your prompt history,<br />kept in context.</h1>
          <p>Return to the prompts that worked, understand what changed, and carry better versions into your next project.</p>
        </div>
        <div className="login-watermark" aria-hidden="true"><span>C</span><b>A</b></div>
      </section>

      <section className="login-panel">
        <Link className="back-home" to="/">← Back to home</Link>
        <div className="login-panel__content">
          <div className="eyebrow">Welcome back</div>
          <h1>Sign in to your private<br />prompt library.</h1>
          <p>Continue with your GitHub account. AI Capsule never receives or stores your GitHub password.</p>

          {error && <div className="inline-error" role="alert">{error}</div>}

          <a className="button button--dark button--wide" href="/auth/github">
            <GithubIcon />
            Continue with GitHub
          </a>

          <div className="divider"><span>Built for useful prompts</span></div>
          <div className="login-facts">
            <article><ArchiveIcon /><h2>Keep the context</h2><p>Store each prompt with its project, response and review notes.</p></article>
            <article><EditIcon /><h2>Improve over time</h2><p>Return to earlier versions and keep what worked.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}
