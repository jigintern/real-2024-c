import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

<<<<<<< Updated upstream
  if (req.method === "GET" && pathname === "/article") {
    return new Response({
      title: "title",
      updated_at: "2000-01-01T00:00:00+00:00",
      url: "https://qiita.com/Qiita/items/c686397e4a0f4f11683d",
      description: "rendered_body",
      page_views_count: "page_views_count",
      likes_count: "likes_count",
    }, {
=======
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
  console.log(await resQiita.json());

  if (req.method === "GET" && pathname === "/article") {
    const obj = [{
>>>>>>> Stashed changes
      title: "title1",
      updated_at: "2000-01-01T00:00:00+00:00",
      url: "https://qiita.com/Qiita/items/c686397e4a0f4f11683d",
      description: "rendered_body1",
      page_views_count: "page_views_count1",
      likes_count: "likes_count1",
    }, {
      title: "title2",
      updated_at: "2000-01-01T00:00:00+00:00",
      url: "https://qiita.com/Qiita/items/c686397e4a0f4f11683d",
      description: "rendered_body2",
      page_views_count: "page_views_count2",
      likes_count: "likes_count2",
<<<<<<< Updated upstream
=======
    }, {
      title: "title3",
      updated_at: "2000-01-01T00:00:00+00:00",
      url: "https://qiita.com/Qiita/items/c686397e4a0f4f11683d",
      description: "rendered_body2",
      page_views_count: "page_views_count3",
      likes_count: "likes_count3",
    }];
    return new Response(JSON.stringify(obj), {
      headers: {
        "content-type": "text/html",
      },
>>>>>>> Stashed changes
    });
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
