import express from "express";
import { PrismaClient } from "@prisma/client";
import { Encoding } from "./utils/bcryp";
import { JWT } from "./utils/jwt";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8080;

app.post("/register", async (req, res) => {
    let data: any = req.body;
    if (!data)
        res.json({
            message: "false",
        });
    const isExist = await prisma.member.findUnique({
        where: {
            nickName: data?.nickName,
        },
    });

    if (isExist) {
        return res.status(400).json({
            status: false,
            message: "Nickname is exist",
        });
    }
    const encoder = new Encoding();
    const hash = await encoder.hashPassword(data?.password);

    data.password = hash.hash;
    data.salt = hash.salt;
    data.hash = hash.hash;

    let item: any = await prisma.member.create({
        data,
    });

    if (item) {
        delete item?.password;
        delete item?.accessToken;
        delete item?.salt;
        delete item?.hash;
        const jwt = new JWT();
        const accessToken = await jwt.signToken({
            ...item,
            partnerId: "savina",
        });
        if (!accessToken) return { message: "Access token generate error" };
        return res.status(200).json({
            status: true,
            message: "Success",
            data: {
                accessToken,
            },
        });
    }

    return res.status(500).json({
        status: false,
        message: "Something went wrong",
    });
});
app.post("/login", async (req, res) => {
    let data: any = req.body;

    const isUser: any = await prisma.member.findUnique({
        where: {
            nickName: data?.nickName,
        },
    });

    if (!isUser) {
        return res.status(400).json({
            status: false,
            message: "Nickname is not exist",
        });
    }
    const encoder = new Encoding();
    const isMatch = await encoder.comparePassword(
        data?.password,
        isUser?.salt,
        isUser?.hash
    );
    if (!isMatch)
        return res.status(500).json({
            status: false,
            message: "Invalid credentials",
        });

    delete isUser?.password;
    delete isUser?.accessToken;
    delete isUser?.salt;
    delete isUser?.hash;
    const jwt = new JWT();
    let temp = {
        ...isUser,
        memberId: "" + isUser.memberId,
        memberType: "" + isUser.memberType,
        age: "" + isUser.age,
        partnerId: "savina",
    };
    console.log(`🚀temp----->`, temp);
    const accessToken = await jwt.signToken(temp);
    if (!accessToken) return { message: "Access token generate error" };
    return res.status(200).json({
        status: true,
        message: "Success",
        data: {
            accessToken,
        },
    });
});
app.get("/sauce-live", async (req, res) => {
    let clipResult = await fetch(
        "https://stage.api.sauceFlex.com/V1/front/broadcast?partnerId=savina"
    );

    let data: any = await clipResult.json();
    if (data?.code == "SU0000")
        return res.json({
            message: "success",
            data:
                data?.response?.items?.length > 0
                    ? data?.response?.items[0]
                    : "",
        });

    return res.json({ message: "failure" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
