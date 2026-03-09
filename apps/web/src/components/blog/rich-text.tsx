/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from 'react'

import type { BlogGalleryImage, BlogPost } from '@/lib/blog'

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number
  url?: string
  fields?: Record<string, unknown>
  children?: LexicalNode[]
}

function renderText(node: LexicalNode, key: string) {
  let content: ReactNode = node.text ?? ''

  if (!content) {
    return null
  }

  if (typeof node.format === 'number') {
    if (node.format & 1) {
      content = <strong key={`${key}-strong`}>{content}</strong>
    }

    if (node.format & 2) {
      content = <em key={`${key}-italic`}>{content}</em>
    }

    if (node.format & 8) {
      content = <code key={`${key}-code`}>{content}</code>
    }
  }

  return <>{content}</>
}

function renderChildren(
  nodes: LexicalNode[] | undefined,
  mediaMap: Map<number, BlogGalleryImage | NonNullable<BlogPost['featuredImage']>>,
) {
  return (nodes ?? []).map((child, index) => renderNode(child, `${child.type ?? 'node'}-${index}`, mediaMap))
}

function renderUpload(
  node: LexicalNode,
  key: string,
  mediaMap: Map<number, BlogGalleryImage | NonNullable<BlogPost['featuredImage']}>,
) {
  const payloadMediaId = Number(node.fields?.id ?? node.fields?.value ?? node.fields?.doc)
  const media = Number.isFinite(payloadMediaId) ? mediaMap.get(payloadMediaId) : null

  if (!media?.url) {
    return null
  }

  return (
    <figure key={key} className="my-10 overflow-hidden rounded-3xl border border-black/5 bg-zinc-950/5">
      <img src={media.url} alt={media.alt} className="w-full object-cover" />
      {(media.caption || media.credit) ? (
        <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-zinc-500">
          <span>{media.caption ?? ('galleryCaption' in media ? media.galleryCaption : null) ?? media.alt}</span>
          {media.credit ? <span>{media.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

function renderNode(
  node: LexicalNode,
  key: string,
  mediaMap: Map<number, BlogGalleryImage | NonNullable<BlogPost['featuredImage']}>,
): ReactNode {
  if (node.type === 'text') {
    return <span key={key}>{renderText(node, key)}</span>
  }

  if (node.type === 'upload') {
    return renderUpload(node, key, mediaMap)
  }

  const children = renderChildren(node.children, mediaMap)

  switch (node.type) {
    case 'heading': {
      const Tag = (node.tag ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4'
      return (
        <Tag key={key} className="mt-12 text-pretty text-3xl font-semibold tracking-tight text-zinc-950">
          {children}
        </Tag>
      )
    }
    case 'paragraph':
      return (
        <p key={key} className="text-lg leading-8 text-zinc-700">
          {children}
        </p>
      )
    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-lime-400 pl-6 text-xl italic text-zinc-700">
          {children}
        </blockquote>
      )
    case 'list':
      return node.tag === 'ol' ? (
        <ol key={key} className="list-decimal space-y-3 pl-6 text-lg leading-8 text-zinc-700">
          {children}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-3 pl-6 text-lg leading-8 text-zinc-700">
          {children}
        </ul>
      )
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'link':
      return (
        <a
          key={key}
          href={typeof node.url === 'string' ? node.url : '#'}
          className="font-medium text-zinc-950 underline decoration-lime-400 underline-offset-4"
        >
          {children}
        </a>
      )
    case 'linebreak':
      return <br key={key} />
    default:
      return children.length > 0 ? <div key={key}>{children}</div> : null
  }
}

function extractImageMap(post: BlogPost) {
  const mediaEntries = [post.featuredImage, ...post.gallery]
    .filter((media): media is BlogGalleryImage | NonNullable<BlogPost['featuredImage']> => Boolean(media))
    .map((media) => [media.payloadMediaId, media] as const)

  return new Map(mediaEntries)
}

export function RichText({ post }: { post: BlogPost }) {
  const root = post.content as { root?: { children?: LexicalNode[] } } | null
  const imageMap = extractImageMap(post)

  if (!root?.root?.children?.length) {
    return (
      <div className="space-y-6">
        {post.contentText.split(/\n+/).filter(Boolean).map((paragraph) => (
          <p key={paragraph} className="text-lg leading-8 text-zinc-700">
            {paragraph}
          </p>
        ))}
      </div>
    )
  }

  return <div className="space-y-6">{renderChildren(root.root.children, imageMap)}</div>
}
