import { UserButton } from "@clerk/clerk-react";
import VaultLogo from "../VaultLogo.jsx";

export default function Sidebar({
  activeTab,
  setActiveTab,
  userPlan,
  userEmail,
  isAdmin,
  docCount,
  freeLimit,
  showNotice,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <VaultLogo />
        <div className="brand-text">
          <h2>Digital Vault</h2>
          <span className="badge-tier">{userPlan.toUpperCase()} TIER</span>
        </div>
      </div>

      <div className="sidebar-user">
        <UserButton afterSignOutUrl="/" />
        <div className="user-details">
          <span className="user-email">{userEmail || "User"}</span>
          <span className="user-role">
            {isAdmin ? "👑 Administrator" : "👤 Vault Member"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item ${activeTab === "vault" ? "active" : ""}`}
          onClick={() => setActiveTab("vault")}
        >
          🗄️ Vault Dashboard
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === "credentials" ? "active" : ""}`}
          onClick={() => setActiveTab("credentials")}
        >
          🔑 Credentials Locker
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => {
            if (!isAdmin) {
              showNotice("Access Denied: Administrator clearance required.");
              return;
            }
            setActiveTab("logs");
          }}
        >
          📋 Security Audit {isAdmin ? "✅" : "🔒"}
        </button>

        <button
          type="button"
          className={`nav-item upgrade-nav ${activeTab === "upgrade" ? "active" : ""}`}
          onClick={() => setActiveTab("upgrade")}
        >
          ⚡ Subscription Plans
        </button>
      </nav>

      <div className="quota-widget">
        <div className="quota-header">
          <span>Document Quota</span>
          <span>
            {docCount} / {userPlan === "pro" ? "∞" : freeLimit}
          </span>
        </div>
        <div className="quota-bar-track">
          <div
            className="quota-bar-fill"
            style={{
              width: `${userPlan === "pro" ? 20 : Math.min((docCount / freeLimit) * 100, 100)}%`,
            }}
          ></div>
        </div>
        {userPlan === "free" && docCount >= freeLimit && (
          <button
            type="button"
            className="btn-sidebar-upgrade"
            onClick={() => setActiveTab("upgrade")}
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </aside>
  );
}
