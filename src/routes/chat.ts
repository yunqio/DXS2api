import express, { Request, Response } from 'express';
import { apiService, getRandomToken } from '../services/api';
import { ChatCompletionRequest } from '../types';
import { AxiosResponse } from 'axios';

export const chatRouter = express.Router();

// Chat completion endpoint
chatRouter.post('/completions', async (req: Request, res: Response) => {
  try {
    const requestData: ChatCompletionRequest = req.body;
    
    // Get token from request headers or environment variable
    let token = '';
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (process.env.DXS_AUTHORIZATION) {
      token = getRandomToken(process.env.DXS_AUTHORIZATION);
    }
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authorization token is required. Please provide a valid Bearer token.',
          type: 'authentication_error',
        }
      });
    }

    // Handle streaming response
    if (requestData.stream) {
      // Set proper headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      
      const abortController = new AbortController();
      
      // Handle client disconnect
      req.on('close', () => {
        abortController.abort();
      });
      
      try {
        // For streaming, we expect a stream response that we can pipe
        const stream = await apiService.chatCompletion(
          requestData,
          token,
          abortController
        ) as any; // Use any type here to bypass TypeScript restriction
        
        // Pipe the stream directly to the response if it has a pipe method
        if (stream && typeof stream.pipe === 'function') {
          stream.pipe(res);
        } else {
          // Handle case where response is not a streamable object
          res.status(500).json({
            error: {
              message: 'Expected a stream but received non-streamable response',
              type: 'server_error',
            }
          });
        }
      } catch (error: any) {
        // If streaming already started, we can't change the headers
        if (!res.headersSent) {
          res.status(500).json({
            error: {
              message: error.message || 'An error occurred during streaming',
              type: 'server_error',
            }
          });
        } else {
          // End the stream with an error event
          res.write(`data: ${JSON.stringify({
            error: {
              message: error.message || 'An error occurred during streaming',
              type: 'server_error',
            }
          })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        }
      }
    } else {
      // Handle regular (non-streaming) response
      const response = await apiService.chatCompletion(requestData, token);
      res.json(response);
    }
  } catch (error: any) {
    console.error('Chat completion error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'An error occurred while processing your request',
        type: 'server_error',
      }
    });
  }
}); 