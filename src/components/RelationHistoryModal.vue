<script setup>
import { ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { ElMessage } from 'element-plus'

const characterStore = useCharacterStore()
const relationHistoryModal = ref(false)
const relationHistoryContent = ref('')

const showRelationHistory = async (relation) => {
  if (!relation.character) return
  
  try {
    const { getRelationHistory } = await import('@/api/llmApi')
    const history = await getRelationHistory(
      characterStore.selectedCharacter.name,
      relation.character.name
    )
    relationHistoryContent.value = history
    relationHistoryModal.value = true
  } catch (error) {
    console.error('加载关系经历失败:', error)
    ElMessage.error('加载关系经历失败')
  }
}
</script>

<template>
  <el-dialog
    v-model="relationHistoryModal"
    title="人物关系经历"
    width="500px"
    destroy-on-close
  >
    <div class="relation-history-content">
      <p class="relation-info">
        <strong>{{ characterStore.selectedCharacter?.name }}</strong> 与 
        <strong>{{ relationHistoryModal && relationHistoryContent ? '对方' : '' }}</strong> 的关系：
      </p>
      <p class="history-text">{{ relationHistoryContent }}</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="relationHistoryModal = false">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.relation-history-content {
  padding: 20px 0;
}

.relation-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.history-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #303133;
}
</style>
