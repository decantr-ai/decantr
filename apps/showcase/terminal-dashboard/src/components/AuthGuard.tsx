import { Navigate, useLocation } from 'react-router-dom';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('decantr_authenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
