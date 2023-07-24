import type { NextFunction, Response } from 'express'
import type { TypeWithID } from 'payload/dist/collections/config/types'
import type { FileData } from 'payload/dist/uploads/types'
import type { CollectionConfig, PayloadRequest } from 'payload/types'
import type { Config } from 'payload/config'

export interface File {
  buffer: Buffer
  filename: string
  filesize: number
  mimeType: string
  tempFilePath?: string
}

export type HandleUpload = (args: {
  collection: CollectionConfig
  req: PayloadRequest
  data: any
  file: File
}) => Promise<void> | void

export interface TypeWithPrefix {
  prefix?: string
}

export type HandleDelete = (args: {
  collection: CollectionConfig
  req: PayloadRequest
  doc: TypeWithID & FileData & TypeWithPrefix
  filename: string
}) => Promise<void> | void

export type GenerateURL = (args: {
  filename: string
  collection: CollectionConfig
  prefix?: string
}) => string | Promise<string>

export type StaticHandler = (
  req: PayloadRequest,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown

export interface PayloadCloudEmailOptions {
  config: Config
  apiKey: string
  defaultDomain: string
}

export interface PluginOptions {
  /** Payload Cloud Email
   * @default true
   */
  email?: false

  /** Payload Cloud Storage
   * @default true
   */
  storage?: false

  /**
   * Upload caching. Defaults to 24 hours for all collections.
   *
   * Optionally configure caching per collection
   *
   * ```ts
   * {
   *   collectionSlug: {
   *    maxAge: 3600 // Custom value in seconds
   *   }
   * }
   * ```
   *
   * @default true
   */

  uploadCaching?:
    | false
    | Record<
        string,
        {
          /** Caching in seconds
           * @default 86400 (24 hours) */
          maxAge: number
        }
      >
}
