import type{Express, Request, Response} from 'express'
import express from 'express'

import serverConfig from '@/config/env.js'
import { corsMiddleware } from '@/middleware/cors.middleware.js'
// Create an instance of the Express application
const app: Express = express()

/**
 *  Middlewares
 */

//middleware to parse JSON bodies
app.use(express.json())

//cors middleware
const corsOptions = {
    origin: serverConfig.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600, // 1 hour
    
}
app.use(corsMiddleware(corsOptions))


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!')
})





export default app;