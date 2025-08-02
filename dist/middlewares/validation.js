"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_1 = require("../utils/response");
const validate = (schema) => {
    return (req, res, next) => {
        var _a, _b;
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            const errorMessage = ((_b = (_a = error.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation failed";
            return (0, response_1.sendError)(res, 400, errorMessage);
        }
    };
};
exports.validate = validate;
