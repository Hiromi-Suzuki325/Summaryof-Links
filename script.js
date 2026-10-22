async function init() {
  const res = await fetch("links.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`links.json の取得に失敗: HTTP ${res.status}`);
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

  const slugFor = (url) => {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return BRAND_ICONS[host];
  };

  const makeIcon = (slug) => {
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.style.setProperty("--icon", `url("icons/${slug}.svg")`);
    return icon;
  };

  // アイコンだけで通じるリンク（bio下の丸アイコン行）
  const iconRow = document.getElementById("icon-links");
  (data.iconLinks || []).forEach(({ label, url }) => {
    const a = document.createElement("a");
    a.href = url;
    a.className = "icon-link";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", label);
    a.title = label;
    const slug = slugFor(url);
    if (slug) a.appendChild(makeIcon(slug));
    else a.textContent = label;
    iconRow.appendChild(a);
  });

  // ラベル付きボタン（split指定なら1カード内に複数リンク）
  const container = document.getElementById("links");
  (data.links || []).forEach(({ label, url, emoji, split }) => {
    if (split) {
      // 1件だけの split は設定ミスとして止める
      if (split.length < 2) {
        throw new Error(`"${label}" の split には2件以上のリンクが必要です`);
      }
      const card = document.createElement("div");
      card.className = "link-btn split";
      const slug = slugFor(split[0].url);
      let medallion = null;
      if (slug) {
        medallion = document.createElement("span");
        medallion.className = "icon-medallion";
        medallion.appendChild(makeIcon(slug));
      }
      split.forEach(({ label: segLabel, url: segUrl }) => {
        const a = document.createElement("a");
        a.href = segUrl;
        a.className = "split-seg";
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", `${label} (${segLabel})`);
        a.textContent = segLabel;
        card.appendChild(a);
      });
      if (medallion) card.appendChild(medallion);
      container.appendChild(card);
      return;
    }

    const a = document.createElement("a");
    a.href = url;
    a.className = "link-btn";
    a.target = "_blank";
    a.rel = "noopener";
    const slug = slugFor(url);
    if (slug) {
      a.appendChild(makeIcon(slug));
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

// 読み込みや描画に失敗したら、空の画面ではなく失敗したことを表示する
function showLoadError() {
  const message = document.createElement("p");
  message.className = "load-error";
  message.setAttribute("role", "alert");
  message.textContent =
    "リンクを読み込めませんでした。時間をおいて再読み込みしてください。";
  document.getElementById("links").replaceChildren(message);
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    showLoadError();
    throw error;
  });
});
