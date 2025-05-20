async function init() {
  const res = await fetch("links.json");
  const data = await res.json();

  // プロフィール部分
  document.getElementById("avatar").src = data.avatar || "avatar.jpg";
  document.getElementById("title").textContent = data.title || "";
  document.getElementById("bio").textContent = data.bio || "";

  // リンクボタン生成
  const container = document.getElementById("links");
  data.links.forEach(({ label, url, emoji }) => {
    const a = document.createElement("a");
    a.href = url;
    a.className = "link-btn";
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = `${emoji ? emoji + " " : ""}${label}`;
    container.appendChild(a);
  });

  // フッターの年
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);
