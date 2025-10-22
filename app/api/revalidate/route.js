// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'

/** GETでも再検証できるように（切り分け用&簡易テスト用）
 *  例: /api/revalidate?secret=TOKEN&path=/
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('secret')
  if (token !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }
  const path = searchParams.get('path') || '/'
  try {
    revalidatePath(path)
    return Response.json({ revalidated: true, method: 'GET', path })
  } catch (e) {
    return Response.json({ revalidated: false, error: e?.message }, { status: 500 })
  }
}

/** 本番運用はこちら（WP Webhooks からの POST 用） */
export async function POST(req) {
  const { searchParams } = new URL(req.url)
  const secretInQuery = searchParams.get('secret')

  let body = {}
  try { body = await req.json() } catch (_) {}
  const { secret: secretInBody, path = '/', slug, tags } = body

  const token = secretInQuery || secretInBody
  if (token !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    if (path) revalidatePath(path)
    if (slug) revalidatePath(`/blog/${slug}`)     // ルーティングに合わせて変更OK
    if (Array.isArray(tags)) tags.forEach(t => revalidateTag(t))
    return Response.json({ revalidated: true, method: 'POST', path, slug, tags })
  } catch (e) {
    return Response.json({ revalidated: false, error: e?.message }, { status: 500 })
  }
}
