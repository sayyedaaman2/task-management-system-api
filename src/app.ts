import type{Express, Request, Response} from 'express'
import express from 'express'

// Create an instance of the Express application
const app: Express = express()

//middleware to parse JSON bodies
app.use(express.json())


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!')
})


export default app;