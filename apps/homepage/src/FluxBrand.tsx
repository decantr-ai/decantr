export default function FluxBrand({ compact = false }: { compact?: boolean }) {
  return <span className={`flux-brand${compact ? ' flux-brand-compact' : ''}`}>
    <img src="/flux-logo.png" width={compact ? 32 : 60} height={compact ? 32 : 60} alt="" />
    <span><strong>Flux</strong><small>by Decantr</small></span>
  </span>;
}
