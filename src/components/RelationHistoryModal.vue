<script setup>
import { ref, watch } from 'vue'
import { InfoFilled, Star, List } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ''
  },
  partner: {
    type: String,
    default: ''
  },
  selectedCharacter: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:visible'])

const handleClose = () => {
  emit('update:visible', false)
}

// 移动端判断
const isMobile = () => { return window.innerWidth < 768 ;}


// 解析 JSON 格式的事件列表
const parseData = (text) => {
  console.log('开始解析 JSON:', text)

  if (!text) {
    console.log('内容为空')
    return { summary: '', events: [] }
  }

  try {
    // 尝试解析 JSON
    const data = JSON.parse(text)
    console.log('解析的 JSON 数据:', data)

    const summary = data.summary || ''
    const events = Array.isArray(data.events) ? data.events.map((e, index) => ({
      id: index,
      time: e.time || e.date || '',
      description: e.description || e.event || e.content || '',
      impact: e.impact || e.influence || e.result || ''
    })) : []

    console.log('解析成功：总结：', summary, '事件数量：', events.length)
    return { summary, events }
  } catch (e) {
    console.error('JSON 解析失败:', e.message)
    console.error('原始内容:', text)
    // 返回默认的数据
    return {
      summary: '...',
      events: []
    }
  }

  console.log('未找到 events 数组')
  return { summary: '', events: [] }
}

const summary = ref('')
const events = ref([])

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  console.log('弹窗可见性变化:', newVal)

  if (newVal) {
    summary.value = ''
    events.value = []
    if (props.content) {
      const { summary: parsedSummary, events: parsedEvents } = parseData(props.content)
      summary.value = parsedSummary
      events.value = parsedEvents
    }
  } else {
    summary.value = ''
    events.value = []
  }
}, { immediate: false })

// 监听 content 变化
watch(() => props.content, (newVal) => {
  console.log('内容变化:', newVal)

  if (props.visible && newVal) {
    const { summary: parsedSummary, events: parsedEvents } = parseData(newVal)
    summary.value = parsedSummary
    events.value = parsedEvents
  }
}, { immediate: false })
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="isMobile() ? '关系经历' : '人物关系经历'"
    :width="isMobile() ? '90%' : '600px'"
    destroy-on-close
    :append-to-body="true"
    :class="{ 'mobile-dialog': isMobile() }"
    @update:model-value="emit('update:visible', $event)"
  >
      <div class="relation-history-content" @click.stop>
        <!-- 总结部分 -->
        <div v-if="summary" class="summary-section">
          <div class="summary-title">
            <el-icon><Star /></el-icon>
            <span>关系总结</span>
          </div>
          <div class="summary-text">
            {{ summary }}
          </div>
        </div>

        <!-- 事件列表部分 -->
        <div v-if="events.length > 0" class="events-list">
          <div class="events-title">
            <el-icon><List /></el-icon>
            <span>历史事件（{{ events.length }}）</span>
          </div>

          <div
            v-for="event in events"
            :key="event.id"
            class="event-item"
            @click.stop
          >
            <div class="event-header">
              <span class="event-number">{{ events.indexOf(event) + 1 }}</span>
              <span v-if="event.time" class="event-time">{{ event.time }}</span>
            </div>
            <div class="event-description">
              {{ event.description || '无描述' }}
            </div>
            <div v-if="event.impact" class="event-impact" @click.stop>
              <el-icon><InfoFilled /></el-icon>
              <span>影响：{{ event.impact }}</span>
            </div>
          </div>
        </div>

        <div v-else class="loading-text">
          <p>加载中...</p>
        </div>
      </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.relation-history-content {
  padding: 20px 0;
  max-height: 70vh;
  overflow-y: auto;
}

/* 总结部分样式 */
.summary-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.summary-title span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-text {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.95);
}

/* 事件列表样式 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.events-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.events-title span {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 事件卡片样式 */
.event-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #409eff;
  transition: all 0.3s;
}

.event-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.event-number {
  font-weight: bold;
  font-size: 18px;
  color: #409eff;
  min-width: 24px;
}

.event-time {
  font-size: 12px;
  color: #909399;
  background: #e4e7ed;
  padding: 2px 8px;
  border-radius: 4px;
}

.event-description {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.event-impact {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #67c23a;
  padding: 6px 12px;
  background: #f0f9ff;
  border-radius: 4px;
}

.event-impact span {
  color: #409eff;
  word-wrap: break-word;
}

.loading-text {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
}

/* 滚动条样式 */
.relation-history-content::-webkit-scrollbar {
  width: 8px;
}

.relation-history-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.relation-history-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.relation-history-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .relation-history-content {
    max-height: 65vh;
    padding: 12px 0;
  }

  .summary-section {
    margin-bottom: 16px;
    padding: 16px;
  }

  .summary-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .summary-text {
    font-size: 13px;
    line-height: 1.6;
  }

  .events-list {
    gap: 12px;
  }

  .events-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .event-item {
    padding: 12px;
    border-left-width: 2px;
  }

  .event-header {
    gap: 6px;
    margin-bottom: 6px;
  }

  .event-number {
    font-size: 16px;
    min-width: 20px;
  }

  .event-time {
    font-size: 11px;
    padding: 1px 6px;
  }

  .event-description {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 6px;
  }

  .event-impact {
    font-size: 11px;
    padding: 5px 10px;
    gap: 5px;
  }

  .event-impact span {
    font-size: 12px;
  }

  .loading-text {
    padding: 30px 16px;
    font-size: 13px;
  }

  /* 移动端弹窗样式 */
  .mobile-dialog {
    width: 90% !important;
    margin: 20px auto !important;
  }

  :deep(.el-dialog__header) {
    padding: 16px 20px;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.el-dialog__body) {
    padding: 16px 20px;
    max-height: 65vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 20px 20px;
  }

  /* 移动端滚动条样式 */
  .relation-history-content::-webkit-scrollbar {
    width: 4px;
  }

  .relation-history-content::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .relation-history-content::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 2px;
  }

  .relation-history-content::-webkit-scrollbar-thumb:hover {
    background: #b8b8b8;
  }
}
</style>