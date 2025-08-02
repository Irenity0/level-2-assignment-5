"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, message, data) => {
    const response = Object.assign({ success,
        message }, (data && { data }));
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendError = (res, statusCode, message, error) => {
    const response = Object.assign({ success: false, message }, (error && { error }));
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
