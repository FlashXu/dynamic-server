/* 引入http server相关的包 */
var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2]; // 第2个参数指定为端口号

/* 要求用户输入端口号 */
if (!port) {
  console.log("Please describe the port number: node server.js 8888");
  process.exit(1);
}

/* 配置服务器响应机制 */
var server = http.createServer(function (request, response) {
  /* 解析request路径 */
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname; // 默认首页
  var query = parsedUrl.query;
  var method = request.method;
  console.log("Query path is" + pathWithQuery);

  if (path === "/register") {
    // 处理POST请求
    // 1. data事件为数据上传事件，需要上传的data chunk一点点塞入Buffer数组中
    let array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    // 2. end事件为数据上传结束事件，需要将Buffer数组转换为正确的字符串
    request.on("end", () => {
      const userInfo = JSON.parse(Buffer.concat(array).toString());
      let userList = JSON.parse(fs.readFileSync("./db/users.json").toString());
      const lastUser = userList[userList.length - 1];
      const id = lastUser ? lastUser.id + 1 : 1;
      userList.push({ id: id, name: userInfo.userName, pwd: userInfo.pwd });
      fs.writeFileSync("./db/users.json", JSON.stringify(userList));
    });
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    response.write("Register success!");
    response.end();
  } else if (path === "/sign_in") {
    let array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      const userInfo = JSON.parse(Buffer.concat(array).toString());
      let userList = JSON.parse(fs.readFileSync("./db/users.json").toString());
      let validUser = userList.find(
        (user) => user.name === userInfo.userName && user.pwd === userInfo.pwd
      );
      if (validUser) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html;charset=utf-8");
        response.setHeader(
          "Set-Cookie",
          `userName=${userInfo.userName}; HttpOnly`
        );
        response.write("Sign in success!");
      } else {
        response.statusCode = 401;
        response.setHeader("Content-Type", "text/json;charset=utf-8");
        response.write("Wrong user name or password!");
      }
      response.end();
    });
  } else if (path === "/home.html") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    let htmlStr = fs.readFileSync("./public/home.html").toString();
    const cookie = request.headers["cookie"];
    let userName;
    try {
      userName = cookie
        .split("; ")
        .filter((item) => item.indexOf("userName") !== -1)[0]
        .split("=")[1];
    } catch (e) {}
    if (userName) {
      htmlStr = htmlStr.replace(
        '<a href="sign_in.html">Sign In</a>',
        `<p>Welcome, user ${userName}!</p>
        <a href="/logOut">Log Out</a>`
      );
    }
    response.write(htmlStr);
    response.end();
  } else if (path === "/logOut") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    let htmlStr = fs.readFileSync("./public/home.html").toString();
    response.setHeader(
      "Set-Cookie",
      `${request.headers["cookie"]}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    );
    response.write(htmlStr);
    response.end();
  } else {
    response.statusCode = 200;
    try {
      const file = fs.readFileSync(`./public${path}`);
      const fileList = {
        html: "html",
        css: "css",
        js: "javascript",
        png: "png",
        jpg: "jpeg",
      };
      let fileType = path.substr(path.indexOf(".") + 1);
      response.setHeader(
        "Content-Type",
        `text/${fileList[fileType] || "html"};charset=utf-8`
      );
      response.write(file);
    } catch (error) {
      response.statusCode = 404;
      response.write(`request path: ${path}, 您访问的页面不存在\n`);
    }
    response.end();
  }
});

server.listen(port); // 开始监听指定端口
console.log(
  "Now the server is listening to port " +
    port +
    "  please open with the url: http://localhost:" +
    port
);
