import { handleTool } from '../src/tools.js';

const LEGACY_TOOL_ROUTES: Record<string, { tool: string; action: string }> = {
  decantr_read_essence: { tool: 'decantr_contract', action: 'read_essence' },
  decantr_validate: { tool: 'decantr_contract', action: 'validate' },
  decantr_check_drift: { tool: 'decantr_contract', action: 'check_drift' },
  decantr_create_essence: { tool: 'decantr_contract', action: 'create_essence' },
  decantr_get_contract_capsule: { tool: 'decantr_contract', action: 'capsule' },
  decantr_get_project_state: { tool: 'decantr_project', action: 'state' },
  decantr_workspace_health: { tool: 'decantr_project', action: 'workspace_health' },
  decantr_get_scaffold_context: { tool: 'decantr_context', action: 'scaffold' },
  decantr_get_section_context: { tool: 'decantr_context', action: 'section' },
  decantr_get_page_context: { tool: 'decantr_context', action: 'page' },
  decantr_prepare_task_context: { tool: 'decantr_context', action: 'task' },
  decantr_get_execution_pack: { tool: 'decantr_context', action: 'execution_pack' },
  decantr_get_graph_snapshot: { tool: 'decantr_graph', action: 'snapshot' },
  decantr_query_graph: { tool: 'decantr_graph', action: 'query' },
  decantr_traverse_graph: { tool: 'decantr_graph', action: 'traverse' },
  decantr_search_registry: { tool: 'decantr_registry', action: 'search' },
  decantr_resolve_pattern: { tool: 'decantr_registry', action: 'resolve_pattern' },
  decantr_resolve_archetype: { tool: 'decantr_registry', action: 'resolve_archetype' },
  decantr_resolve_blueprint: { tool: 'decantr_registry', action: 'resolve_blueprint' },
  decantr_suggest_patterns: { tool: 'decantr_registry', action: 'suggest_patterns' },
  decantr_get_showcase_benchmarks: { tool: 'decantr_registry', action: 'showcase_benchmarks' },
  decantr_get_registry_intelligence_summary: {
    tool: 'decantr_registry',
    action: 'intelligence_summary',
  },
  decantr_compile_execution_packs: {
    tool: 'decantr_registry',
    action: 'compile_execution_packs',
  },
  decantr_audit_project: { tool: 'decantr_verify', action: 'audit_project' },
  decantr_critique: { tool: 'decantr_verify', action: 'critique' },
  decantr_get_findings: { tool: 'decantr_repair', action: 'findings' },
  decantr_get_repair_plan: { tool: 'decantr_repair', action: 'repair_plan' },
  decantr_get_evidence_bundle: { tool: 'decantr_verify', action: 'evidence_bundle' },
  decantr_get_repair_prompt: { tool: 'decantr_repair', action: 'repair_prompt' },
  decantr_run_health_loop: { tool: 'decantr_repair', action: 'health_loop' },
  decantr_accept_drift: { tool: 'decantr_contract_write', action: 'accept_drift' },
  decantr_update_essence: { tool: 'decantr_contract_write', action: 'update_essence' },
};

export function callTool(name: string, args: Record<string, unknown>) {
  const route = LEGACY_TOOL_ROUTES[name];
  if (!route) return handleTool(name, args);
  return handleTool(route.tool, { action: route.action, ...args });
}
