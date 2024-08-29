import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
//スクレイピング用のライブラリ
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

//表示するページを変更するための変数
let page = 0;
const zennPageCount = 20;
const issouPageCount = 20;
let flag = true;

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //データベースにアクセス
  const kv = await Deno.openKv(Deno.env.get("DENOKV_URL"));

  //クエリパラメータを取得
  const param = new URL(req.url).searchParams;
  const qiita = param.get("qiita") === "0" ? false : true;
  const zenn = param.get("zenn") === "0" ? false : true;
  const issou = param.get("issou") === "0" ? false : true;
  const keyWord = param.get("q") || "";
  const riverId = param.get("riverId");

  //レスポンス用のJSON変数
  let obj = { "Qiita": [], "Zenn": [], "Issou": [] };
  let zennObj = [];
  let qiitaObj = [];
  let issouObj = [];

  if (req.method === "POST" && pathname === "/river") {
    console.log("POST");
    // リクエストのペイロードを取得
    const requestJson = await req.json();

    const riverName = requestJson.riverName;
    const articles = requestJson.articles;

    //ハッシュ値生成
    const uuid = self.crypto.randomUUID();
    const key = ["river", uuid];
    const value = {
      "riverName": riverName,
      "articles": articles,
    };

    const result = await kv.set(key, value);
    console.log(result);

    return Response.json({
      status: 200,
      riverId: uuid,
    });
  }

  if (req.method === "GET" && pathname === "/river") {
    console.log("GET");
    if (!riverId) {
      return Response.redirect("https://gijudon.deno.dev/", 302);
    }

    const getResult = await kv.get(["river", riverId]);

    //console.log(getResult);
    const requestValue = getResult.value;
    return Response.json({
      requestValue,
    });
  }
  if (req.method === "GET" && pathname === "/article") {
    page = 1 + (page % 100);

    //Qiitaから記事をとってくる
    if (qiita) {
      console.log("Qiita API");

      //トークン情報をヘッダーに登録
      const reqQiita = new Request(
        //
        `https://qiita.com/api/v2/items?page=${page}&per_page=20&sort=stock&query=title:${keyWord}`,
        {
          headers: {
            "Authorization": `Bearer ${(Deno.env.get("QIITA_API_TOKEN"))}`,
          },
        },
      );
      const resQiita = await fetch(reqQiita);
      const resQiitaData = await resQiita.json();

      console.log(
        resQiitaData.map((item) => {
          return `title: ${item.title}`;
        }),
      );
      qiitaObj.push(...resQiitaData.map((item) => {
        return {
          title: item.title,
          updated_at: item.updated_at,
          url: item.url,
          description: item.body,
          likes_count: item.likes_count,
          comments_count: item.comments_count,
          username: item.user.id,
        };
      }));
    }

    //Zennから記事をとってくる
    if (zenn) {
      let zennPage;
      if (page % 2) {
        zennPage = page / 2 - 0.5;
      } else {
        zennPage = page / 2;
      }
      flag = !flag;

      console.log("ZennAPI");
      keyWord.replace(/\s+/g, "");
      let zennUrl;
      if (keyWord !== "") {
        zennUrl =
          `https://zenn.dev/api/search?q=${keyWord}&order=alltime&source=articles&page=${page}`;
      } else {zennUrl =
          `https://zenn.dev/api/articles?order=latest&page=${zennPage}`;}
      console.log(zennUrl);
      const resZenn = await fetch(
        zennUrl,
      );
      const resZennData = await resZenn.json();
      const zennDataSliced = [];
      for (
        let i = flag * zennPageCount;
        i < (flag + 1) * zennPageCount;
        i++
      ) {
        zennDataSliced.push(resZennData.articles[i]);
      }

      zennObj.push(...zennDataSliced.map((item) => {
        return {
          title: item.title,
          updated_at: item.body_updated_at,
          url: `https://zenn.dev${item.path}`,
          description: "",
          likes_count: item.liked_count,
          comments_count: item.comments_count,
          username: item.user.id, //usernameだと設定していない人がいるため
        };
      }));
    }

    //一日一創から記事を取得
    if (issou) {
      console.log("issou");

      //結果を格納する配列
      const Results = [];
      //RSS
      //XMLソースを DOMオブジェクトに変換した物が入っている
      const respIssou = await fetch("https://fukuno.jig.jp/rss.xml");
      const rssContent = await respIssou.text();
      const source = `${
        rssContent.slice(0, rssContent.lastIndexOf("<it"))
      }</channel></rss>`;
      //console.log(source);
      const DOM = new DOMParser().parseFromString(
        source,
        "text/html",
      );

      const titleTarget = DOM.querySelectorAll(
        "rss > channel > item > title",
      );
      const dateTarget = DOM.querySelectorAll(
        "rss > channel > item> pubDate",
      );
      const urlTarget = DOM.querySelectorAll(
        "rss > channel > item> guid",
      );
      const descriptionTarget = DOM.querySelectorAll(
        "rss > channel > item > description",
      );
      for (
        let i = issouPageCount * (page - 1);
        i < issouPageCount * page;
        i++
      ) {
        const title = titleTarget[i].innerText;
        const updated_at = dateTarget[i].innerText;
        const url = urlTarget[i].innerText;
        const description = descriptionTarget[i].innerText;

        let likes_count;
        let comments_count;
        let username;

        Results.push({
          title,
          updated_at,
          url,
          description,
          likes_count,
          comments_count,
          username,
        });
      }

      issouObj.push(...Results.map((item) => {
        return {
          title: item.title,
          updated_at: item.updated_at,
          url: item.url,
          description: item.description,
          likes_count: item.likes_count,
          comments_count: item.comments_count,
          username: item.username,
        };
      }));
    }

    obj.Qiita = qiitaObj;
    obj.Zenn = zennObj;
    obj.Issou = issouObj;

    console.log("show obj");
    return new Response(JSON.stringify(obj), {
      headers: {
        "content-type": "application/json",
      },
    });
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
