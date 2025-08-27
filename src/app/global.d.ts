declare module 'virtual:blog-posts' {
    export const blogPosts: Record<string, { default: string }>;
  }
  
  interface ImportMeta {
    glob: (path: string, options?: { eager?: boolean }) => Record<string, { default: string }>;
  }