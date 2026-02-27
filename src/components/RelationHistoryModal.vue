<script setup>
import { ref, watch } from 'vue'

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
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="人物关系经历"
    width="500px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="relation-history-content">
      <p class="relation-info">
        <strong>{{ selectedCharacter?.name }}</strong> 与 
        <strong>{{ partner }}</strong> 的关系：
      </p>
      <p v-if="content" class="history-text">{{ content }}</p>
      <p v-else class="history-text">加载中...</p>
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
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.relation-info strong {
  color: #303133;
}

.history-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #303133;
}
</style>