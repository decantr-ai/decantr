import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { communityPosts } from '@/data/mock';
import { MessageCircle, Heart, Bell } from 'lucide-react';

export function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = communityPosts.filter(post => {
    const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || post.category === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>News Feed</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Stay updated with guild announcements, patches, and events.</p>
      </div>

      {/* Notifications bar */}
      <div className="d-surface" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bell size={16} style={{ color: 'var(--d-accent)' }} />
        <span style={{ fontSize: '0.875rem' }}>
          <strong>3 new posts</strong> since your last visit
        </span>
        <span className="d-annotation" data-status="info" style={{ marginLeft: 'auto' }}>New</span>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="Search news..."
        filters={[{ label: 'Category', options: ['News', 'Patch', 'Event', 'Community'] }]}
        onSearch={setSearchQuery}
        onFilter={(_, value) => setCategoryFilter(value)}
      />

      {/* Post List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
        {filtered.map(post => (
          <article
            key={post.id}
            className="d-surface"
            data-interactive
            style={{
              padding: 'var(--d-surface-p)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="d-annotation gg-category" data-category={post.category}>
                {post.category}
              </span>
              {post.featured && (
                <span className="d-annotation" data-status="warning">Featured</span>
              )}
              <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace', marginLeft: 'auto' }}>
                {post.date}
              </span>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.4 }}>{post.title}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              {post.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--d-radius-full)',
                  background: 'var(--d-surface-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  color: 'var(--d-text-muted)',
                }}>
                  {post.authorAvatar}
                </div>
                <span style={{ fontWeight: 500, fontSize: '0.8rem' }}>{post.author}</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <Heart size={12} /> {post.reactions}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <MessageCircle size={12} /> {post.comments}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
