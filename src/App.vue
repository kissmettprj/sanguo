<script setup>
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import ForceGraph from '@/components/ForceGraph.vue'
import SideBar from '@/components/SideBar.vue'

const sidebarVisible = ref(false)
const selectedCharacter = ref(null)

// 移动端判断
const isMobile = () => window.innerWidth < 768

// 点击人物圆圈
const handleCharacterClick = (character) => {
  selectedCharacter.value = character
  sidebarVisible.value = true
}

// 点击空白区域
const handleBackgroundClick = () => {
  sidebarVisible.value = false
  selectedCharacter.value = null
}
</script>

<template>
  <div class="sanguo-app" @click="handleBackgroundClick">
    <main class="app-main">
      <ForceGraph @character-click="handleCharacterClick" />
      <SideBar
        v-model:visible="sidebarVisible"
        :character="selectedCharacter"
        :is-mobile="isMobile()"
      />
    </main>

    <!-- 移动端遮罩层 -->
    <div v-if="isMobile() && sidebarVisible" class="mobile-overlay" @click="handleBackgroundClick"></div>
  </div>
</template>

<style scoped>
.sanguo-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .sanguo-app {
    height: 100dvh;
  }
}
</style>