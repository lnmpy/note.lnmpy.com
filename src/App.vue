<script setup>
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/logo.svg" alt="Notebook" class="logo" />
      </div>
      
      <div class="sidebar-nav">
        <router-link to="/list" class="nav-link" title="All Notes">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </router-link>

        <router-link to="/new" class="nav-link primary-action" title="New Note">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </router-link>

        <router-link to="/help" class="nav-link help-action" title="Help & Privacy">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </router-link>
      </div>
    </aside>

    <main class="main-content">
      <div class="view-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #fcfcfc;
}

.sidebar {
  width: 64px;
  min-width: 64px;
  background-color: #f7f7f8;
  border-right: 1px solid #EDEDED;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.sidebar-header {
  padding: 24px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.logo {
  width: 36px;
  height: 36px;
  display: block;
  object-fit: contain;
}

.sidebar-nav {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  align-items: center;
  flex: 1; /* Allow taking available space */
}

.help-action {
  margin-top: auto; /* Pushes the help button to the bottom */
  margin-bottom: 24px;
}

.nav-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  text-decoration: none;
  color: #64748b;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.nav-link.router-link-active {
  background-color: #cbd5e1;
  color: #000;
}

.primary-action {
  color: #0ea5e9;
  background-color: transparent;
}

.primary-action:hover {
  background-color: #e0f2fe;
  color: #0284c7;
}

.primary-action.router-link-active {
  background-color: #bae6fd;
}

.main-content {
  flex: 1; /* Takes exactly 80% naturally due to flex */
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.view-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
</style>
