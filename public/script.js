// 記事一覧
let articles = [];

// 記事の生成
const genArticle = () => {
    const article = articles.pop();

    // サイトごとの情報
    const siteInfo = {
      qiita: { from: 'Qiita', icon: './images/qiita.png'},
      zenn: { from: 'Zenn', icon: './images/zenn.png'},
      issou: { from: '一日一創', icon: './images/fukuno-ichigojam-glass.jpg'}
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

    const title = article.title;
    const updatedAt = article.updated_at;
    const url = article.url;
    const description = article.description;
    const likes = article.likes_count === undefined ? 0 : article.likes_count;
    const comments = article.comments_count === undefined ? 0: article.comments_count;
    const username = article.username;

    // 返ってくる日付を変換 2024-04-03 -> 2024/04/03
    const date = updatedAt.substring(0,10).replace(/-/g, '/');
    // 説明文から \n を削除し、それを説明欄に記載
    const summary = removeSyntax(description).substring(0, 75);
    // サイトごとの処理
    const siteType = getSiteType(url);
    const { from, icon } = siteInfo[siteType] || { icon: 'Unknown', icon: '' };

    card = `<div class="article">
          <div class="top">
            <div class="title">${title}</div>
            <div class="description"><span id="upload-at">${date}</span> - ${summary}&nbsp;...</div>
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
            `;
    return card;
};

function addNewContent(content, zIndex) {
    const container = document.getElementById('feed-container');
    const newContentElement = document.createElement('div');
    newContentElement.classList.add("feed-item");
    newContentElement.classList.add(zIndex);
    newContentElement.innerHTML = content;
    newContentElement.style.zIndex = zIndex;

    container.appendChild(newContentElement); // 末尾に div 追加

    // 初期位置の設定
    gsap.set(newContentElement, {
        scale: 0.3,
        top: '4%',
        left: '25%',
    });

    // アニメーションを開始
    gsap.to(newContentElement, {
        duration: 10, /* アニメーションの速度を10秒に設定 */
        motionPath: {
            path: [
                { x: `0%`, y: '0%' },
                { x: `${Math.random() * 100 - 50}%`, y: '3%' },
                { x: `${Math.random() * 200 - 100}%`, y: '20%' },
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

            // // フォントサイズとマージンの調整
            // const title = newContentElement.querySelector('.title');
            // const description = newContentElement.querySelector('.description');
            // const counts = newContentElement.querySelector('.counts');
            // const countts_icon = newContentElement.querySelector('i');
            // const icon = newContentElement.querySelector('.icon');

            // // フォントサイズの調整
            // title.style.fontSize = `${currentWidth * 0.1}px `;
            // description.style.fontSize = `${currentWidth * 0.05}px`;
            // counts.style.fontSize = `${currentWidth * 0.05}px`;
            // countts_icon.style.fontSize = `${currentWidth * 0.05}px`;
            
            // // widthの調整
            // countts_icon.style.width = `${currentWidth * .03}px`;
            // icon.style.width = `${currentWidth * 0.05}px`;

            // // マージンの調整
            // const marginSize = currentWidth * 0.02; // コンテンツ幅の2%をマージンに設定
            // title.style.marginBottom = `${marginSize}px`;
            // description.style.margin = `${marginSize}px 0`;
            // counts.style.marginTop = `${marginSize * 2}px`;
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

globalThis.onload = async () => {
    const response = await fetch("/article?qiita=true&zenn=true&issou=true");
    const resJson = await response.json();
    articles = [...resJson.Qiita, ...resJson.Zenn, ...resJson.Issou];
    // ! 記事をシャッフル !
    addNewContent(genArticle(), 999);
};

let zIndex = 998;
// 3秒ごとに新しいコンテンツを追加
setInterval(() => {
    addNewContent(genArticle(), zIndex);
    zIndex -= 1;
}, 3000);
