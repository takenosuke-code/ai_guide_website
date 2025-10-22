// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req) {
  // クエリの secret
  const { searchParams } = new URL(req.url)
  const secretInQuery = searchParams.get('secret')

  // ボディは1回しか読めないので最初にまとめて
  let body = {}
  try { body = await req.json() } catch (_) {}
  const { secret: secretInBody, path = '/', slug, tags } = body

  // 認証
  const token = secretInQuery || secretInBody
  if (token !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    if (path) revalidatePath(path)               // 明示パス
    if (slug) revalidatePath(`/blog/${slug}`)
    // あなたのURL構成に合わせて変更OK
    if (Array.isArray(tags)) tags.forEach(t => revalidateTag(t))

    return Response.json({ revalidated: true, path, slug, tags })
  } catch (e) {
    return Response.json({ revalidated: false, error: e?.message }, { status: 500 })
  }
}
