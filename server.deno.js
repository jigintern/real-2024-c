import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  let page = 0;


  if (req.method === "GET" && pathname === "/article") {
    //Qiita APIからJSON形式で記事を取得
    console.log("Qiita API");
    const keyword = "Git";
    
    page = 1 + (page % 100);
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
    const obj = resQiitaData.map((item) => {
      return {
        title: item.title,
        updated_at: item.updated_at,
        url: item.url,
        description: item.body,
        page_views_count: item.page_views_count,
        likes_count: item.likes_count,
      };
    });

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
