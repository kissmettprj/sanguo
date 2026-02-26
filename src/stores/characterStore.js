import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref([])
  const relationships = ref([])
  const selectedCharacter = ref(null)
  const characterInfo = ref(null)
  const relatedCharacters = ref([])
  const currentRelation = ref(null)
  const isLoading = ref(false)

  // 加载数据
  async function loadData() {
    try {
      const response = await fetch('/data/characters.json')
      const data = await response.json()
      characters.value = data.characters
      relationships.value = data.relationships
    } catch (error) {
      console.error('加载人物数据失败:', error)
      throw error
    }
  }

  // 获取相关人物列表
  function getRelatedCharacters(characterId) {
    const related = relationships.value
      .filter(r => r.source === characterId || r.target === characterId)
      .map(r => {
        const relatedId = r.source === characterId ? r.target : r.source
        const character = characters.value.find(c => c.id === relatedId)
        return {
          ...r,
          character,
          isSource: r.source === characterId
        }
      })
    return related
  }

  // 获取相关人物列表（包含反向关系）
  function getRelatedCharactersExtended(characterId) {
    console.log('查找相关人物, ID:', characterId)
    console.log('关系数据:', relationships.value)
    console.log('人物数据:', characters.value)
    
    const related = relationships.value
      .filter(r => {
        // 关系数据中source/target可能是对象或ID
        const sourceId = typeof r.source === 'object' ? r.source.id : r.source
        const targetId = typeof r.target === 'object' ? r.target.id : r.target
        return sourceId === characterId || targetId === characterId
      })
      .map(r => {
        const sourceId = typeof r.source === 'object' ? r.source.id : r.source
        const targetId = typeof r.target === 'object' ? r.target.id : r.target
        const relatedId = sourceId === characterId ? targetId : sourceId
        const character = characters.value.find(c => c.id === relatedId)
        console.log('找到关系:', r, '相关人物ID:', relatedId, '人物:', character)
        return {
          ...r,
          character,
          isSource: sourceId === characterId
        }
      })
    return related
  }

  // 设置选中人物
  function selectCharacter(character) {
    selectedCharacter.value = character
    characterInfo.value = null
    relatedCharacters.value = []
    currentRelation.value = null
  }

  // 设置人物简介
  function setCharacterInfo(info) {
    characterInfo.value = info
  }

  // 设置相关人物
  function setRelatedCharacters(related) {
    relatedCharacters.value = related
  }

  // 设置当前关系
  function setCurrentRelation(relation) {
    currentRelation.value = relation
  }

  // 清空选择
  function clearSelection() {
    selectedCharacter.value = null
    characterInfo.value = null
    relatedCharacters.value = []
    currentRelation.value = null
  }

  // 设置加载状态
  function setLoading(status) {
    isLoading.value = status
  }

  return {
    characters,
    relationships,
    selectedCharacter,
    characterInfo,
    relatedCharacters,
    currentRelation,
    isLoading,
    loadData,
    getRelatedCharacters,
    getRelatedCharactersExtended,
    selectCharacter,
    setCharacterInfo,
    setRelatedCharacters,
    setCurrentRelation,
    clearSelection,
    setLoading
  }
})
