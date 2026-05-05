import { useState } from 'react';
import { FormSections, type FormSection } from '@/components/FormSections';
import { copilotSettings } from '@/data/mock';
import { Bot, Shield, Sliders, Brain } from 'lucide-react';

const tabs = [
  { id: 'model', label: 'Model', icon: Brain },
  { id: 'behavior', label: 'Behavior', icon: Sliders },
  { id: 'permissions', label: 'Permissions', icon: Shield },
];

const modelSections: FormSection[] = [
  {
    title: 'Model Configuration',
    description: 'Choose the AI model and tune its behavior for your use case.',
    fields: [
      { label: 'Model', type: 'select' as const, value: copilotSettings.model, options: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'gpt-4o', 'gpt-4o-mini'] },
      { label: 'Temperature', type: 'range' as const, value: copilotSettings.temperature, description: 'Lower values produce more focused responses. Higher values increase creativity.' },
      { label: 'Max Tokens', type: 'number' as const, value: copilotSettings.maxTokens },
      { label: 'Context Window', type: 'select' as const, value: copilotSettings.contextWindow, options: ['8K', '32K', '100K', '200K'] },
      { label: 'Language', type: 'select' as const, value: copilotSettings.language, options: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'] },
    ],
  },
];

const behaviorSections: FormSection[] = [
  {
    title: 'Suggestion Behavior',
    description: 'Control how the copilot provides suggestions and assistance.',
    fields: [
      { label: 'Auto-suggestions', type: 'toggle' as const, value: copilotSettings.autoSuggestions, description: 'Show suggestions as you type in the editor.' },
      { label: 'Inline Suggestions', type: 'toggle' as const, value: copilotSettings.inlineSuggestions, description: 'Display ghost text completions inline.' },
      { label: 'Code Generation', type: 'toggle' as const, value: copilotSettings.codeGeneration, description: 'Allow the copilot to generate new code blocks.' },
    ],
  },
];

const permissionSections: FormSection[] = [
  {
    title: 'Copilot Permissions',
    description: 'Fine-grained control over what the AI can access in your workspace.',
    fields: [
      { label: 'Read Files', type: 'toggle' as const, value: copilotSettings.permissions.readFiles, description: 'Allow reading files in the workspace for context.' },
      { label: 'Write Files', type: 'toggle' as const, value: copilotSettings.permissions.writeFiles, description: 'Allow creating and modifying files.' },
      { label: 'Execute Commands', type: 'toggle' as const, value: copilotSettings.permissions.executeCommands, description: 'Allow running terminal commands.' },
      { label: 'Access Network', type: 'toggle' as const, value: copilotSettings.permissions.accessNetwork, description: 'Allow making network requests for documentation lookups.' },
    ],
  },
];

const tabContent: Record<string, typeof modelSections> = {
  model: modelSections,
  behavior: behaviorSections,
  permissions: permissionSections,
};

export function CopilotConfigPage() {
  const [activeTab, setActiveTab] = useState('model');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Copilot Configuration</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Tune the AI assistant to match your workflow.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Vertical tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 160, flexShrink: 0 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--d-accent)' : '2px solid transparent',
                  color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
                  background: isActive ? 'var(--d-surface)' : 'transparent',
                  borderRadius: '0 var(--d-radius-sm) var(--d-radius-sm) 0',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Form content */}
        <div className="entrance-fade" key={activeTab} style={{ flex: 1 }}>
          <FormSections sections={tabContent[activeTab]} />
        </div>
      </div>
    </div>
  );
}
