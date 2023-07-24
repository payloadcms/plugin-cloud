import type { CollectionConfig } from 'payload/types'
import type { Readable } from 'stream'
import type { PluginOptions, StaticHandler } from './types'
import { createKey } from './utilities/createKey'
import { getStorageClient } from './utilities/getStorageClient'

interface Args {
  collection: CollectionConfig
  cachingOptions?: PluginOptions['uploadCaching']
}

export const getStaticHandler = ({ collection, cachingOptions }: Args): StaticHandler => {
  const cachingEnabled = cachingOptions !== false && !!process.env.PAYLOAD_CLOUD_CACHE_KEY

  let maxAge = 86400 // 24 hours default
  if (cachingEnabled) {
    if (typeof cachingOptions === 'object') {
      maxAge = cachingOptions[collection.slug]?.maxAge || maxAge
    }
    console.log(`uploadCaching: Caching for '${collection.slug}' set to ${maxAge} seconds`)
  }
  return async (req, res, next) => {
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
}
