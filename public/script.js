// 記事一覧
let articles = [];

// 分流作成モード (false: 通常, true: 分流作成)
let createRiver = false;

// 分流用の記事のリスト
let riverArticles = [];

// 記事を60個取得
const getArticles = async (qiita, zenn, issou, str) => {
  console.log(str);
  const response = await fetch(`/article?qiita=${qiita}&zenn=${zenn}&issou=${issou}${(str !== "") ? `&q=${str}` : ""}`);
  const resJson = await response.json();
  const articlesAll = [...resJson.Qiita, ...resJson.Zenn, ...resJson.Issou];
  return articlesAll;
};

// 記事の生成
const getArticleHTMLElement = () => {
  const article = articles.pop();
  // 記事が空だったらなにもしない
  if (article === undefined) return;

  // サイトごとの情報
  const siteInfo = {
    qiita: { from: 'Qiita', icon: './images/qiita.png' },
    zenn: { from: 'Zenn', icon: './images/zenn.png' },
    issou: { from: '一日一創', icon: './images/fukuno-ichigojam-glass.jpg' }
  };

  // どのサイトから持ってきているか
  const getSiteType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('qiita.com')) return 'qiita';
    if (url.includes('zenn.dev')) return 'zenn';
    if (url.includes('fukuno.jig.jp')) return 'issou';
    return 'unknown';
  };

  // \nや#などの不必要な要素を削除
  const removeSyntax = (string) => {
    // const short = string.substring(0, 150);
    return string.replace(/\n{1,}/g, ' ').replace(/#{1,}/g, ' ');
  }

  const titleAll = article.title;
  const updatedAt = article.updated_at;
  const url = article.url;
  const description = article.description;
  const likes = article.likes_count === undefined ? 0 : article.likes_count;
  const comments = article.comments_count === undefined ? 0 : article.comments_count;
  const username = article.username;

    const title = titleAll.substring(0, 30);
    // 返ってくる日付を変換 2024-04-03 -> 2024/04/03
    const date = updatedAt.substring(0,10).replace(/-/g, '/');
    // 説明文から \n を削除し、それを説明欄に記載
    const summary = removeSyntax(description).substring(0, 40);
    // サイトごとの処理
    const siteType = getSiteType(url);
    const { from, icon } = siteInfo[siteType] || { from: 'Unknown', icon: '' };

    card = `<a href="${url}" target="_blank" class="article-link" ${createRiver ? 'style="pointer-events: none;"' : ''}>
                <div class="article">
                    <div class="top">
                        <div class="title">${title}&nbsp;...</div>
                        <div class="description"><span class="upload-at">${date}</span> - ${summary}&nbsp;...</div>
                    </div>
                    <div class="bottom">
                        <div class="info">
                            <div class="likes">
                                <i class='bx bxs-heart'></i>
                                <p class="counts">${likes}</p>
                            </div>
                            <div class="comments">
                                <i class='bx bxs-conversation'></i>
                                <p class="counts">${comments}</p>
                            </div>
                        </div>
                        <div class="icon"><img src="${icon}" alt="${from}のアイコン"></div>
                    </div>
                </div>
            </a>
            `;
  return card;
};

// 記事をリストに追加
const saveArticle = (element) => {
    const title = element.getElementsByClassName("title")[0]
    const updatedAt = element.getElementsByClassName("upload-at")[0];
    const url = (element.getElementsByClassName("article-link"))[0].getAttribute("href");
    const description = element.getElementsByClassName("description")[0];
    const likesCount = element.getElementsByClassName("counts")[0];
    const CommentsCount = element.getElementsByClassName("counts")[1];

    const riverArticle = {
        title: title.innerText,
        updated_at: updatedAt.innerText,
        url: url,
        description: description.innerText,
        likes_counts: Number(likesCount.innerText),
        comments_count: Number(CommentsCount.innerText)
    };

    // 同じ川に2つ以上の記事を流せないように
    if (riverArticles.filter((article) => article.title === riverArticle.title).length === 0) {
        riverArticles.push(riverArticle);
    }

    console.log(riverArticles);
};

// 作成した分流をサーバにへ
const riverId = async (riverName, riverArticles) => {
    const response = await fetch('/river', {
        method: 'POST',
        headers: {'Content-Type': 'application.json'},
        body: JSON.stringify({
            riverName: riverName,
            articles: riverArticles
        })
    });

    const uuid = await response.json();
    return `${location.origin}?riverId=${uuid.riverId}`;
};

