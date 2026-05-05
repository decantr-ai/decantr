/// <reference types="vite/client" />

declare module 'virtual:showcase-capsules' {
  export interface ShowcaseCapsule {
    slug: string;
    title: string;
    routes: string[];
    publicUrl: string;
    publicRoutes: string[];
  }

  export const showcaseCapsules: ShowcaseCapsule[];
}
