import { v4 as uuidv4 } from "uuid"
import { LikeObjectType } from "../comments/CommentDBModel"

//data transfer object
export class PostDBModel {
    public id: string
    public createdAt: string
    public extendedLikesInfo: ExtendedLikesInfoType

    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string
    ) {
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()

        this.extendedLikesInfo = {
            likes: [],
            dislikes: [],
            noneEntities: []
        }
    }
}

export type PostsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: PostDBModel[]
}

type ExtendedLikesInfoType = {
    likes: LikeObjectType[],
    dislikes: LikeObjectType[],
    noneEntities: LikeObjectType[]
}