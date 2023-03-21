import { JwtService } from "../application/jwtService";
import { CommentDBModel, LikeObjectType } from "../models/comments/CommentDBModel";
import { CommentsWithQueryOutputModel, CommentViewModel } from "../models/comments/CommentViewModel";
import { LikeType } from "../models/comments/LikeInputModel";
import { ReadCommentsQueryParams } from "../models/comments/ReadCommentsQuery";
import { UserDBModel } from "../models/users/UserDBModel";
import { CommentsRepository } from "../repositories/comments-db-repository";
import { injectable } from 'inversify/lib/annotation/injectable';

@injectable()
export class CommentsService {
    constructor(protected jwtService: JwtService, protected commentsRepository: CommentsRepository) { }

    async createComment(content: string, commentator: UserDBModel | null, postId: string) {
        if (!commentator) {
            return null
        }

        const createdComment = new CommentDBModel(content, postId, commentator.id, commentator.login)

        await this.commentsRepository.createComment(createdComment)

        return {
            id: createdComment.id,
            content: createdComment.content,
            commentatorInfo: { ...createdComment.commentatorInfo },
            createdAt: createdComment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None' as LikeType
            }
        }
    }

    async deleteComment(commentId: string) {
        return await this.commentsRepository.deleteComment(commentId)
    }

    async updateComment(commentId: string, content: string) {
        return this.commentsRepository.updateComment(commentId, content)
    }

    async updateLike(accessToken: string, commentId: string, status: LikeType) {
        const updatingComment = await this.commentsRepository.getCommentById(commentId)
        if (!updatingComment) {
            return false
        }

        const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
        if (!jwtResult) return false

        const userId = jwtResult.userId

        const likeData: LikeObjectType = {
            userId,
            createdAt: new Date().toISOString()
        }

        const isNoneSetted = await this.commentsRepository.setNoneLike(userId, commentId)

        //Сделать апдейт лайка если сущность уже создана и создание если нет
        if (status === 'Like') {
            return this.commentsRepository.setLike(likeData, commentId)
        }

        if (status === 'Dislike') {
            return this.commentsRepository.setDislike(likeData, commentId)
        }
        return isNoneSetted
    }

    async getComments(queryParams: ReadCommentsQueryParams, postId: string, accessToken: string | null): Promise<CommentsWithQueryOutputModel> {
        const commentsDBQueryData = await this.commentsRepository.getComments(queryParams, postId)
        const commentsViewQueryData: CommentsWithQueryOutputModel = { ...commentsDBQueryData, items: [] }

        const displayedComments = await this.transformLikeInfo(commentsDBQueryData.items, accessToken)

        commentsViewQueryData.items = displayedComments
        return commentsViewQueryData
    }

    async getCommentById(commentId: string, accessToken: string | null) {
        const recivedComment = await this.commentsRepository.getCommentById(commentId)
        if (!recivedComment) {
            return false
        }

        const displayedComment: CommentViewModel[] = await this.transformLikeInfo([recivedComment], accessToken)
        return displayedComment[0]
    }

    async transformLikeInfo(commentsArray: CommentDBModel[], accessToken: string | null): Promise<CommentViewModel[]> {
        let userId: string | null = null
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            userId = jwtResult ? jwtResult.userId : null
        }

        const convertedComments = commentsArray.map((comment: CommentDBModel) => {
            const likesInfoData = comment.likesInfo

            let myStatus = 'None'

            // check that comment was liked current user
            if (likesInfoData.likes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that comment was disliked current user
            if (likesInfoData.dislikes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            const convertedComment: CommentViewModel = {
                id: comment.id,
                content: comment.content,
                commentatorInfo: { ...comment.commentatorInfo },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likes.length,
                    dislikesCount: comment.likesInfo.dislikes.length,
                    myStatus: 'None'
                }
            }

            return convertedComment
        })

        return convertedComments
    }
}