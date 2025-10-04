"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "don’t have access" });
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authorize = authorize;
