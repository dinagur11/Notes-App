import { Request, Response } from 'express';
import { runAgent } from '../services/aiService';

export const complete = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt } = req.body;
        
        // Error 400: Invalid body (missing prompt)
        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ error: 'Prompt is required and must be a string' });
            return;
        }

        // Run the bounded Agent loop (imported from the new aiService)
        const result = await runAgent({ prompt });
        
        // Success 200: Return the text
        res.status(200).json(result);

    } catch (error: any) {
        console.error("AI Controller Error:", error.message || error);

        // Error 504: Agent timed out (thrown by our MAX_ROUND_TRIPS loop)
        if (error.status === 504) {
            res.status(504).json({ error: 'Agent timed out' });
        } 
        // Error 502: Ollama is unreachable (Network/fetch failures)
        else if (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('fetch failed'))) {
            res.status(502).json({ error: 'Ollama is unreachable' });
        } 
        // Error 500: Any other internal server error
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};