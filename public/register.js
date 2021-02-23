// 获取账号密码
let $form = $("#registerForm");
$form.on("submit", (e) => {
  e.preventDefault();
  let userName = $form.find("input[name=userName]").val();
  let pwd = $form.find("input[name=pwd]").val();
  $.ajax({
    url: "/register",
    method: "POST",
    contentType: "text/json; charset=UTF-8",
    data: JSON.stringify({ userName, pwd }),
  }).then(
    () => {
      alert("注册成功！");
      location.href = "/sign_in.html";
    },
    () => {
      alert("注册失败！");
    }
  );
});
