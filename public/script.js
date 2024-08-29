let articles;

// ページが読み込まれたとき
globalThis.onload = async () => {
    const response = await fetch("/article?qiita=true&zenn=true&issou=true");
    const resJson = await response.json();
    articles = [...resJson.Qiita, ...resJson.Zenn];
};


function addNewContent(content) {
    const container = document.getElementById('river');
    const newContentElement = document.createElement('div');
    newContentElement.innerHTML = content;

    container.appendChild(newContentElement); // 末尾に div 追加

    // 初期位置の設定
    gsap.set(newContentElement, { top: '-15%', scale: 0.6, width: '30%', left: '35%'});

    // アニメーションを開始
    gsap.to(newContentElement, {
        duration: 40, /* アニメーションの速度を30秒に設定 */
        top: '105%',
        scale: 1.5,
        width: '100%', /* 横の長さを100%に */
        left: '0%',
        ease: 'power2.in',
        onUpdate: function() {
            // 縦の長さを横の比率に合わせて調整
            const aspectRatio = 16 / 9;
            const currentWidth = newContentElement.offsetWidth;
            newContentElement.style.height = `${currentWidth / aspectRatio}px`;

            // フォントサイズとマージンの調整
            const title = newContentElement.querySelector('.title');
            const description = newContentElement.querySelector('.description');
            const bottom = newContentElement.querySelector('.bottom');

            // フォントサイズの調整
            title.style.fontSize = `${currentWidth * 0.1}px`;
            description.style.fontSize = `${currentWidth * 0.05}px`;
            bottom.style.fontSize = `${currentWidth * 0.05}px`;
        },
        onComplete: () => {
            // アニメーションが終了したら要素を削除
            container.removeChild(newContentElement);
        }
    });
}



// 5.5秒ごとに新しいコンテンツを追加
setInterval(() => {

    const river = document.querySelector(".river");
    const article = articles.pop();
    console.log(article)    

    const title = article.title;
    const uploadAt = article.updated_at;
    const url = article.item;
    const description = article.description;
    const likes = article.like_count;
    const comments = article.comments_count;
    const username = article.username;

    // 返ってくる日付を変換
    const date = uploadAt.substring(0,10).replace(/-/g, '/');

    // 説明文から \n を削除し、それを説明欄に記載
    const summary = (description?.substring(0, 50)).replace(/\n/g, '');

    // 返ってきたurlのドメインからどのサイトかを判定
    const qiitaPtn = /qiita.com/;
    const zennPtn = /zenn.dev/;

    let from;
    let icon;

    if (qiitaPtn.test(url)) { 
        // Qiita
        from = 'Qiita';
        icon = './images/qiita.png';
    } else if (zennPtn.test(url)) {
        // Zenn
        from = 'Zenn';
        icon = './images/zenn.png';
    }

    river.insertAdjacentHTML(
        'beforeend', 
        `<div class="card">
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
        </div>`
    );
    addNewContent(newContent);
}, 500);