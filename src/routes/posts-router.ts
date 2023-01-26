import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { HTTP_STATUSES } from "../app";
import { ErrorMessagesOutputModel } from "../models/ErrorMessagesOutputModel";
import { PostInputModel } from "../models/posts/PostInputModel";
import { PostViewModel } from "../models/posts/PostViewModel";
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../types";
import { inputValidationMiddleware } from "../middlewares/input-validation-middleware";
import { basicAuthorizationMiddleware } from "../middlewares/basic-authorizatoin-middleware";
import { blogsService } from "../domain/blogs-service";
import { postsService } from "../domain/posts-service";

export const postsRouter = Router({})

const titleValidation = body('title')
.exists()
.trim()
.notEmpty()
.isString()
.isLength({ min: 1, max: 30})

const shortDescriptionValidation = body('shortDescription')
.exists()
.trim()
.notEmpty()
.isLength({ min: 1, max: 100 })

const contentValidation = body('content')
.exists()
.trim()
.notEmpty()
.isString()
.isLength({ min: 1, max: 1000 })

const blogIdValidation = body('blogId')
.exists()
.trim()
.notEmpty()
.isString()
.custom(async (value) => {
    const findedBlog = await blogsService.findBlogs(value)
    if(!findedBlog) {
        return Promise.reject('blog by blogId not found')
    }
    return true
})
.isLength({ min: 1, max: 100 })

postsRouter.get('/', async (req: Request, res: Response<PostViewModel[]>) => {
    const findedBlog = await postsService.findPosts(null)

    if(!findedBlog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.json(findedBlog as PostViewModel[])
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response<PostViewModel>) => {
    const findedBlog = await postsService.findPosts(req.params.id)

    if(!findedBlog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.json(findedBlog as PostViewModel)
})

postsRouter.post('/',
    basicAuthorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<PostInputModel>, res: Response<PostViewModel | ErrorMessagesOutputModel>) => {
        const createdPost = await postsService.createPost(req.body)

        res
            .status(HTTP_STATUSES.CREATED_201)
            .send(createdPost)
})

postsRouter.put('/:id',
    basicAuthorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response<PostViewModel | ErrorMessagesOutputModel>) => {
        const isUpdated = await postsService.updatePost(req.params.id, req.body)
        if(!isUpdated) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

postsRouter.delete('/:id', 
    basicAuthorizationMiddleware,
    async (req: RequestWithParams<{ id: string }>, res: Response<ErrorMessagesOutputModel>) => {
    const isDeleted = await postsService.deletePosts(req.params.id)
    if(isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    }

    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})