const { oauth2Client } = require("../config/googleConfig");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const UserModel = require("../models/User");

exports.googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );

        const { email, name, picture } = userRes.data;

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({ name, email, image: picture });
        }

        const { _id } = user;
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TIMEOUT }
        );

        // ✅ set cookie named "token"
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in prod
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.verifyToken = (req, res) => {
    const token = req.cookies.token; // read token from cookie
    console.log(token);
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    res.json({ message: "Logged out" });
};
