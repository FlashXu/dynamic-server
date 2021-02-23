// 获取账号密码
let $form = $("#signInForm");
$form.on("submit", (e) => {
  e.preventDefault();
  let userName = $form.find("input[name=userName]").val();
  let pwd = $form.find("input[name=pwd]").val();
  $.ajax({
    url: "/sign_in",
    method: "POST",
    contentType: "text/json; charset=UTF-8",
    data: JSON.stringify({ userName, pwd }),
  }).then(
    () => {
      alert("登录成功！");
      location.href = "/home.html";
    },
    () => {
      alert("登录失败！");
    }
  );
});
