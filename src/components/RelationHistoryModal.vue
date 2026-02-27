<script setup>
import { ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

defineProps({
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

// 解析事件列表
const parseEvents = (text) => {
  if (!text) return []

  try {
    // 尝试解析 JSON 格式
    if (text.trim().startsWith('{')) {
      const data = JSON.parse(text)
      if (Array.isArray(data.events)) {
        return data.events.map(e => ({
          time: e.time || '',
          description: e.description || '',
          impact: e.impact || ''
        }))
      }
    }
  } catch (e) {
    // JSON 解析失败，尝试解析文本格式
  }

  // 解析文本格式：按行分割，提取序号和时间
  const lines = text.split('\n').filter(line => line.trim())
  const events = []

  lines.forEach((line, index) => {
    // 提取序号
    const match = line.match(/^(\d+)\.\s*(.*)/)
    if (match) {
      const time = match[1] + '年' // 提取序号作为时间
      const description = match[2]

      // 尝试提取影响信息
      let impact = ''
      const impactMatch = line.match(/影响[:：]\s*(.+)$/)
      if (impactMatch) {
        impact = impactMatch[1].trim()
      }

      events.push({
        time,
        description,
        impact
      })
    }
  })

  return events
}

const events = ref([])

watch(() => props.content, (newVal) => {
  events.value = parseEvents(newVal)
}, { immediate: true, deep: true })
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="人物关系经历"
    width="600px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="relation-history-content">
      <p class="relation-info">
        <strong>{{ selectedCharacter?.name }}</strong> 与 
        <strong>{{ partner }}</strong> 的关系
      </p>

      <div v-if="events.length > 0" class="events-list">
        <div
          v-for="(event, index) in events"
          :key="index"
          class="event-item"
        >
          <div class="event-header">
            <span class="event-number">{{ index + 1 }}</span>
            <span v-if="event.time" class="event-time">{{ event.time }}</span>
          </div>
          <div class="event-description">
            {{ event.description }}
          </div>
          <div v-if="event.impact" class="event-impact">
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
}

.relation-info {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.relation-info strong {
  color: #303133;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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
}

.event-impact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #67c23a;
  padding: 6px 12px;
  background: #f0f9ff;
  border-radius: 4px;
}

.event-impact span {
  color: #409eff;
}

.loading-text {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
}
</style>