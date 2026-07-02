export const routes = [
  { path: '', loadComponent: () => import('./home') },
  { path: 'angular-only', loadComponent: () => import('./admin') },
];
