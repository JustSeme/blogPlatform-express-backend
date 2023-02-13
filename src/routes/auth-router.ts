import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { HTTP_STATUSES } from "../app";
import { jwtService } from "../application/jwtService";
import { authService } from "../domain/auth-service";
import { authMiddleware } from "../middlewares/auth-middleware";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { LoginInputModel } from "../models/auth/LoginInputModel";
import { MeOutputModel } from "../models/auth/MeOutputModel";
import { ErrorMessagesOutputModel } from "../models/ErrorMessagesOutputModel";
import { UserDBModel } from "../models/users/UserDBModel";
import { UserInputModel } from "../models/users/UserInputModel";
import { RequestWithBody } from "../types/types";
import { emailValidationWithCustomSearch, loginValidation } from "./users-router";

export const authRouter = Router({})

const loginOrEmailValidation = body('loginOrEmail')
.exists()
.trim()
.notEmpty()
.isString()

const passwordValidation = body('password')
.exists()
.trim()
.notEmpty()
.isString()

const emailValidation = body('email')
.exists()
.trim()
.notEmpty()
.isString()
.matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)

authRouter.post('/login',
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res: Response<ErrorMessagesOutputModel | {accessToken: string}>) => {
        const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if(!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }
        
        const jwtTokenObj = await jwtService.createJWT(user.id)
        res.send(jwtTokenObj)
})

authRouter.post('/registration',
    loginValidation,
    passwordValidation,
    emailValidationWithCustomSearch,
    inputValidationMiddleware,
    async (req: RequestWithBody<UserInputModel>, res: Response<ErrorMessagesOutputModel>) => {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const isCreated = await authService.createUser(req.body.login, req.body.password, req.body.email, clientIp as string)
        if(!isCreated) {
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-confirmation', 
    async (req: RequestWithBody<{code: string}>, res: Response<ErrorMessagesOutputModel>) => {
        const isConfirmed = await authService.confirmEmail(req.body.code)
        if(!isConfirmed) {
            res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .send({errorsMessages: [{
                    message: 'The confirmation code is incorrect, expired or already been applied',
                    field: 'code'
                }]})
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-email-resending', 
    emailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<{email: string}>, res: Response<ErrorMessagesOutputModel>) => {
        const result = await authService.resendConfirmationCode(req.body.email)
        if(!result) {
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.get('/me', 
    authMiddleware,
    (req: Request, res: Response<MeOutputModel>) => {
        const user: UserDBModel = req.user!
        res.send({
            email: user.email,
            login: user.login,
            userId: user.id
        })
})