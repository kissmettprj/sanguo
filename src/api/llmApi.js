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
  const prompt = `请详细介绍三国时期人物${char1Name}与${char2Name}之间的交集经历、重要事件和相互关系。

要求：
1. 按时间顺序列出他们的主要交往事件（每个事件包含：时间、事件描述、对双方的影响）
2. 最后总结两人的关系特点和相互影响
3. 返回标准的 JSON 格式，包含 summary 和 events 两个字段

请严格按照以下 JSON 格式返回，不要返回任何其他文字：

{
  "summary": "两人关系的总结文字",
  "events": [
    {
      "time": "公元189年",
      "description": "详细的事件描述，描述事件的具体过程和细节",
      "impact": "对双方的具体影响"
    }
  ]
}

注意：
- summary 必须总结两人的关系特点、相互影响和重要性
- time 必须是具体的时间，如"公元189年"、"公元190年"等
- description 是事件的详细描述，要包含具体过程、细节和背景
- impact 是事件对双方的具体影响，要详细说明影响的内容和程度
- events 数组按时间顺序排列
- 不要包含任何其他文字说明`;

  const systemPrompt = '你是一位精通三国历史的历史学家，请用专业、准确、详细的语言回答，并严格按照指定的 JSON 格式返回数据，不要添加任何其他文字或解释。';

  try {
    const result = await callLLM(prompt, systemPrompt);
    console.log('LLM 返回的原始内容:', result);
    return result;
  } catch (error) {
    ElMessage.warning('获取关系经历失败，请稍后重试');
    return JSON.stringify({
      summary: `关于${char1Name}与${char2Name}的关系经历暂不可用。`,
      events: [{
        time: '',
        description: '',
        impact: ''
      }]
    });
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
