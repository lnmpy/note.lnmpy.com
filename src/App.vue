<script setup>
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/list" class="logo-link" title="All Notes">
          <svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 90 L30 30 L90 90 L90 30" stroke="#0f172a" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="30" cy="30" r="9" fill="#0ea5e9" />
          </svg>
        </router-link>
      </div>

      <div class="sidebar-divider"></div>
      
      <div class="sidebar-nav">
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
  padding: 24px 0 16px 0; /* Reduced bottom padding slightly to accommodate divider */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.sidebar-divider {
  width: 32px;
  height: 1px;
  background-color: #a0b0c7ff;
  margin: 0 auto 8px auto;
  border-radius: 1px;
}

.logo {
  width: 36px;
  height: 36px;
  display: block;
  object-fit: contain;
}

.logo-link {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.sidebar-nav {
  padding-top: 16px;
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
