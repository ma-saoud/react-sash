import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sash } from 'react-sash';
import 'react-sash/styles.css';
import './demo.css';

const DEFAULT_SIZES = [18, 34, 48];

const FOLDERS = [
  { name: 'Inbox', count: 12, active: true },
  { name: 'Starred' },
  { name: 'Sent' },
  { name: 'Drafts', count: 2 },
  { name: 'Archive' },
  { name: 'Trash' },
];

const LABELS = [
  { name: 'Work', color: '#3b82f6' },
  { name: 'Personal', color: '#22c55e' },
  { name: 'Travel', color: '#f59e0b' },
];

const MESSAGES = [
  { from: 'Lina Park', subject: 'The new layout is live', preview: 'Drag the bars between the panels to resize them.', time: '9:41', unread: true },
  { from: 'Sam Okafor', subject: 'Design review notes', preview: "Here are my notes from Tuesday's review.", time: '9:12', unread: true },
  { from: 'Billing', subject: 'Your invoice for October', preview: 'Thanks for your payment. Your invoice is attached.', time: 'Yesterday' },
  { from: 'Maya Chen', subject: 'Lunch on Friday?', preview: "There's a new ramen place near the office.", time: 'Yesterday' },
  { from: 'Build bot', subject: 'All checks passed on main', preview: '42 tests passed in 1.8 s.', time: 'Tue' },
  { from: 'Alex Rivera', subject: 'Quarterly planning', preview: 'Can we move the planning call to Thursday?', time: 'Mon' },
  { from: 'Weekly digest', subject: 'Five reads for your weekend', preview: 'Our favorite articles from this week.', time: 'Sun' },
];

function Size({ value }: { value: number }) {
  return <span className="size">{Math.round(value)}%</span>;
}

function App() {
  const [sizes, setSizes] = useState(DEFAULT_SIZES);

  return (
    <div className="site">
      <header className="topbar">
        <span className="brand">✉ Mailbox</span>
        <span className="search">Search mail</span>
        <span className="hint">Drag the bars to resize · Double-click a bar to reset</span>
      </header>

      <main className="site__body">
        <Sash defaultSizes={DEFAULT_SIZES} sizes={sizes} onSizesChange={setSizes} min={12} dividerLabel="Resize panel">
          <nav className="folders">
            <div className="compose">Compose</div>
            {FOLDERS.map(({ name, count, active }) => (
              <div key={name} className={`folder${active ? ' folder--active' : ''}`}>
                <span>{name}</span>
                {count && <span className="folder__count">{count}</span>}
              </div>
            ))}
            <div className="folders__heading">
              Labels <Size value={sizes[0]} />
            </div>
            {LABELS.map(({ name, color }) => (
              <div key={name} className="folder">
                <span className="dot" style={{ background: color }} />
                <span>{name}</span>
              </div>
            ))}
          </nav>

          <section className="list">
            <div className="pane-head">
              <h2>Inbox</h2>
              <Size value={sizes[1]} />
            </div>
            {MESSAGES.map(({ from, subject, preview, time, unread }, i) => (
              <div key={subject} className={`mail${i === 0 ? ' mail--active' : ''}${unread ? ' mail--unread' : ''}`}>
                <div className="mail__top">
                  <span className="mail__from">{from}</span>
                  <span className="mail__time">{time}</span>
                </div>
                <div className="mail__subject">{subject}</div>
                <div className="mail__preview">{preview}</div>
              </div>
            ))}
          </section>

          <Sash direction="vertical" defaultSizes={[68, 32]} dividerLabel="Resize reply">
            <article className="message">
              <div className="pane-head">
                <h2>The new layout is live</h2>
                <Size value={sizes[2]} />
              </div>
              <div className="message__meta">
                <span className="avatar">LP</span>
                <div>
                  <strong>Lina Park</strong>
                  <div className="muted">to me · 9:41</div>
                </div>
              </div>
              <p>Hi there,</p>
              <p>The new inbox layout is live, and every panel can be resized:</p>
              <ul>
                <li>Drag the bar between two panels to make one wider and the other narrower.</li>
                <li>Drag the bar above the reply box to give it more room.</li>
                <li>Double-click any bar to put the layout back.</li>
              </ul>
              <p>The blue numbers show each panel's width as you drag.</p>
              <p>Lina</p>
            </article>

            <section className="reply">
              <div className="muted">Reply to Lina Park</div>
              <div className="reply__box">Write a reply…</div>
              <div className="reply__send">Send</div>
            </section>
          </Sash>
        </Sash>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
