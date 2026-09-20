import { Link } from 'react-router-dom';
import Brand from '../../../shared/ui/Brand.jsx';
import { GithubIcon, LockIcon } from '../../../shared/ui/Icons.jsx';

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="public-header">
        <Brand />
        <div className="public-header__actions">
          <span>Private prompt library</span>
          <Link className="button button--dark button--compact" to="/login">Sign in</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="eyebrow">Save · Review · Improve</div>
          <h1>Keep the prompts<br />worth using again.</h1>
          <p>A private library for the AI prompts behind your coding, writing, research and study work.</p>
          <Link className="button button--dark" to="/login">
            <GithubIcon />
            Continue with GitHub
          </Link>
          <div className="secure-copy"><LockIcon />Only you can access the prompts saved to your account.</div>
        </div>

        <div className="archive-visual" aria-label="Example prompt records">
          <div className="archive-visual__inner" />
          <div className="archive-visual__spine" />
          <article className="sample-record sample-record--one">
            <div className="sample-record__top">
              <span className="tag tag--rust">Coding</span>
              <span>v3</span>
            </div>
            <h2>Debug cloud deployment</h2>
            <p>Why does my Node server fail after deployment?</p>
            <div className="sample-record__checks"><span>✓ Reviewed</span><span>✓ Improved</span></div>
          </article>
          <article className="sample-record sample-record--two">
            <div className="sample-record__top">
              <span className="tag tag--olive">SmartFarm Irrigation</span>
              <span>Good</span>
            </div>
            <h2>Response summary</h2>
            <p>Check the start command and cloud environment variables.</p>
          </article>
          <span className="archive-visual__label">PROMPT ARCHIVE / 04</span>
        </div>
      </section>

      <section className="workflow" aria-label="AI Capsule workflow">
        <div className="workflow__intro">
          <h2>Know why a prompt worked.</h2>
          <p>The useful part is not only the wording, but the context and judgement around it.</p>
        </div>
        <article><span>01</span><h3>Keep the brief</h3><p>Store the project, exact prompt and version as one working record.</p></article>
        <article><span>02</span><h3>Judge the result</h3><p>Summarise the response and note whether it was genuinely useful.</p></article>
        <article><span>03</span><h3>Carry it forward</h3><p>Add what you would change, so the next version starts from better ground.</p></article>
      </section>
    </main>
  );
}
