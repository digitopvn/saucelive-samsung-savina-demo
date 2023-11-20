const jwt = require("jsonwebtoken");

export class JWT {
    constructor() {}
    public signToken(payload: string) {
        return jwt.sign({ payload }, Bun.env.JWT_SECRET, {
            expiresIn: Bun.env.JWT_AGE,
            algorithm: "RS256",
        });
    }

    public verifyToken(token: string) {
        try {
            return jwt.verify(token, Bun.env.JWT_SECRET);
        } catch (error: any) {
            return error.message;
        }
    }
}
