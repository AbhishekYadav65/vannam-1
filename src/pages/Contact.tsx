import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Contact.css';

interface Fields { name: string; email: string; message: string }
const EMPTY: Fields = { name: '', email: '', message: '' };

export default function Contact() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState<Fields | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF(v => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors(v => ({ ...v, [k]: undefined }));
  };

  const compose = (x: Fields) => `Hi Vannam! I'm ${x.name} (${x.email}).\n\n${x.message}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Fields> = {};
    if (!f.name.trim()) next.name = 'Tell us your name';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) next.email = 'That email doesn’t look right';
    if (f.message.trim().length < 5) next.message = 'Say a little more — even a hello works';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSent({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() });
  };

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(compose(sent));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard unavailable — the text is selectable below */ }
  };

  const reset = () => { setSent(null); setF(EMPTY); setErrors({}); };

  return (
    <div className="page contact">
      <section className="contact__left panel stitch">
        <p className="eyebrow">contact</p>
        <motion.h1 className="title-xl" initial={{ opacity: 0, y: 40, rotateX: -35 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          Say <em>hello.</em>
        </motion.h1>
        <p>Whether you want to place a custom order, ask about our fabrics, or just say hi—we'd love to hear from you.</p>
        <div className="contact__cards">
          <div className="contact__card contact__card--a">
            <h2>Instagram</h2>
            <p>For the fastest response and to place orders, DM us.</p>
            <a href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer">@vannam.ig ↗</a>
          </div>
          <div className="contact__card contact__card--b">
            <h2>Studio</h2>
            <p>Handcrafted with love in<br />Coimbatore, Tamil Nadu.</p>
            <span>Worldwide shipping available</span>
          </div>
        </div>
      </section>

      <section className="contact__right panel" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div key="sent" className="contact__sent" initial={{ opacity: 0, rotateX: -20, y: 20 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0 }} style={{ transformPerspective: 900 }}>
              <h2 className="title-xl">Almost <em>there, {sent.name.split(' ')[0]}!</em></h2>
              <p>Instagram is the fastest way to reach us. Copy your message, then paste it into a DM.</p>
              <pre className="contact__msg">{compose(sent)}</pre>
              <div className="contact__actions">
                <button className="btn btn--ink" onClick={copy}>{copied ? 'Copied ✓' : 'Copy message'}</button>
                <a className="btn btn--cherry" href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer">Open Instagram ↗</a>
                <button className="btn btn--ghost" onClick={reset}>Write another</button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" className="contact__form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2>Send a message</h2>
              <div className="field">
                <label htmlFor="c-name">Name</label>
                <input id="c-name" value={f.name} onChange={set('name')} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'c-name-e' : undefined} />
                {errors.name && <p id="c-name-e" className="field__err">{errors.name}</p>}
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'c-email-e' : undefined} />
                {errors.email && <p id="c-email-e" className="field__err">{errors.email}</p>}
              </div>
              <div className="field">
                <label htmlFor="c-msg">Message</label>
                <textarea id="c-msg" rows={5} value={f.message} onChange={set('message')} placeholder="How can we help?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'c-msg-e' : undefined} />
                {errors.message && <p id="c-msg-e" className="field__err">{errors.message}</p>}
              </div>
              <button type="submit" className="btn btn--ink">Send message</button>
              <p className="contact__note hand">orders happen over Instagram DM — we'll help you copy this over</p>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
