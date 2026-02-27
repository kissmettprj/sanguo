<script setup>
import { computed, ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { getFactionName, getRoleName } from '@/utils/colors'
import { ElMessage } from 'element-plus'
import RelationHistoryModal from '@/components/RelationHistoryModal.vue'

const characterStore = useCharacterStore()

// 相关人物点击事件
const handleRelatedClick = (relation) => {
  if (!relation.character) return

  // 显示相交经历弹窗
  showRelationHistory(relation)
}

// 显示相交经历弹窗
const relationHistoryModal = ref(false)
const relationHistoryContent = ref('')
const relationHistoryPartner = ref('')

const showRelationHistory = async (relation) => {
  if (!relation.character) return

  // 立即显示弹窗，显示加载中
  relationHistoryContent.value = '加载中...'
  relationHistoryPartner.value = relation.character.name
  relationHistoryModal.value = true

  try {
    const { getRelationHistory } = await import('@/api/llmApi')
    const history = await getRelationHistory(
      characterStore.selectedCharacter.name,
      relation.character.name
    )
    relationHistoryContent.value = history
  } catch (error) {
    console.error('加载关系经历失败:', error)
    relationHistoryContent.value = '加载关系经历失败，请稍后重试'
    ElMessage.error('加载关系经历失败')
  }
}

// 双击相关人物切换
const handleRelatedDblclick = (relation) => {
  if (!relation.character) return
  characterStore.selectedCharacter = relation.character
  loadCharacterInfo(relation.character)
}

// 加载人物信息
const loadCharacterInfo = async (character) => {
  characterStore.setLoading(true)
  
  try {
    // 先获取相关人物（不依赖大模型API）
    const related = characterStore.getRelatedCharactersExtended(character.id)
    characterStore.relatedCharacters = related
    
    // 立即取消 loading，显示相关人物
    characterStore.setLoading(false)
    
    // 获取人物简介（异步调用大模型API）
    const { getCharacterInfo } = await import('@/api/llmApi')
    const info = await getCharacterInfo(character.name)
    characterStore.characterInfo = info
    characterStore.currentRelation = null
  } catch (error) {
    console.error('加载人物信息失败:', error)
    ElMessage.error('加载人物信息失败')
    characterStore.setLoading(false)
  }
}

// 计算显示的相关人物
const displayRelations = computed(() => {
  if (!characterStore.selectedCharacter) return []
  return characterStore.relatedCharacters
})

// 获取当前人物
const currentCharacter = computed(() => {
  return characterStore.selectedCharacter
})

// 获取当前简介
const currentInfo = computed(() => {
  return characterStore.characterInfo || '暂无简介'
})
</script>

<template>
  <div class="side-bar">
    <div v-if="!currentCharacter" class="empty-state">
      <div class="empty-icon">
        <el-icon><User /></el-icon>
      </div>
      <p>点击人物查看详情</p>
    </div>

    <div v-else class="content">
      <div class="header">
        <div class="avatar">
          <el-icon size="40"><User /></el-icon>
        </div>
        <h2 class="name">{{ currentCharacter.name }}</h2>
        <div class="tags">
          <el-tag :type="currentCharacter.faction === 'shu' ? 'success' : currentCharacter.faction === 'wei' ? 'primary' : currentCharacter.faction === 'wu' ? 'warning' : 'info'">
            {{ getFactionName(currentCharacter.faction) }}
          </el-tag>
          <el-tag type="info">
            {{ getRoleName(currentCharacter.role) }}
          </el-tag>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title"><el-icon><Document /></el-icon> 简介</h3>
        <div class="info-content">
          <p v-if="characterStore.isLoading" class="loading">加载中...</p>
          <p v-else class="text">{{ currentInfo || '暂无简介' }}</p>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">
          <el-icon><Connection /></el-icon>
          相关人物 ({{ displayRelations.length }})
        </h3>
        <div v-if="!characterStore.isLoading" class="relations-list">
          <div
            v-for="relation in displayRelations"
            :key="relation.character?.id"
            class="relation-item"
            @click="handleRelatedClick(relation)"
            @dblclick="handleRelatedDblclick(relation)"
          >
            <div class="relation-avatar">
              <el-icon size="30"><UserFilled /></el-icon>
            </div>
            <div class="relation-info">
              <div class="relation-name">{{ relation.character?.name }}</div>
              <div class="relation-type">{{ relation.type }}</div>
            </div>
          </div>
          <p v-if="displayRelations.length === 0" class="no-relations">暂无相关人物</p>
        </div>
        <div v-else class="loading-relations">加载中...</div>
      </div>

      <div class="tip">
        <el-icon><InfoFilled /></el-icon>
        提示：点击相关人物查看关系经历，双击切换为当前人物
      </div>
    </div>

    <!-- 相交经历弹窗 -->
    <RelationHistoryModal
      v-model:visible="relationHistoryModal"
      :content="relationHistoryContent"
      :partner="relationHistoryPartner"
      :selected-character="characterStore.selectedCharacter"
    />
  </div>
</template>

<style scoped>
.side-bar {
  width: 320px;
  background: white;
  border-left: 1px solid #e4e7ed;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #dcdfe6;
}

.content {
  padding: 20px;
}

.header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 15px;
}

.name {
  margin: 0 0 12px;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.info-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
}

.text {
  margin: 0;
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
  white-space: pre-wrap;
}

.loading {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.relations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.relation-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
  transform: translateX(4px);
}

.relation-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.relation-info {
  flex: 1;
}

.relation-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.relation-type {
  font-size: 12px;
  color: #909399;
}

.no-relations {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.loading-relations {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.tip {
  margin-top: 20px;
  padding: 12px;
  background: #ecf5ff;
  border-radius: 6px;
  color: #409eff;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 滚动条样式 */
.side-bar::-webkit-scrollbar {
  width: 6px;
}

.side-bar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.side-bar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.side-bar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>