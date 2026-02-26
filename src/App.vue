<script setup>
import ForceGraph from '@/components/ForceGraph.vue'
import SideBar from '@/components/SideBar.vue'
</script>

<template>
  <div class="sanguo-app">
    <header class="app-header">
      <h1>三国人物关系力图</h1>
    </header>
    <main class="app-main">
      <ForceGraph />
      <SideBar />
    </main>
  </div>
</template>

<style scoped>
.sanguo-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
