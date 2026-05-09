const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../module/User/user.model");
const Admin = require("../module/Admin/admin.model");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        let user = await User.findById(decoded.id);

        // If not found in User collection, check Admin collection
        if (!user) {
            user = await Admin.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ message: "User not found or token invalid" });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
