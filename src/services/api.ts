import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ChatCompletionRequest, ChatCompletionResponse } from '../types';

// Node.js types
import { env } from 'process';

// Default base URL from environment variable
const baseURL = env.DEEPSEEK_API_URL || 'https://chat.zju.edu.cn';

// Function to get a random token from a comma-separated list
export const getRandomToken = (tokenStr: string): string => {
  if (!tokenStr) return '';
  
  const tokens = tokenStr.split(',');
  return tokens[Math.floor(Math.random() * tokens.length)].trim();
};

// Create axios instance for DeepSeek API
const deepSeekApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Connection': 'keep-alive',
  },
  timeout: 60000, // 60 seconds timeout
});

// API functions for DeepSeek
export const apiService = {
  /**
   * Send chat completion request to DeepSeek API
   * Returns a response object for JSON responses or a stream for streaming responses
   */
  chatCompletion: async (
    request: ChatCompletionRequest,
    token: string,
    abortController?: AbortController
  ): Promise<ChatCompletionResponse | any> => {
    try {
      // Validate token
      if (!token) {
        throw new Error('Authorization token is required');
      }

      // Prepare model-specific request
      const apiRequest: ChatCompletionRequest = {
        ...request,
        features: {
          image_generation: false,
          code_interpreter: false,
          web_search: false,
          ...(request.features || {}),
        }
      };

      // Process the model name and set the features accordingly
      const modelName = request.model.toLowerCase();
      
      // Map model names correctly - 根据实际调用成功的情况设置
      switch (modelName) {
        case 'ds-v3':
          apiRequest.model = 'ds-v3';
          break;
        case 'ds-r1':
          apiRequest.model = 'ds-r1';
          break;
        case 'ds-v3-search':
          apiRequest.model = 'ds-v3';
          if (apiRequest.features) {
            apiRequest.features.web_search = true;
          }
          break;
        case 'ds-r1-search':
          apiRequest.model = 'ds-r1';
          if (apiRequest.features) {
            apiRequest.features.web_search = true;
          }
          break;
        default:
          apiRequest.model = 'ds-v3';
      }

      console.log('Preparing request to DeepSeek API:', {
        url: `${baseURL}/v1/chat/completions`,
        model: apiRequest.model,
        streaming: apiRequest.stream,
        features: apiRequest.features,
        messageCount: apiRequest.messages.length
      });

      // Set up request configuration - 修复类型问题
      const config: AxiosRequestConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
          'Origin': 'https://chat.zju.edu.cn',
        },
        signal: abortController?.signal,
      };

      // 根据是否需要流式响应设置responseType
      if (request.stream) {
        config.responseType = 'stream';
      } else {
        config.responseType = 'json';
      }

      // Make the API call
      const response = await deepSeekApi.post('/v1/chat/completions', apiRequest, config);

      // If streaming, return the response stream directly
      if (request.stream) {
        return response.data;
      }
      
      // Otherwise, return the JSON response
      return response.data as ChatCompletionResponse;

    } catch (error: unknown) {
      console.error('DeepSeek API request failed:', error);
      
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('API Response:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        });
        
        // 修复错误处理，避免访问不存在的属性
        let errorMessage = 'Failed to communicate with DeepSeek API';
        
        if (axiosError.message) {
          errorMessage = axiosError.message;
        }
        
        if (axiosError.response?.data) {
          const responseData = axiosError.response.data as any;
          if (typeof responseData === 'object' && responseData !== null && 'error' in responseData && responseData.error?.message) {
            errorMessage = responseData.error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Re-throw other errors
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  },

  /**
   * Check if token is valid with DeepSeek API
   */
  checkToken: async (token: string): Promise<boolean> => {
    try {
      if (!token) {
        console.error('Token check failed: No token provided');
        return false;
      }

      // Make a minimal API call to test the token
      const response = await deepSeekApi.post(
        '/v1/chat/completions',
        {
          model: 'ds-v3',
          messages: [{ role: 'user', content: 'Hello' }],
          stream: false,
          features: {
            image_generation: false,
            code_interpreter: false,
            web_search: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          },
        }
      );

      return response.status === 200;
    } catch (error: unknown) {
      console.error('Token check failed:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('API Response:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        });
      }
      return false;
    }
  },
}; 