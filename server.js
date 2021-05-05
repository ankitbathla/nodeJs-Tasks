const Koa = require("koa");
const json = require("koa-json");
const KoaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const render = require("koa-ejs");
const path = require("path");
const serve = require("koa-static");
const app = new Koa();
const router = new KoaRouter();
app.use(json());
app.use(bodyParser());

app.use(serve("."));
app.use(serve(path.join(__dirname, "/public")));
render(app, {
    root: path.join(__dirname, "views"),
    layout: "layout",
});

app.use(router.routes()).use(router.allowedMethods());

let list = [];

router.get("/", (ctx) => {
    ctx.body = { msg: "Hello world" };
});

router.get("/error", async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.body = {
            error: {
                message: "internal server error",
                status: 500,
            },
        };
    }
});

app.use(async (ctx) => {
    ctx.throw();
});

router.get("/hello", (ctx) => {
    ctx.body = "world";
});
router.get("/echo", (ctx) => {
    ctx.body = `${ctx.request.query.person}`;
});
router.get("/echo/:name", (ctx) => {
    ctx.body = `hi ${ctx.request.params.name}`;
});
router.get("/list", async (ctx) => {
    await ctx.render("todoApp", {
        list: list,
    });
});

router.post("/list", async (ctx) => {
    const item = ctx.request.body.new;
    const id = list.length + 1;
    const todoItem = {
        name: item,
        id: id,
    };
    if (item !== "") {
        list.push(todoItem);
    }
    ctx.redirect("/list");
});
router.get("/list/delete", async (ctx) => {
    const id = ctx.request.query.id;
    list = list.filter((item) => parseInt(item.id) !== parseInt(id));
    ctx.redirect("/list");
});
app.listen(3001, () => {
    console.log("Server started");
});