function addNewContent(content, zIndex) {
  const container = document.getElementById('feed-container');
  const newContentElement = document.createElement('div');
  newContentElement.classList.add("feed-item");
  newContentElement.classList.add(zIndex);
  newContentElement.innerHTML = content;
  newContentElement.style.zIndex = zIndex;
  container.appendChild(newContentElement);

    newContentElement.onclick = (event) => {
        saveArticle(newContentElement);
    };  

    // 初期位置
    gsap.set(newContentElement, {
        scale: 0.3,
        top: '4%',
        left: '25%',
    });

  // アニメーションを開始
  gsap.to(newContentElement, {
    duration: 15, /* アニメーションの速度を10秒に設定 */
    motionPath: {
      path: [
        { x: `0%`, y: '0%' },
        { x: `${Math.random() * 100 - 50}%`, y: '3%' },
        { x: `${Math.random() * 1000 - 100}%`, y: '20%' },
        { x: `${Math.random() * 200 - 100}%`, y: '30%' },
        { x: `${Math.random() * 200 - 100}%`, y: '50%' },
      ],
      align: "self",
      relative: true,
    },
    top: '80%', // 下に流れるように
    scale: 2.5, // 最後に拡大
    ease: 'power2.in',
    onUpdate: () => {
      // 縦の長さを横の比率に合わせて調整
      const aspectRatio = 16 / 9;
      const currentWidth = newContentElement.offsetWidth;
      newContentElement.style.height = `${currentWidth / aspectRatio}px`;
    },
    onComplete: () => {
      // アニメーションが終了したら要素を削除
      container.removeChild(newContentElement);
    }
  });

  // 浮き沈みアニメーションを追加
  gsap.to(newContentElement, {
    duration: 1, // 浮き沈みのスピード
    y: "+=10", // 下に20px移動
    repeat: -1, // 無限に繰り返す
    yoyo: true, // 元の位置に戻る
    ease: "sine.inOut", // 浮き沈みをスムーズに
    rotation: Math.random() * 20 - 10,
  });
};

// 配列をシャッフル
const shuffleArray = (array) => {
  return array.slice().sort(() => Math.random() - Math.random());
}

// ページが読み込まれたとき
globalThis.onload = async () => {

  // ポップアップの要素を取得
  const popupBackground = document.getElementById('popup-background');
  const openPopupBtn = document.getElementById('openPopupBtn');
  const sendBtn = document.getElementById('sendBtn');
  const grandmaImage = document.querySelector('img.grandma');

  // ポップアップを開く
  openPopupBtn.addEventListener('click', () => {
    grandmaImage.src = './images/grandma_sit.png';
    const x = document.getElementById("popup-wrapper"); /*クラス名"popup-wrapper"のオブジェクトの配列を取得*/
    x.classList.remove("is-hidden");
  });

  // ポップアップを閉じる
  sendBtn.addEventListener('click', () => {
    const x = document.getElementById("popup-wrapper");
    x.classList.add("is-hidden");
    grandmaImage.src = './images/grandma_wash.png';
    articles.splice(1)
  });
    popupBackground.addEventListener('click', () => {
    const x = document.getElementById("popup-wrapper");
    x.classList.add("is-hidden");
    grandmaImage.src = './images/grandma_wash.png';
    });
    
    // 記事のシャッフル
    articles = shuffleArray(await getArticles(1, 1, 1, ""));
    const card = getArticleHTMLElement();
    if (card !== undefined) {
        addNewContent(card, 999);
    }
    
    // 分流作成に必要な要素
    const changeModeBtn = document.getElementById('create-river-btn');
    const chooseOkBtn = document.getElementById('create-river-ok');
    const submitName = document.getElementById('create-river-name');
    const createDone = document.getElementById('create-river-done');
    const createCancel = document.getElementById('create-river-cancel');

    // モードの切り替え
    changeModeBtn.addEventListener('click', () => {
        // 川の作成モード
        if (createRiver === false) {
            console.log("Mode: Choose");
            createRiver = true;
            
            const articleLinks = document.querySelectorAll(".article-link");
            for (const articleLink of articleLinks) {
                articleLink.style.pointerEvents = "none";
            }
            
            const feedItems = document.querySelectorAll(".feed-item");
            for (const feedItem of feedItems) {
                feedItem.addEventListener('click', () => {
                    // リストに保存しておく
                    saveArticle(feedItem);
                })
            }

            // リストの確定
            chooseOkBtn.style.visibility = 'visible';
            chooseOkBtn.addEventListener('click', async () => {
                createRiver = false;
                const url = await riverId("", riverArticles);
                prompt("共有URL", url);
            })


            // キャンセル
            createCancel.style.visibility = 'visible';
            createCancel.addEventListener('click', () => {
                createRiver = false;
                articleLinks = [];
            })
            
        // 通常モード
        } else {
            console.log("Mode: See");
            createRiver = false;

            const articleLinks = document.querySelectorAll(".article-link");
            for (const articleLink of articleLinks) {
                articleLink.style.pointerEvents = "auto";
            }
        }
    });
};

let zIndex = 998;
// 7秒ごとに新しいコンテンツを追加
setInterval(async () => {
  const card = getArticleHTMLElement();
  if (card !== undefined) {
    addNewContent(card, zIndex);
  }
  zIndex -= 1;

  // 記事が無くなった場合の再アクセス
  if (articles.length <= 5) {
    const searchInputValue = document.getElementById('searchInput').value;
    const qiitaIcon = document.getElementById('qiita-icon').checked;
    const zennIcon = document.getElementById('zenn-icon').checked;
    const issouIcon = document.getElementById('issou-icon').checked;

    const qiita = (qiitaIcon == true) ? 1 : 0;
    const zenn = (zennIcon == true) ? 1 : 0;
    const issou = (issouIcon == true) ? 1 : 0;

    articles.unshift(...shuffleArray(await getArticles(qiita, zenn, issou, searchInputValue)));
  }
}, 7000);
