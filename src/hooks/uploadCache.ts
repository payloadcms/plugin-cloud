import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload/types'

interface Args {
  cacheKey?: string
}

export const getCacheUploadsAfterChangeHook =
  ({ cacheKey }: Args): CollectionAfterChangeHook =>
  async ({ operation, req, doc }) => {
    if (!req || !cacheKey) return doc

    const { res } = req
    if (res) {
      if (operation === 'update') {
        req.payload.logger.debug({
          msg: 'TODO: Purge cache in CF after update',
          body: {
            projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
            cacheKey,
            filepath: doc.url,
          },
        })
      }
    }
    return doc
  }

export const getCacheUploadsAfterDeleteHook =
  ({ cacheKey }: Args): CollectionAfterDeleteHook =>
  async ({ req, doc }) => {
    if (!req) return doc

    req.payload.logger.debug({ msg: 'After delete hook...' })
    const { res } = req
    if (res) {
      req.payload.logger.debug({
        msg: 'TODO: Purge cache in CF after update',
        body: {
          projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
          cacheKey,
          filepath: doc.url,
        },
      })
    }
    return doc
  }
