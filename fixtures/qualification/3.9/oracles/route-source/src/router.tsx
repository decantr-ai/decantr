import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/qualification/competition-01',
    lazy: () => import('./layouts/competition-01-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-01-page') }],
  },
  {
    path: '/qualification/competition-02',
    lazy: () => import('./layouts/competition-02-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-02-page') }],
  },
  {
    path: '/qualification/competition-03',
    lazy: () => import('./layouts/competition-03-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-03-page') }],
  },
  {
    path: '/qualification/competition-04',
    lazy: () => import('./layouts/competition-04-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-04-page') }],
  },
  {
    path: '/qualification/competition-05',
    lazy: () => import('./layouts/competition-05-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-05-page') }],
  },
  {
    path: '/qualification/competition-06',
    lazy: () => import('./layouts/competition-06-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-06-page') }],
  },
  {
    path: '/qualification/competition-07',
    lazy: () => import('./layouts/competition-07-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-07-page') }],
  },
  {
    path: '/qualification/competition-08',
    lazy: () => import('./layouts/competition-08-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-08-page') }],
  },
  {
    path: '/qualification/competition-09',
    lazy: () => import('./layouts/competition-09-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-09-page') }],
  },
  {
    path: '/qualification/competition-10',
    lazy: () => import('./layouts/competition-10-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-10-page') }],
  },
  {
    path: '/qualification/competition-11',
    lazy: () => import('./layouts/competition-11-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-11-page') }],
  },
  {
    path: '/qualification/competition-12',
    lazy: () => import('./layouts/competition-12-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-12-page') }],
  },
  {
    path: '/qualification/competition-13',
    lazy: () => import('./layouts/competition-13-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-13-page') }],
  },
  {
    path: '/qualification/competition-14',
    lazy: () => import('./layouts/competition-14-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-14-page') }],
  },
  {
    path: '/qualification/competition-15',
    lazy: () => import('./layouts/competition-15-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-15-page') }],
  },
  {
    path: '/qualification/competition-16',
    lazy: () => import('./layouts/competition-16-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-16-page') }],
  },
  {
    path: '/qualification/competition-17',
    lazy: () => import('./layouts/competition-17-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-17-page') }],
  },
  {
    path: '/qualification/competition-18',
    lazy: () => import('./layouts/competition-18-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-18-page') }],
  },
  {
    path: '/qualification/competition-19',
    lazy: () => import('./layouts/competition-19-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-19-page') }],
  },
  {
    path: '/qualification/competition-20',
    lazy: () => import('./layouts/competition-20-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-20-page') }],
  },
  {
    path: '/qualification/competition-21',
    lazy: () => import('./layouts/competition-21-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-21-page') }],
  },
  {
    path: '/qualification/competition-22',
    lazy: () => import('./layouts/competition-22-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-22-page') }],
  },
  {
    path: '/qualification/competition-23',
    lazy: () => import('./layouts/competition-23-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-23-page') }],
  },
  {
    path: '/qualification/competition-24',
    lazy: () => import('./layouts/competition-24-layout'),
    children: [{ index: true, lazy: () => import('./pages/competition-24-page') }],
  },
  { path: '/qualification/standalone-01', lazy: () => import('./pages/standalone-01-page') },
  { path: '/qualification/standalone-02', lazy: () => import('./pages/standalone-02-page') },
  { path: '/qualification/standalone-03', lazy: () => import('./pages/standalone-03-page') },
  { path: '/qualification/standalone-04', lazy: () => import('./pages/standalone-04-page') },
  { path: '/qualification/standalone-05', lazy: () => import('./pages/standalone-05-page') },
  { path: '/qualification/standalone-06', lazy: () => import('./pages/standalone-06-page') },
  { path: '/qualification/standalone-07', lazy: () => import('./pages/standalone-07-page') },
  { path: '/qualification/standalone-08', lazy: () => import('./pages/standalone-08-page') },
  { path: '/qualification/standalone-09', lazy: () => import('./pages/standalone-09-page') },
  { path: '/qualification/standalone-10', lazy: () => import('./pages/standalone-10-page') },
  { path: '/qualification/standalone-11', lazy: () => import('./pages/standalone-11-page') },
]);
