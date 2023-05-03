import type { Config } from 'payload/config'
import { extendWebpackConfig } from './webpack'
import { getBeforeChangeHook } from './hooks/beforeChange'
import { getAfterDeleteHook } from './hooks/afterDelete'
import { getStaticHandler } from './staticHandler'
import { payloadCloudEmail } from './email'
import type { PluginOptions } from './types'
import { getEnvVar } from './utilities/getEnvVar'

export const payloadCloud =
  (pluginOptions?: PluginOptions) =>
  (config: Config): Config => {
    config.admin = {
      ...(config.admin || {}),
      webpack: extendWebpackConfig(config),
    }

    if (process.env.PAYLOAD_CLOUD !== 'true') {
      return config // only modified webpack
    }

    // Configure cloud storage
    if (!pluginOptions?.disableStorage) {
      config = {
        ...config,
        upload: {
          ...(config.upload || {}),
          useTempFiles: true,
        },
        collections: (config.collections || []).map(collection => {
          if (collection.upload) {
            return {
              ...collection,
              upload: {
                ...(typeof collection.upload === 'object' ? collection.upload : {}),
                handlers: [
                  ...(typeof collection.upload === 'object' &&
                  Array.isArray(collection.upload.handlers)
                    ? collection.upload.handlers
                    : []),
                  getStaticHandler({ collection }),
                ],
                disableLocalStorage: true,
              },
              hooks: {
                ...(collection.hooks || {}),
                beforeChange: [
                  ...(collection.hooks?.beforeChange || []),
                  getBeforeChangeHook({ collection }),
                ],
                afterDelete: [
                  ...(collection.hooks?.afterDelete || []),
                  getAfterDeleteHook({ collection }),
                ],
              },
            }
          }

          return collection
        }),
      }
    }

    // Configure cloud email
    if (pluginOptions && pluginOptions.disableEmail !== true) {
      config.email = payloadCloudEmail({
        config,
        apiKey: getEnvVar('PAYLOAD_CLOUD_EMAIL_API_KEY'),
        defaultDomain: getEnvVar('PAYLOAD_CLOUD_EMAIL_DEFAULT_DOMAIN'),
      })
    }

    return config
  }
