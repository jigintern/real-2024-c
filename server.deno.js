import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
//スクレイピング用のライブラリ
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

//表示するページを変更するための変数
let page = 0;

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //クエリパラメータを取得
  /*
  const param= new URLSearchParams(window.location.search).get("type");
  const qiita=param.get("qiita");
  const zenn=param.get("zenn");
  const github =param.get("github");
  */
  const qiita = 1;
  const zenn = 1;
  const issou = 1;

  //どのサイトから記事を取ってくるか
  const site = "Zenn";
  //レスポンス用のJSON変数
  let obj = { "Qiita": [], "Zenn": [] };
  let zennObj = [];
  let qiitaObj = [];

  if (req.method === "GET" && pathname === "/article") {
    page = 1 + (page % 100);
    //Qiitaから記事をとってくる
    if (qiita) {
      //Qiita APIからJSON形式で記事を取得
      const keyWord = "";
      console.log("Qiita API");
      const keyword = "Git";

      //トークン情報をヘッダーに登録
      const reqQiita = new Request(
        // created:>=2022-12-01 created:<=2022-12-31で期間を特定
        `https://qiita.com/api/v2/items?page=${page}&per_page=20&sort=stock&query=title:${keyword}`,
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
      console.log("ZennAPI");
      const resZenn = await fetch(
        `https://zenn.dev/api/articles?order=latest&page=${page}`,
      );
      const resZennData = await resZenn.json();
      //console.log(resZennData.articles);

      console.log(
        resZennData.articles.map((item) => {
          return `title: ${item.title}`;
        }),
      );

      zennObj.push(...resZennData.articles.map((item) => {
        return {
          title: item.title,
          updated_at: item.body_updated_at,
          url: `https://zenn.dev${item.path}`,
          description: "",
          likes_count: item.liked_count,
          comments_count: item.comments_count,
          username: item.user.username,
        };
      }));
    }

    /*
    //Githubからリポジトリを取得
    const star=1000;
    const resGithub = await fetch(
      `https://api.github.com/search/repositories?
      q=${keyWord}+in:name,description,readme+stars:>=${star}
      &sort=stars&order=desc&per_page=10&page=${page}`,
    );
    const resGithubData = await resGithub.json();
    console.log(resGithubData);

    console.log(
      resGithubData.articles.map((item) => {
        return `title: ${item.title}`;
      }),
    );
    */
    if (issou) {
      console.log("issou");
      fetch("https://fukuno.jig.jp/").then((resp) => resp.text()).then(
        (source) => {
          //HTMLソースを DOMオブジェクトに変換した物が入っている
          const DOM = new DOMParser().parseFromString(source, "text/html");
          const titleTarget = DOM.querySelectorAll("#chead > a > h2");
          const urlTarget = DOM.querySelectorAll("#chead > a");
          const dateTarget = DOM.querySelectorAll("#content > div.datetime");
          const descriptionTarget = DOM.querySelectorAll("#cmain");
          const Results = [];

          for (let i = 0; i < titleTarget.length; i++) {
            let title = titleTarget[i].innerText;
            let updated_at = dateTarget[i].innerText;
            let url = new URL(
              urlTarget[i].getAttribute("href"),
              "https://fukuno.jig.jp/",
            ).href;

            //descriptionを取得
            /*
            let des_img=descriptionTarget[i].getElementsByTagName("img");
            let des_p=descriptionTarget[i].getElementsByTagName("p");
          console.log(descriptionTarget[i]);
          let description=descriptionTarget[i].removeChild(des_img);
          let likes_count;
          let comments_count;
          let username;
          */

          Results.push({
            title,updated_at,url,description,likes_count,comments_count,username
          })
          }

          console.log(Results);
        },
      );
    }

    obj.Qiita = qiitaObj;
    obj.Zenn = zennObj;

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
