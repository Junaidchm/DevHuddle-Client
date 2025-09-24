import { serverFetchSilent } from "../../lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 }
      );
    }

    const response = await serverFetchSilent("/feed/medias", {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "User-Agent": "vercel-cron/1.0",
      },
    });

    if (!response.ok) {
      return Response.json({ error: "Cleanup failed" }, { status: 500 });
    }

    const data = await response.json();

    return Response.json({
      message: "Cleanup triggered successfully",
      deleted: data.deleted,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
