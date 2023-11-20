import { randomBytes, pbkdf2, createHash } from "node:crypto";

export class Encoding {
    constructor() {}
    // Hash password
    public hashPassword(
        password: string
    ): Promise<{ hash: string; salt: string }> {
        const salt = randomBytes(16).toString("hex");
        return new Promise((resolve, reject) => {
            pbkdf2(password, salt, 1000, 64, "sha512", (error, derivedKey) => {
                if (error) {
                    return reject(error);
                }
                return resolve({ hash: derivedKey.toString("hex"), salt });
            });
        });
    }

    // Compare password
    public comparePassword(
        password: string,
        salt: string,
        hash: string
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            pbkdf2(password, salt, 1000, 64, "sha512", (error, derivedKey) => {
                if (error) {
                    return reject(error);
                }
                return resolve(hash === derivedKey.toString("hex"));
            });
        });
    }
}
