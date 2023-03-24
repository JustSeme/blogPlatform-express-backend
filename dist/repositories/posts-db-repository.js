"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsRepository = void 0;
const db_1 = require("./db");
const injectable_1 = require("inversify/lib/annotation/injectable");
let PostsRepository = class PostsRepository {
    deletePosts(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield db_1.PostsModel.deleteOne({ id: id });
            return result.deletedCount === 1;
        });
    }
    createPost(createdPost) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.PostsModel.create(createdPost);
        });
    }
    updatePost(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.PostsModel.updateOne({ id: id }, { $set: { content: body.content, title: body.title, shortDescription: body.shortDescription, blogId: body.blogId } });
            return result.matchedCount === 1;
        });
    }
    getPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.PostsModel.findOne({ id: postId });
        });
    }
    createLike(likeData, likedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            likedPost.extendedLikesInfo.likes.push(likeData);
            yield likedPost.save();
            return true;
        });
    }
    createDislike(likeData, dislikedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            dislikedPost.extendedLikesInfo.dislikes.push(likeData);
            yield dislikedPost.save();
            return true;
        });
    }
    setNone(editablePost, likeIndex, dislikeIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (likeIndex > -1) {
                const noneData = Object.assign({}, editablePost.extendedLikesInfo.likes[likeIndex]);
                delete editablePost.extendedLikesInfo.likes[likeIndex];
                editablePost.extendedLikesInfo.noneEntities.push(noneData);
            }
            if (dislikeIndex > -1) {
                const noneData = Object.assign({}, editablePost.extendedLikesInfo.dislikes[dislikeIndex]);
                delete editablePost.extendedLikesInfo.dislikes[dislikeIndex];
                editablePost.extendedLikesInfo.noneEntities.push(noneData);
            }
            yield editablePost.save();
            return true;
        });
    }
    updateToLike(updatablePost, dislikeIndex, noneIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (noneIndex > -1) {
                const likeData = Object.assign({}, updatablePost.extendedLikesInfo.noneEntities[noneIndex]);
                delete updatablePost.extendedLikesInfo.noneEntities[noneIndex];
                updatablePost.extendedLikesInfo.likes.push(likeData);
            }
            if (dislikeIndex > -1) {
                const likeData = Object.assign({}, updatablePost.extendedLikesInfo.dislikes[dislikeIndex]);
                delete updatablePost.extendedLikesInfo.dislikes[dislikeIndex];
                updatablePost.extendedLikesInfo.likes.push(likeData);
            }
            yield updatablePost.save();
            return true;
        });
    }
    updateToDislike(updatablePost, likeIndex, noneIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (noneIndex > -1) {
                const likeData = Object.assign({}, updatablePost.extendedLikesInfo.noneEntities[noneIndex]);
                delete updatablePost.extendedLikesInfo.noneEntities[noneIndex];
                updatablePost.extendedLikesInfo.likes.push(likeData);
            }
            if (likeIndex > -1) {
                const likeData = Object.assign({}, updatablePost.extendedLikesInfo.dislikes[likeIndex]);
                delete updatablePost.extendedLikesInfo.dislikes[likeIndex];
                updatablePost.extendedLikesInfo.likes.push(likeData);
            }
            yield updatablePost.save();
            return true;
        });
    }
};
PostsRepository = __decorate([
    (0, injectable_1.injectable)()
], PostsRepository);
exports.PostsRepository = PostsRepository;
//# sourceMappingURL=posts-db-repository.js.map