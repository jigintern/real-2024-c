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
    const { from, icon } = siteInfo[siteType] || { from: 'Unknown', icon: '' };

    card = `<div class="card">
          <div class="top">
            <div class="title">${title}</div>
            <div class="description"><span id="upload-at">${date}</span> - ${summary}&nbsp;...</div>
          </div>
          <div class="bottom">
            <div class="info">
              <div class="likes">
                <i class='bx bxs-heart'></i>
                <p>${likes}</p>
              </div>
              <div class="comments">
                <i class='bx bxs-conversation'></i>
                <p>${comments}</p>
              </div>
            </div>
            <div class="icon"><img src="${icon}" alt="${from}のアイコン"></div>
          </div>
         </div>
            `;
    return card;
};

async function addContent(content, zIndex) {
    const river = document.querySelector('.river');
    // contentの内容をhtmlに挿入した後、.cardから取得
    await river.insertAdjacentHTML('beforeend', content);
    const card = document.querySelectorAll('.river .card:last-child')[0];

    card.style.zIndex = zIndex;
    card.style.position = 'fixed';
    card.style.top = '-20%';
    card.style.left = '50%';
    card.style.transform = 'translate(-50%, 0)';
    river.appendChild(card);

    const baseWidth = window.innerWidth * .8;
    const aspect = 16 /9;

    gsap.set(card, {
        width: baseWidth,
        height: baseWidth / aspect,
        scale: 0.3,
        y: 0,
    });

    gsap.to(card, {
        duration: 8,
        scale: 1,
        y: window.innerHeight * .8,
        ease: 'power2.out',
        onUpdate: () => {
            // カード内の要素をどのように変化させるか
            const currentWidth = card.offsetWidth;

            const title = card.querySelector('.title');
            const description = card.querySelector('.description');
            const info = card.querySelector('.bottom');

            title.style.fontSize = `${currentWidth * .05}px`;
            description.style.fontSize = `${currentWidth * .035}px`;
            info.style.fontSize = `${currentWidth * .035}px`;

            const margin = currentWidth * .02;
            title.style.marginBottom = `${margin}px`;
            description.style.margin = `${margin}px 0`;
            info.style.marginBottom = `${margin * 2}px`;
        },
        onComplete: () => {
            // gsap.to(card, {
            //     duration: 3,
            //     y: window.innerHeight * 1.25,
            //     ease: 'power1.in',
            //     onComplete: () => {
            //         // river.removeChild(card);
            //     }
            // })
        }
    })
};

globalThis.onload = async () => {
    const response = await fetch("/article?qiita=true&zenn=true&issou=true");
    const resJson = await response.json();
    articles = [...resJson.Qiita, ...resJson.Zenn, ...resJson.Issou];
    addContent(genArticle(), 0);
};

let zIndex = 1;
setInterval(() => {
    addContent(genArticle(), zIndex);
    zIndex += 1;
}, 5000);