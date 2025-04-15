// Chat completion types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  features?: {
    image_generation?: boolean;
    code_interpreter?: boolean;
    web_search?: boolean;
  };
  conversation_id?: string;
}

export interface ChatCompletionDelta {
  content?: string;
  reasoning_content?: string;
  role?: string;
}

export interface ChatCompletionChoice {
  delta?: ChatCompletionDelta;
  message?: Message;
  index: number;
  finish_reason?: string | null;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

// Token check types
export interface TokenCheckRequest {
  token: string;
}

export interface TokenCheckResponse {
  live: boolean;
}

// OpenAI compatible model list types
export interface ModelObject {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelObject[];
} 