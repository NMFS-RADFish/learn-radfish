import { http, HttpResponse } from "msw";

export default [
  http.get("/_healthcheck", ({ request }) => {
    return HttpResponse.json(
      {
        message: "OK",
      },
      { status: 200 },
    );
  }),
];
