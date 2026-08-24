async function init() {
  const res = await fetch("links.json");
  const data = await res.json();

  // プロフィール部分
  document.getElementById("avatar").src = data.avatar || "avatar.jpg";
  document.getElementById("title").textContent = data.title || "";
  document.getElementById("bio").textContent = data.bio || "";

  // ドメイン → Simple Icons スラッグ
  const BRAND_ICONS = {
    "instagram.com": "instagram",
    "x.com": "x",
    "twitter.com": "x",
    "threads.com": "threads",
    "threads.net": "threads",
    "note.com": "note",
    "suno.com": "suno",
  };

  // リンクボタン生成
  const container = document.getElementById("links");
  data.links.forEach(({ label, url, emoji }) => {
    const a = document.createElement("a");
    a.href = url;
    a.className = "link-btn";
    a.target = "_blank";
    a.rel = "noopener";

    const host = new URL(url).hostname.replace(/^www\./, "");
    const slug = BRAND_ICONS[host];
    if (slug) {
      const icon = document.createElement("span");
      icon.className = "icon";
      icon.style.setProperty("--icon", `url("icons/${slug}.svg")`);
      a.appendChild(icon);
    } else if (emoji) {
      const icon = document.createElement("span");
      icon.className = "icon-emoji";
      icon.textContent = emoji;
      a.appendChild(icon);
    }

    const text = document.createElement("span");
    text.className = "label";
    text.textContent = label;
    a.appendChild(text);

    container.appendChild(a);
  });

  // フッターの年
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);
