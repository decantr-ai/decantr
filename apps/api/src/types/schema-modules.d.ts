declare module '@decantr/registry/schema/*.json' {
  const schema: Record<string, unknown>;
  export default schema;
}

declare module '@decantr/content/schemas/*.json' {
  const schema: Record<string, unknown>;
  export default schema;
}

declare module '@decantr/essence-spec/schema/*.json' {
  const schema: Record<string, unknown>;
  export default schema;
}
