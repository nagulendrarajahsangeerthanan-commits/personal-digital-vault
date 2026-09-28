

export function AuditLogsView({ activityLogs }) {
  return (
    <section className="section-card">
      <div className="audit-header">
        <h2>Security Audit Trail & Compliance</h2>
        <span className="badge-admin">Admin Level 4 Access</span>
      </div>
      <p className="section-desc">Restricted compliance logs tracking all user vault actions.</p>
      <ul className="audit-list">
        {activityLogs.length === 0 ? (
          <li className="empty-text">No activity recorded yet.</li>
        ) : (
          activityLogs.map((log) => (
            <li key={log.id} className="audit-item">
              <span className="audit-action">{log.action}</span>
              <span className="audit-target">{log.target}</span>
              <span className="audit-timestamp">
                {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function UpgradeView({ userPlan, setUserPlan, showNotice, setActiveTab }) {
  return (
    <section className="section-card upgrade-card">
      <h2>Choose Your Vault Plan</h2>
      <p className="section-desc">Scale your encrypted storage and compliance features.</p>
      <div className="pricing-grid">
        <div className={`pricing-tier ${userPlan === 'free' ? 'active-tier' : ''}`}>
          <h3>Community Free</h3>
          <div className="price-tag">$0 <span>/ month</span></div>
          <ul>
            <li>✓ Maximum 5 Documents</li>
            <li>✓ 50 MB Encrypted Storage</li>
            <li>✓ Basic Credential Masking</li>
            <li>✕ Security Audit Log Clearance</li>
          </ul>
          <button type="button" className="btn-tier" disabled={userPlan === 'free'} onClick={() => setUserPlan('free')}>
            {userPlan === 'free' ? 'Current Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        <div className={`pricing-tier pro ${userPlan === 'pro' ? 'active-tier' : ''}`}>
          <div className="pro-ribbon">POPULAR</div>
          <h3>Enterprise Pro</h3>
          <div className="price-tag">$7 <span>/ month</span></div>
          <ul>
            <li>✓ Unlimited Document Uploads</li>
            <li>✓ 50 GB Vault Storage</li>
            <li>✓ Unlimited Credentials & Export</li>
            <li>✓ Full Compliance Audit Trails</li>
            <li>✓ Priority Support</li>
          </ul>
          <button 
            type="button" 
            className="btn-tier btn-upgrade-action" 
            onClick={() => {
              setUserPlan('pro');
              showNotice('Upgraded to Enterprise Pro Plan!');
              setActiveTab('vault');
            }}
          >
            {userPlan === 'pro' ? 'Current Active Plan' : '⚡ Upgrade to Pro Now'}
          </button>
        </div>
      </div>
    </section>
  );
}