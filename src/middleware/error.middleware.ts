import type { Request, Response } from 'express'


export function globalErrorHandler(err: Error, req: Request, res: Response) {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' })
}