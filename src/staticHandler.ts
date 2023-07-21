import type { CollectionConfig } from 'payload/types'
import type { Readable } from 'stream'
import type { StaticHandler } from './types'
import { createKey } from './utilities/createKey'
import { getStorageClient } from './utilities/getStorageClient'

interface Args {
  collection: CollectionConfig
  cachingEnabled?: boolean
  cacheMaxAge?: number
}

export const getStaticHandler =
  ({ collection, cacheMaxAge, cachingEnabled }: Args): StaticHandler =>
  async (req, res, next) => {
    try {
      const { storageClient, identityID } = await getStorageClient()

      const Key = createKey({
        collection: collection.slug,
        filename: req.params.filename,
        identityID,
      })

      const object = await storageClient.getObject({
        Bucket: process.env.PAYLOAD_CLOUD_BUCKET,
        Key,
      })

      const maxAge = cacheMaxAge || 86400 // 24 hours

      res.set({
        'Content-Length': object.ContentLength,
        'Content-Type': object.ContentType,
        // Q: immutable any benefit here?
        ...(cachingEnabled && { 'Cache-Control': `public, max-age=${maxAge}, immutable` }),
        ETag: object.ETag,
      })

      req.payload.logger.debug({
        msg: 'Serving static file',
        Key,
        headers: res.getHeaders(),
      })

      if (object?.Body) {
        return (object.Body as Readable).pipe(res)
      }

      return next()
    } catch (err: unknown) {
      req.payload.logger.error(err)
      return next()
    }
  }
