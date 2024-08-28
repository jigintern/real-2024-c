function addNewContent(content, zIndex) {
    const container = document.getElementById('river');
    const newContentElement = document.createElement('div');
    newContentElement.classList.add("feed-item");
    newContentElement.classList.add(zIndex);
    newContentElement.innerHTML = content;
    newContentElement.style.zIndex = zIndex;

    container.appendChild(newContentElement); // 末尾に div 追加

    // 初期位置の設定
    gsap.set(newContentElement, { top: '4%', scale: 0.3, left: '25%' });

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

            // フォントサイズとマージンの調整
            const title = newContentElement.querySelector('.title');
            const description = newContentElement.querySelector('.description');
            const stats = newContentElement.querySelector('.stats');

            // フォントサイズの調整
            title.style.fontSize = `${currentWidth * 0.1}px `;
            description.style.fontSize = `${currentWidth * 0.05}px`;
            stats.style.fontSize = `${currentWidth * 0.05}px`;

            // マージンの調整
            const marginSize = currentWidth * 0.02; // コンテンツ幅の2%をマージンに設定
            title.style.marginBottom = `${marginSize}px`;
            description.style.margin = `${marginSize}px 0`;
            stats.style.marginTop = `${marginSize * 2}px`; // statsは少し大きめのマージンを設定
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
}

let zIndex = 999;
// 3秒ごとに新しいコンテンツを追加
setInterval(() => {
    const randomContent = `
    <div class="article">
        <h1 class="title">記事のタイトル</h1>
        <p class="description">ここに記事の内容が表示されます</br>記事の内容が2行程度で表示されます。</p>
        <div class="stats">
            <span class="likes">いいね数: 123</span>
            <span class="views">閲覧数: 456</span>
        </div>
    </div>
    `;
    addNewContent(randomContent, zIndex);
    zIndex -= 1;
}, 3000);
