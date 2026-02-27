<script setup>
import { ref } from 'vue'
import ForceGraph from '@/components/ForceGraph.vue'
import SideBar from '@/components/SideBar.vue'

const sidebarVisible = ref(false)
const selectedCharacter = ref(null)

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
      />
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

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>