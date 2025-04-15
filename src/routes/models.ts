import express, { Request, Response } from 'express';
import { ModelsResponse, ModelObject } from '../types';

export const modelsRouter = express.Router();

// Get models list endpoint (OpenAI compatible)
modelsRouter.get('/', (req: Request, res: Response) => {
  try {
    // Create timestamp for 'created' field
    const created = Math.floor(Date.now() / 1000);
    
    // Define available models
    const modelsList: ModelObject[] = [
      {
        id: 'ds-v3',
        object: 'model',
        created,
        owned_by: 'deepseek'
      },
      {
        id: 'ds-r1',
        object: 'model',
        created,
        owned_by: 'deepseek'
      },
      {
        id: 'ds-v3-search',
        object: 'model',
        created,
        owned_by: 'deepseek'
      },
      {
        id: 'ds-r1-search',
        object: 'model',
        created,
        owned_by: 'deepseek'
      }
    ];
    
    // Format response to match OpenAI's format
    const response: ModelsResponse = {
      object: 'list',
      data: modelsList
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Models list error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'An error occurred while retrieving models list',
        type: 'server_error',
      }
    });
  }
}); 