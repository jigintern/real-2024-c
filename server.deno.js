import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  const req_qiita = await new Recuest(
    "https://qiita.com/api/v2/authenticated_user/items",
    {
      headers: {
        //Authorization: 'Bearer [ここにアクセストークンをいれる]>',
      },
    },
  );
  const res_qiita = await fetch(req_qiita);
  console.log(res_qiita);

  if (req.method === "GET" && pathname === "/article") {
    const obj=[{
      title: "title",
      updated_at: "2000-01-01T00:00:00+00:00",
      url: "https://qiita.com/Qiita/items/c686397e4a0f4f11683d",
      description: "rendered_body",
      page_views_count: "page_views_count",
      likes_count: "likes_count",
    }, {
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
    }];
    return new Response(JSON.stringify(obj),
    {
      "Content-type": "application/json"
    });
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
