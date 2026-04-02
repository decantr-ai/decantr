import { css } from '@decantr/css';

export function TermsPage() {
  return (
    <section className="section-gap-sm">
      <div className="container container-md">
        <h1 className={css('_heading1 _mb2')}>Terms of Service</h1>
        <p className={css('_textsm _fgmuted _mb8')}>Last updated: April 1, 2026</p>

        <div className="prose">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AgentHub, you agree to be bound by these Terms of Service. If you are using AgentHub on behalf of an organization, you represent that you have authority to bind that organization to these terms.
          </p>

          <h2>2. Account Terms</h2>
          <p>
            You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account, including activity by deployed agents.
          </p>
          <p>
            You must be at least 18 years old to use AgentHub. Accounts registered by automated methods are not permitted.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>
            You agree not to use AgentHub to:
          </p>
          <ul>
            <li>Deploy agents that engage in illegal activity or violate third-party rights</li>
            <li>Attempt to bypass rate limits, sandboxing, or other security controls</li>
            <li>Distribute malware, spam, or harmful content through agent outputs</li>
            <li>Reverse-engineer or extract proprietary agent code from the marketplace</li>
            <li>Use agents to generate content that impersonates individuals or organizations</li>
          </ul>

          <h2>4. Agent Marketplace</h2>
          <p>
            Agents listed on the marketplace are provided by third-party developers. AgentHub reviews agents for security and quality but does not guarantee their output or behavior. You deploy agents at your own discretion and are responsible for monitoring their execution.
          </p>
          <p>
            Agent developers retain intellectual property rights to their agents. By listing an agent, developers grant AgentHub a license to distribute and execute the agent on behalf of deploying users.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            AgentHub and its original content, features, and functionality are owned by AgentHub, Inc. and are protected by international copyright, trademark, and other intellectual property laws. Your data and agent configurations remain your property.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            AgentHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service, including but not limited to damages arising from agent behavior, data loss, or service interruptions.
          </p>
          <p>
            Our total liability for any claims arising from these terms shall not exceed the amount you paid us in the twelve months preceding the claim.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. We will notify you of material changes via email or through the platform. Continued use of AgentHub after changes take effect constitutes acceptance of the revised terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions about these Terms of Service can be directed to{' '}
            <a href="mailto:legal@agenthub.dev">legal@agenthub.dev</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
