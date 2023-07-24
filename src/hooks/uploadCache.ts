import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload/types'

export const getCacheUploadsAfterChangeHook =
  (): CollectionAfterChangeHook =>
  async ({ operation, req, doc }) => {
    if (!req || !process.env.PAYLOAD_CLOUD_CACHE_KEY) return doc

    const { res } = req
    if (res) {
      if (operation === 'update') {
        req.payload.logger.debug({
          msg: 'TODO: Purge cache in CF after update',
          body: {
            projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
            cacheKey: process.env.PAYLOAD_CLOUD_CACHE_KEY,
            filepath: doc.url,
          },
        })
      }
    }
    return doc
  }

export const getCacheUploadsAfterDeleteHook =
  (): CollectionAfterDeleteHook =>
  async ({ req, doc }) => {
    if (!req || !process.env.PAYLOAD_CLOUD_CACHE_KEY) return doc

    req.payload.logger.debug({ msg: 'After delete hook...' })
    const { res } = req
    if (res) {
      req.payload.logger.debug({
        msg: 'TODO: Purge cache in CF after update',
        body: {
          projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
          cacheKey: process.env.PAYLOAD_CLOUD_CACHE_KEY,
          filepath: doc.url,
        },
      })
    }
    return doc
  }
