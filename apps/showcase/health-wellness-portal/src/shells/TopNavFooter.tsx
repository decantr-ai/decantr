import { Outlet } from 'react-router-dom';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}
