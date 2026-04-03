import { css } from '@decantr/css';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { BLOG_POSTS } from '../data/mock';

const POST_CONTENT: Record<string, string[]> = {
  'composable-architecture': [
    'The shift toward composable architecture represents a fundamental change in how we build web applications. Instead of monolithic frameworks, teams are adopting modular systems where each component can be independently developed, tested, and deployed.',
    'At its core, composable architecture is about boundaries. Each module owns its data, its presentation, and its behavior. Communication happens through well-defined interfaces, not shared mutable state.',
    'The benefits compound over time. New features can be built by composing existing modules. Design changes propagate automatically through the token system. Teams can work in parallel without stepping on each other.',
    'We have seen teams reduce their time-to-production by 40% after adopting composable patterns. The key is starting with a strong foundation: design tokens, a component contract system, and automated visual regression testing.',
  ],
  'design-tokens-at-scale': [
    'Design tokens are the atoms of your design system. They encode decisions about color, spacing, typography, and motion into a format that both designers and developers can share.',
    'At scale, managing tokens becomes a coordination challenge. Multiple teams need to consume tokens, extend them for their use cases, and propose changes without breaking others.',
    'We recommend a three-tier token architecture: global tokens (brand-level), semantic tokens (intent-level), and component tokens (implementation-level). Changes at the global level cascade predictably.',
    'Tooling matters. Automated validation catches token conflicts before they reach production. Visual regression tests ensure that token changes produce the expected visual outcomes.',
  ],
  'edge-first-performance': [
    'The fastest request is the one that never reaches your origin server. Edge computing moves your application logic closer to users, reducing latency from hundreds of milliseconds to single digits.',
    'Modern edge platforms support not just static caching but dynamic computation. Server-side rendering at the edge, personalization, A/B testing, and even database queries can all run within milliseconds of your users.',
    'Streaming is the key to perceived performance. Instead of waiting for the entire page to render, edge functions can stream HTML as it becomes available. Users see content immediately.',
    'Combined with intelligent caching strategies and resource hints, edge-first architecture delivers sub-second page loads consistently, regardless of where your users are located.',
  ],
};

export function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find(p => p.id === id);

  if (!post) return <Navigate to="/blog" replace />;

  const paragraphs = POST_CONTENT[post.id] || [
    'This article explores key concepts and practical strategies that modern engineering teams are adopting to build better products faster.',
    'By focusing on composability, automation, and user-centric design, teams can achieve both speed and quality without compromise.',
    'The tools and patterns discussed here have been validated across organizations of all sizes, from startups to enterprises with hundreds of engineers.',
    'We encourage you to experiment with these approaches incrementally. Start with one pattern, measure the impact, and expand from there.',
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <nav className={css('_flex _aic _gap2')} style={{ marginBottom: '2rem' }}>
        <Link
          to="/blog"
          className={css('_flex _aic _gap1 _textsm')}
          style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </nav>

      {/* Post header */}
      <header style={{ marginBottom: '2rem' }}>
        <span className="d-annotation" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
          {post.category}
        </span>
        <h1 className={css('_fontbold')} style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: '1rem' }}>
          {post.title}
        </h1>
        <div className={css('_flex _aic _gap4 _wrap')}>
          <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
            <User size={14} /> {post.author}
          </span>
          <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
            <Calendar size={14} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
            <Clock size={14} /> {post.readTime} read
          </span>
        </div>
      </header>

      <div className="lum-divider" style={{ marginBottom: '2rem' }} />

      {/* Post body */}
      <article style={{ lineHeight: 1.8 }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>
          {post.excerpt}
        </p>

        {paragraphs.map((p, i) => (
          <p key={i} style={{ marginBottom: '1.5rem', color: 'var(--d-text)', lineHeight: 1.8 }}>
            {p}
          </p>
        ))}

        {/* Code example */}
        <div className="lum-code-block" style={{ marginBottom: '1.5rem' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            <code style={{ color: 'var(--d-text-muted)' }}>
{`// Example: Composable design tokens
const tokens = {
  color: { primary: '#FE4474', accent: '#FDA303' },
  spacing: { base: 4, scale: 'linear' },
  radius: { base: 8, philosophy: 'rounded' },
};`}
            </code>
          </pre>
        </div>

        <p style={{ marginBottom: '1.5rem', color: 'var(--d-text)', lineHeight: 1.8 }}>
          The approach outlined above demonstrates how structured design decisions cascade through an entire application,
          ensuring visual consistency while preserving the flexibility teams need to move fast.
        </p>
      </article>

      <div className="lum-divider" style={{ margin: '2rem 0' }} />

      {/* Back link */}
      <Link
        to="/blog"
        className={css('_flex _aic _gap1') + ' d-interactive'}
        data-variant="ghost"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={16} /> All Posts
      </Link>
    </div>
  );
}
