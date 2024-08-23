import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  //Qiita APIからJSON形式で記事を取得
  console.log("Qiita API");
  //トークン情報をヘッダーに登録
  const reqQiita = new Request(
    "https://qiita.com/api/v2/items",
    {
      headers: {
        "Authorization": `Bearer ${(Deno.env.get("QIITA_API_TOKEN"))}`,
      },
    }
  );
  const resQiita = await fetch(reqQiita);
  const resQiitaData = await resQiita.json();
  
  console.log(
    resQiitaData.map(item =>{
      return `title: ${item.title}`
    }));

  if (req.method === "GET" && pathname === "/article") {
    const obj = 
      resQiitaData.map(item =>{
        return item.title;
      })
    
    return new Response(JSON.stringify(obj), {
      headers: {
        "content-type": "text/html",
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
