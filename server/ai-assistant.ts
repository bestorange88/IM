export interface AIResponse {
  content: string;
  error?: string;
}

// 检查服务是否可用
export function isAIServiceAvailable(): boolean {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  return typeof apiKey === "string" && apiKey.length > 10;
}

// 获取服务状态
export function getAIServiceStatus() {
  return {
    available: isAIServiceAvailable(),
    provider: "Google Gemini",
    model: "gemini-1.5-flash",
    features: ["对话聊天", "知识问答", "人生指导", "技术支持"]
  };
}

/**
 * 获取AI助手回复
 * @param userMessage 用户消息
 * @param conversationHistory 可选对话历史
 * @returns AI 回复内容
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<AIResponse> {
  try {
    if (!isAIServiceAvailable()) {
      return {
        content: "抱歉，道友，慧心暂时闭关中，请联系管理员开启灵力通道。",
        error: "API_KEY_MISSING"
      };
    }

    // 模拟AI回复（如果需要真实AI，需要安装和配置Google Gemini）
    const responses = [
      "道友所问颇有见地，慧心深感欣慰。",
      "此事需要细细思量，不可急于一时。",
      "山不转水转，换个角度或许豁然开朗。",
      "天行健，君子以自强不息。道友加油！",
      "泰山之巅，心境自然开阔。",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse
    };

  } catch (error: any) {
    console.error("慧心 AI 错误：", error);
    return {
      content: "慧心调息中，暂无法回应。请稍后再试。",
      error: error?.message || "UNKNOWN_ERROR"
    };
  }
}