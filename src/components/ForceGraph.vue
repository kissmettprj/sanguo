<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as d3 from 'd3'
import { useCharacterStore } from '@/stores/characterStore'
import { getNodeStyle } from '@/utils/colors'
import { ElMessage } from 'element-plus'

const characterStore = useCharacterStore()

const svgRef = ref(null)
let svg = null
let simulation = null
let nodes = null
let links = null
let nodeElements = null
const emit = defineEmits(['character-click'])

const width = 800
const height = 600

// 移动端适配
const isMobile = () => window.innerWidth < 768

// 调整力导向图大小
const adjustSize = () => {
  if (svg) {
    const w = isMobile() ? Math.min(window.innerWidth - 20, 600) : width
    const h = isMobile() ? Math.min(window.innerHeight - 100, 500) : height
    svg.attr('width', w)
      .attr('height', h)
      .attr('viewBox', [0, 0, w, h])

    // 更新力导向图中心
    if (simulation) {
      simulation.force('center', d3.forceCenter(w / 2, h / 2))
      simulation.alpha(0.3).restart()
    }

    // 更新节点大小
    if (nodeElements) {
      nodeElements.select('circle')
        .attr('r', isMobile() ? 25 : 35)
    }

    // 更新连线距离
    if (simulation) {
      simulation.force('link', d3.forceLink(characterStore.relationships)
        .id(d => d.id)
        .distance(isMobile() ? 80 : 120))
      simulation.alpha(0.3).restart()
    }
  }
}

// 初始化力导向图
const initForceGraph = () => {
  if (!svgRef.value) return

  // 清空 SVG
  d3.select(svgRef.value).selectAll('*').remove()

  // 创建 SVG
  svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 创建箭头定义
  svg.append('defs').selectAll('marker')
    .data(['end'])
    .enter().append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', '#999')
    .attr('d', 'M0,-5L10,0L0,5')

  // 创建连线组
  links = svg.append('g')
    .attr('class', 'links')

  // 创建节点组
  nodes = svg.append('g')
    .attr('class', 'nodes')

  // 渲染图形
  renderGraph()
}

// 渲染力图
const renderGraph = () => {
  if (!links || !nodes) return

  const data = {
    nodes: characterStore.characters,
    links: characterStore.relationships
  }

  // 创建力导向图
  simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(40))

  // 绘制连线
  const linkElements = links.selectAll('line')
    .data(data.links)
    .enter().append('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#arrow)')

  // 绘制节点
  nodeElements = nodes.selectAll('g')
    .data(data.nodes)
    .enter().append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded))

  // 添加圆
  nodeElements.append('circle')
    .attr('r', 35)
    .attr('cursor', 'pointer')
    .on('click', handleNodeClick)
    .on('dblclick', handleNodeDblclick)
    .on('contextmenu', handleRightClick)

  // 添加文字标签
  nodeElements.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .attr('pointer-events', 'none')
    .text(d => d.name)

  // 设置节点样式
  nodeElements.each(function(d) {
    const style = getNodeStyle(d.faction, d.role)
    d3.select(this).select('circle')
      .attr('stroke', style.stroke)
      .attr('stroke-width', 3)
      .attr('fill', style.fill)
  })

  // 更新 tick 函数
  simulation.on('tick', () => {
    linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    nodeElements
      .attr('transform', d => `translate(${d.x},${d.y})`)
  })

  // 运行仿真
  simulation.alpha(1).restart()
}

// 处理节点点击
const handleNodeClick = (event, d) => {
  event.stopPropagation()
  characterStore.selectCharacter(d)
  
  // 加载人物简介和相关人物
  loadCharacterInfo(d)
  emit('character-click', d)
}

// 处理双击切换
const handleNodeDblclick = (event, d) => {
  event.stopPropagation()
  characterStore.selectCharacter(d)
  loadCharacterInfo(d)
}

// 右键菜单（移动端长按替代）
const handleRightClick = (event, d) => {
  event.preventDefault()
  event.stopPropagation()
}

// 加载人物信息
const loadCharacterInfo = async (character) => {
  console.log('加载人物信息:', character)
  console.log('人物数据:', characterStore.characters)
  console.log('关系数据:', characterStore.relationships)

  characterStore.setLoading(true)

  try {
    // 先获取相关人物（不依赖大模型API）
    const related = characterStore.getRelatedCharactersExtended(character.id)
    console.log('相关人物:', related)
    characterStore.relatedCharacters = related

    // 立即取消 loading，显示相关人物
    characterStore.setLoading(false)

    // 获取人物简介（异步调用大模型API）
    const { getCharacterInfo } = await import('@/api/llmApi')
    const info = await getCharacterInfo(character.name)
    characterStore.setCharacterInfo(info)
    characterStore.currentRelation = null
  } catch (error) {
    console.error('加载人物信息失败:', error)
    ElMessage.error('加载人物信息失败')
    characterStore.setLoading(false)
  }
}

// 拖拽相关函数
const dragStarted = (event, d) => {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

const dragged = (event, d) => {
  d.fx = event.x
  d.fy = event.y
}

const dragEnded = (event, d) => {
  if (!event.active) simulation.alphaTarget(0)
  if (event.sourceEvent.shiftKey) {
    d.fx = null
    d.fy = null
  }
}

// 监听数据变化
watch(() => characterStore.characters.length, (newLen) => {
  if (newLen > 0) {
    renderGraph()
  }
})

// 监听选择变化，高亮相关节点
watch(() => characterStore.selectedCharacter, (newChar) => {
  if (nodeElements && newChar) {
    nodeElements.each(function(d) {
      const isRelated = characterStore.relatedCharacters.some(r => 
        r.character && r.character.id === d.id
      )
      const isSelected = d.id === newChar.id
      
      d3.select(this).select('circle')
        .transition().duration(200)
        .attr('stroke-width', isSelected ? 5 : (isRelated ? 4 : 3))
        .attr('fill', isSelected ? '#fff' : getNodeStyle(d.faction, d.role).fill)
    })
  } else if (nodeElements) {
    nodeElements.each(function(d) {
      const style = getNodeStyle(d.faction, d.role)
      d3.select(this).select('circle')
        .transition().duration(200)
        .attr('stroke-width', 3)
        .attr('fill', style.fill)
    })
  }
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  characterStore.loadData()
    .then(() => {
      initForceGraph()
      adjustSize()
    })
    .catch(err => {
      console.error('初始化失败:', err)
      ElMessage.error('加载数据失败，请刷新重试')
    })

  // 监听窗口大小变化
  window.addEventListener('resize', adjustSize)
})

onBeforeUnmount(() => {
  if (simulation) {
    simulation.stop()
  }
  if (svg) {
    svg.selectAll('*').remove()
  }
  window.removeEventListener('resize', adjustSize)
})

// 点击背景清空选择
const handleBackgroundClick = () => {
  characterStore.clearSelection()
  emit('character-click', null)
}
</script>

<template>
  <div class="force-graph-container" @click="handleBackgroundClick">
    <svg ref="svgRef" class="force-graph"></svg>
    <div v-if="characterStore.isLoading" class="loading-overlay">
      <span class="loading-text">加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.force-graph-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: white;
}

.force-graph {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.force-graph:active {
  cursor: grabbing;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-text {
  font-size: 16px;
  color: #666;
}

/* 连线样式 */
.links line {
  stroke-opacity: 0.6;
  transition: stroke-opacity 0.3s;
}

/* 节点样式 */
.node circle {
  transition: all 0.3s ease;
}

.node:hover circle {
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));
}

.node text {
  user-select: none;
}
</style>
