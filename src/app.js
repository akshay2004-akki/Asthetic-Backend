import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials : true
}))

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true, limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import appointmentRouter from './routes/appointment.routes.js'

app.use("/api/v2/users", userRouter)
app.use("/api/v2/appointment", appointmentRouter);

export default app