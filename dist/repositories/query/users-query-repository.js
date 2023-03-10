"use strict";
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
exports.usersQueryRepository = void 0;
const db_1 = require("../db");
exports.usersQueryRepository = {
    findUsers(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = null, searchEmailTerm = null } = queryParams;
            const filterArray = [];
            if (searchEmailTerm) {
                filterArray.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
            }
            if (searchLoginTerm) {
                filterArray.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
            }
            const filterObject = filterArray.length ? { $or: filterArray } : {};
            const totalCount = yield db_1.UsersViewModel.countDocuments(filterObject);
            const pagesCount = Math.ceil(totalCount / +pageSize);
            const skipCount = (+pageNumber - 1) * +pageSize;
            const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1;
            let resultedUsers = yield db_1.UsersViewModel.find(filterObject).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber });
            return {
                pagesCount: pagesCount,
                page: +pageNumber,
                pageSize: +pageSize,
                totalCount: totalCount,
                items: resultedUsers
            };
        });
    },
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersViewModel.findOne({ id: userId }, { _id: 0, __v: 0 });
        });
    },
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersModel.findOne({ email: email });
        });
    },
    findUserByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersModel.findOne({ login: login });
        });
    },
    findUserByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });
        });
    },
    findUserByConfirmationCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersModel.findOne({ 'emailConfirmation.confirmationCode': code });
        });
    },
    findUserByRecoveryPasswordCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.UsersModel.findOne({ 'passwordRecovery.confirmationCode': code });
        });
    },
};
//# sourceMappingURL=users-query-repository.js.map