import { useNavigate } from 'react-router-dom';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { contentItems } from '../../data/mock';

export default function ContentPage() {
  const navigate = useNavigate();
  const userItems = contentItems.filter((item) => item.namespace === '@official');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        My Content
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>My Content</h2>
        <button
          type="button"
          className="d-interactive"
          data-variant="primary"
          onClick={() => navigate('/dashboard/content/new')}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          Publish New
        </button>
      </div>

      <ContentCardGrid
        items={userItems}
        onItemClick={(item) => navigate(`/registry/${item.type}/${item.slug}`)}
        editable
      />
    </div>
  );
}
