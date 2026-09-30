'use client';

import { useEffect, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { CTASection } from '@/components/site/cta-section';
import { Mail, MapPin, Send, CheckCircle, MessageSquare, Users, Briefcase, Newspaper, Heart, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [publicSettings, setPublicSettings] = useState<{ contact_email?: string; social_links?: Record<string,string> }>({});
  useEffect(() => {
    let active = true;
    void createClient().from('site_settings').select('contact_email,social_links').eq('singleton', true).maybeSingle().then(({data}) => { if(active && data) setPublicSettings(data as typeof publicSettings); });
    return () => { active = false; };
  }, []);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    const name = form.name.trim(); const email = form.email.trim(); const subject = form.subject.trim(); const message = form.message.trim();
    if (name.length > 160 || email.length > 254 || subject.length > 200 || message.length > 10000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please check your name, email address, and message length.'); setSaving(false); return;
    }
    const { error } = await createClient().from('contact_messages').insert({ name, email, subject: subject || null, message, status: 'new' });
    if (error) setFormError('Your message could not be sent right now. Please try again later or email ASAM directly.');
    else setSubmitted(true);
    setSaving(false);
  };

  const contactTypes = [
    { icon: MessageSquare, title: 'General Inquiries', desc: 'Questions about ASAM, membership, or the community.', email: 'info@asam.org.my' },
    { icon: Users, title: 'Membership', desc: 'Questions about joining ASAM or membership benefits.', email: 'membership@asam.org.my' },
    { icon: Briefcase, title: 'Partnerships', desc: 'Organizations interested in partnering with ASAM.', email: 'partners@asam.org.my' },
    { icon: Newspaper, title: 'Media', desc: 'Media inquiries and press requests.', email: 'media@asam.org.my' },
    { icon: Heart, title: 'Volunteering', desc: 'Questions about volunteer roles and opportunities.', email: 'volunteer@asam.org.my' },
    { icon: Building2, title: 'Chapter Inquiries', desc: 'Starting a chapter or chapter-related questions.', email: 'chapters@asam.org.my' },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch with ASAM"
        description="Have a question, idea, or inquiry? We'd love to hear from you. Choose the right contact channel below or send us a message."
      />

      {/* Contact Types */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {contactTypes.map((item, i) => (
              <div
                key={item.title}
                className="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:gradient-navy transition-all duration-300 mb-4">
                  <item.icon className="h-6 w-6 text-navy group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">{item.desc}</p>
                <a href={`mailto:${item.title === 'General Inquiries' ? publicSettings.contact_email || item.email : item.email}`} className="text-sm font-semibold text-gold-dark hover:underline">
                  {item.title === 'General Inquiries' ? publicSettings.contact_email || item.email : item.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="p-5 lg:p-5 rounded-xl border border-border bg-card shadow-premium-lg">
            {submitted ? (
              <div className="text-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="font-display text-xl font-bold mb-2.5">Message Sent</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Thank you for reaching out to ASAM. We will get back to you as soon as possible.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', category: 'general', message: '' }); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl font-bold mb-1.5">Send us a message</h2>
                <p className="text-sm text-muted-foreground mb-5">Fill out the form below and we&apos;ll respond as soon as possible.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category *</label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="membership">Membership</option>
                      <option value="partnership">Partnership</option>
                      <option value="media">Media</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="chapter">Chapter Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Subject *</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                      placeholder="Brief subject of your message"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all"
                  >
                    {saving ? 'Sending…' : 'Send Message'}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-10">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold mb-2.5">Follow ASAM</h2>
            <p className="text-sm text-muted-foreground mb-5">Stay connected through our social media channels.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {Object.entries(publicSettings.social_links || {}).filter(([,url]) => /^https:\/\//i.test(url)).map(([social,url]) => (
                <a
                  key={social}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary/60 transition-all"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
