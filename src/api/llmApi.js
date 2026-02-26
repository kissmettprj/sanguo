import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE_URL = import.meta.env.VITE_LLM_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY || ''
const API_MODEL = import.meta.env.VITE_LLM_API_MODEL || 'qwen2.5:7b'

// 构建 API 请求
async function callLLM(prompt, systemPrompt = '') {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
    
    if (API_KEY) {
      headers.Authorization = `Bearer ${API_KEY}`
    }
    
    const response = await axios.post(API_BASE_URL, {
      model: API_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: false,
      temperature: 0.7,
      top_p: 0.9
    }, {
      timeout: 30000,
      headers: headers
    })
    
    // 处理不同格式的响应
    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content
    }
    return response.data.response || response.data.answer || ''
  } catch (error) {
    console.error('LLM API 调用失败:', error)
    throw error
  }
}

// 获取人物简介
export async function getCharacterInfo(characterName) {
  const prompt = `请简洁介绍三国时期人物${characterName}的生平事迹、性格特点和历史评价，控制在 200 字以内。`;
  const systemPrompt = '你是一位精通三国历史的历史学家，请用简洁专业的语言回答。';
  
  try {
    const result = await callLLM(prompt, systemPrompt);
    return result;
  } catch (error) {
    ElMessage.warning('获取人物简介失败，请稍后重试');
    return `关于${characterName}的简介暂不可用。`;
  }
}

// 获取两人物间的相交经历
export async function getRelationHistory(char1Name, char2Name) {
  const prompt = `请介绍三国时期人物${char1Name}与${char2Name}之间的交集经历、重要事件和相互关系，控制在 200 字以内。`;
  const systemPrompt = '你是一位精通三国历史的历史学家，请用简洁专业的语言回答。';
  
  try {
    const result = await callLLM(prompt, systemPrompt);
    return result;
  } catch (error) {
    ElMessage.warning('获取关系经历失败，请稍后重试');
    return `关于${char1Name}与${char2Name}的关系经历暂不可用。`;
  }
}

// 获取相关人物列表（从 API 获取）
export async function getRelatedCharacters(characterName) {
  const prompt = `请列出三国时期人物${characterName}的主要相关人物（3-5 人），简要说明关系类型。`;
  const systemPrompt = '你是一位精通三国历史的历史学家，请用简洁专业的语言回答，只列出人物名称和关系类型。';
  
  try {
    const result = await callLLM(prompt, systemPrompt);
    return result;
  } catch (error) {
    ElMessage.warning('获取相关人物失败，请稍后重试');
    return [];
  }
}

// 导出默认对象
export default {
  callLLM,
  getCharacterInfo,
  getRelationHistory,
  getRelatedCharacters
};
