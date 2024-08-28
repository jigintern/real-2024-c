import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
//スクレイピング用のライブラリ
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

//表示するページを変更するための変数
let page = 0;
let issouPage = 0;
const issouPageCount = 20;

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //クエリパラメータを取得
  const param = new URL(req.url).searchParams;
  const qiita = param.get("qiita") === "0" ? false : true;
  const zenn = param.get("zenn") === "0" ? false : true;
  const issou = param.get("issou") === "0" ? false : true;
  //const github =param.get("github");

  //どのサイトから記事を取ってくるか
  const site = "Zenn";
  //レスポンス用のJSON変数
  let obj = { "Qiita": [], "Zenn": [], "Issou": [] };
  let zennObj = [];
  let qiitaObj = [];
  let issouObj = [];

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

      //結果を格納する配列
      const Results = [];
      //一日一創から情報を取得
      //ブログ一覧からスクレイピング
      await fetch("https://fukuno.jig.jp/?q=%2B").then((resp) => resp.text())
        .then(
          async (source_all) => {
            const domAll = new DOMParser().parseFromString(
              source_all,
              "text/html",
            );
            //一覧から各記事のURLを取得
            const urlsAll = domAll.querySelectorAll("#cmain > div > a");
            //ページを指定
            //const urlsSliced=urlsAll.slice((issouPage++)*issouPageCount,issouPage*issouPageCount);
            const urlsSliced = [];
            for (
              let i = issouPage++ * issouPageCount;
              i < issouPage * issouPageCount;
              i++
            ) {
              urlsSliced.push(urlsAll[i]);
            }

            for (const item of urlsSliced) {
              const resp = await fetch(item.getAttribute("href"));
              const source = await resp.text();

              //HTMLソースを DOMオブジェクトに変換した物が入っている
              const DOM = new DOMParser().parseFromString(
                source,
                "text/html",
              );
              const titleTarget = DOM.querySelectorAll("#chead > a > h2");
              const urlTarget = DOM.querySelectorAll("#chead > a");
              const dateTarget = DOM.querySelectorAll(
                "#content > div.datetime",
              );
              const pre_descriptionTarget = DOM.querySelectorAll(
                ".article",
              );
              let descriptionTarget = [];
              for (let j = 1; j < pre_descriptionTarget.length; j++) {
                descriptionTarget.push(pre_descriptionTarget[j]);
              }

              for (let i = 0; i < titleTarget.length; i++) {
                let title = titleTarget[i].innerText;
                let updated_at = dateTarget[i].innerText;
                let url = new URL(
                  urlTarget[i].getAttribute("href"),
                  "https://fukuno.jig.jp/",
                ).href;

                //descriptionを取得
                let description = descriptionTarget[i].innerText.trim()
                  .replace(/\s+/g, " ").substring(0, 60);
                //"<h1><img hogegege>hoge</h1>".replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
                //description.innerHTML.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
                //console.log(description);

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
            }
          },
        );

      console.log(Results);

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
    //console.log(obj);
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
