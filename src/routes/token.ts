import express, { Request, Response } from 'express';
import { apiService } from '../services/api';
import { TokenCheckRequest, TokenCheckResponse } from '../types';

export const tokenRouter = express.Router();

// Token check endpoint
tokenRouter.post('/check', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as TokenCheckRequest;
    
    if (!token) {
      return res.status(400).json({
        error: {
          message: 'Token is required',
          type: 'validation_error',
        }
      });
    }
    
    const isValid = await apiService.checkToken(token);
    
    const response: TokenCheckResponse = {
      live: isValid
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Token check error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'An error occurred while checking the token',
        type: 'server_error',
      }
    });
  }
}); 