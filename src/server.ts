import app from "./app.js";

import serverConfig from '@/config/env.js'




async function startServer() {
    try{
        app.listen(serverConfig.port, () => {
            console.log(`Server is running on port ${serverConfig.port} in ${serverConfig.nodeEnv} mode.`)
        },)
    }catch(error){  
        console.error("Error starting server:", error)
        process.exit(1)
    }
}
void startServer()
