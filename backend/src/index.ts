import express from "express";

const app = express();
const port = 8080;

app.get("/sauce-live", async (req, res) => {
    let url = `https://stage.api.sauceFlex.com/V1/authorize?partnerId=savina&id=savina&password=Hellovietnam01!&lifeTime=30`;
    let result = await fetch(url);
    let token = await result.json();
    // console.log(`🚀token----->`, token);

    let clipResult = await fetch(
        "https://stage.api.sauceFlex.com/V1/front/broadcast?partnerId=savina",
        {
            headers: {
                "X-SauceFlex-Authorize": token?.response?.accessToken,
            },
        }
    );

    let data = await clipResult.json();
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
