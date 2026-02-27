<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { getFactionName, getRoleName } from '@/utils/colors'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import RelationHistoryModal from '@/components/RelationHistoryModal.vue'

const characterStore = useCharacterStore()

const props = defineProps({
  character: {
    type: Object,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['character-click'])

const sidebarVisible = computed(() => props.character !== null)
// 相关人物点击事件（打开弹框）
const handleRelatedCardClick = (relation) => {
  if (!relation.character) return

  // 设置当前关系
  characterStore.currentRelation = relation

  // 显示相交经历弹窗
  showRelationHistory(relation)
}

// 点击详情链接切换人物
const handleDetailClick = (relation) => {
  if (!relation.character) return

  // 切换到该人物
  characterStore.selectedCharacter = relation.character

  // 加载该人物的信息
  loadCharacterInfo(relation.character)
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

// 移动端关闭按钮
const handleMobileClose = () => {
  emit('character-click', null)
}
</script>

<template>
  <div :class="{ 'side-bar':true, 'side-bar-open': sidebarVisible, 'mobile': isMobile }">
    <div v-if="!currentCharacter" class="empty-state">
      <div class="empty-icon">
        <el-icon><User /></el-icon>
      </div>
      <p>点击人物查看详情</p>
    </div>

    <div v-else class="content">
      <!-- 移动端关闭按钮 -->
      <button v-if="isMobile" class="mobile-close-btn" @click="handleMobileClose">
        <el-icon><Close /></el-icon>
      </button>

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
            @click.stop="handleRelatedCardClick(relation)"
          >
            <div class="relation-avatar">
              <el-icon size="30"><UserFilled /></el-icon>
            </div>
            <div class="relation-info">
              <div class="relation-name">{{ relation.character?.name }}</div>
              <div class="relation-type">{{ relation.type }}</div>
            </div>
            <el-link
              type="primary"
              class="detail-link"
              @click.stop="handleDetailClick(relation)"
            >
              详情
            </el-link>
          </div>
          <p v-if="displayRelations.length === 0" class="no-relations">暂无相关人物</p>
        </div>
        <div v-else class="loading-relations">加载中...</div>
      </div>

      <div class="tip">
        <el-icon><InfoFilled /></el-icon>
        提示：点击"详情"切换人物，点击卡片其他部分查看关系经历
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
  transition: width 0.3s ease, transform 0.3s ease;
  width: 0;
  overflow: hidden;
  cursor: pointer;
}

.side-bar-open {
  width: 320px;
  cursor: default;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
}

/* 移动端样式 */
.side-bar.mobile {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 400px;
  height: 100dvh;
  z-index: 1000;
  background: white;
  transform: translateX(-100%);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
}

.side-bar.mobile.side-bar-open {
  transform: translateX(0);
}

/* 移动端关闭按钮 */
.mobile-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #606266;
}

.mobile-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #303133;
}

.mobile-close-btn :deep(.el-icon) {
  font-size: 18px;
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
  padding-bottom: 40px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  overflow-x: hidden;
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

.side-bar-open {
  width: 320px;
  cursor: default;
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

.relation-avatar,
.relation-info {
  cursor: pointer;
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
  flex-shrink: 0;
  transition: all 0.2s;
}

.relation-avatar:hover {
  transform: scale(1.1);
}

.relation-info {
  flex: 1;
  min-width: 0;
}

.relation-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.relation-type {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-link {
  flex-shrink: 0;
  margin-left: 12px;
  cursor: pointer;
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

/* 移动端滚动条样式 */
.side-bar.mobile::-webkit-scrollbar {
  width: 4px;
}

.side-bar.mobile::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.side-bar.mobile::-webkit-scrollbar-thumb {
  background: #d1d1d1;
  border-radius: 2px;
}

.side-bar.mobile::-webkit-scrollbar-thumb:hover {
  background: #b8b8b8;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>