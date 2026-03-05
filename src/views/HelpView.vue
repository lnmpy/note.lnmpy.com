<template>
  <div class="help-page">
    <div class="content">
      <div class="header">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1>Privacy First Note</h1>
      </div>
      
      <p class="intro">
        Everything you write here belongs <strong>only to you</strong>.
      </p>

      <div class="feature-blocks">
        <div class="block">
          <h3>Local Storage Only</h3>
          <p>
            This application doesn't have a database. Your data is stored entirely on your device's browser using <code>localStorage</code>. We have no servers observing or collecting your content.
          </p>
        </div>

        <div class="block">
          <h3>Unsharable By Design</h3>
          <p>
            Because there is no backend server to sync your data, you cannot generate a public link to share your note with others. Only the person using this specific browser on this specific computer can read what's written here.
          </p>
        </div>

        <div class="block">
          <h3>Clear Device, Clear Data</h3>
          <p>
            If you clear your browser data or use an Incognito / Private Window, your notes will be permanently deleted once the window is closed. Please back up your text manually if you consider it important.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-page {
  padding: 60px 40px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 40px 60px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.icon-wrapper {
  background: #e0f2fe;
  color: #0284c7;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

.intro {
  font-size: 18px;
  color: #334155;
  line-height: 1.6;
  padding-bottom: 32px;
  border-bottom: 1px solid #f1f5f9;
  margin-top: 0;
}

.feature-blocks {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.block h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.block h3::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #0ea5e9;
  border-radius: 50%;
}

.block p {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  padding-left: 16px;
}

code {
  background: #f1f5f9;
  color: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

@media (max-width: 768px) {
  .help-page {
    padding: 20px;
  }
  .content {
    padding: 30px 20px;
  }
}
</style>
