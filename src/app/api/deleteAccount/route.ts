import { NextResponse } from "next/server";
import { supabase as admin } from "@/utils/supabase/supabase.service";

export const dynamic = "force-dynamic";

// Remove every object under a `{bucket}/{prefix}/` folder. Supabase `list()`
// returns at most `limit` rows per call, so page until the folder is empty.
async function emptyBucketFolder(bucket: string, prefix: string) {
  for (;;) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: 100 });

    // A missing folder lists as empty — nothing to do. On a real error we stop
    // rather than loop forever; account deletion still proceeds.
    if (error || !data || data.length === 0) break;

    const paths = data
      .filter((f) => f.name)
      .map((f) => `${prefix}/${f.name}`);

    if (paths.length > 0) {
      const { error: removeError } = await admin.storage
        .from(bucket)
        .remove(paths);
      if (removeError) break;
    }

    // Last (partial) page — no more objects to fetch.
    if (data.length < 100) break;
  }
}

export async function POST(request: Request) {
  // Identity comes from the caller's access-token JWT, verified against the
  // Supabase auth server — never from the request body. The service-role client
  // below bypasses RLS, so trusting client-supplied input would let anyone
  // delete anyone's account. The app's session lives in the browser client's
  // localStorage, so the token arrives as a Bearer header rather than a cookie.
  const token = (request.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    "",
  );
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // 1. Purge storage first — it needs the userId, which the cascade below
  //    would otherwise erase. Best-effort: a storage hiccup must not block
  //    account removal (orphaned files can be swept later).
  await emptyBucketFolder("resume", `public/${userId}`);
  await emptyBucketFolder("auracv", `user/${userId}`);

  // 2. Delete the auth user. The public.users row is removed automatically by
  //    the FK `on delete cascade`, so no separate row delete is required.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
