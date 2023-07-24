import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload/types'

interface Args {
  endpoint: string
}

export const getCacheUploadsAfterChangeHook =
  ({ endpoint }: Args): CollectionAfterChangeHook =>
  async ({ operation, req, doc }) => {
    if (!req || !process.env.PAYLOAD_CLOUD_CACHE_KEY) return doc

    const { res } = req
    if (res) {
      if (operation === 'update') {
        const body = {
          projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
          cacheKey: process.env.PAYLOAD_CLOUD_CACHE_KEY,
          filepath: doc.url,
        }
        req.payload.logger.debug({
          msg: 'TODO: Purge cache in CF after update',
          body,
        })

        try {
          await fetch(`${endpoint}/api/purge-cache`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              body,
            }),
          })
        } catch (err: unknown) {
          req.payload.logger.error({ msg: '/purge-cache call failed', err, body })
        }
      }
    }
    return doc
  }

export const getCacheUploadsAfterDeleteHook =
  ({ endpoint }: Args): CollectionAfterDeleteHook =>
  async ({ req, doc }) => {
    if (!req || !process.env.PAYLOAD_CLOUD_CACHE_KEY) return doc

    req.payload.logger.debug({ msg: 'After delete hook...' })
    const { res } = req
    if (res) {
      const body = {
        projectID: process.env.PAYLOAD_CLOUD_PROJECT_ID,
        cacheKey: process.env.PAYLOAD_CLOUD_CACHE_KEY,
        filepath: doc.url,
      }
      req.payload.logger.debug({
        msg: 'TODO: Purge cache in CF after delete',
        body,
      })

      try {
        await fetch(`${endpoint}/api/purge-cache`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body,
          }),
        })
      } catch (err: unknown) {
        req.payload.logger.error({ msg: '/purge-cache call failed', err, body })
      }
    }
    return doc
  }
