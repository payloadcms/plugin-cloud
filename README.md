# Payload Cloud Plugin

This is the official Payload Cloud plugin that is meant to be installed for any project that deploys on Payload Cloud.

## What it does

Payload Cloud gives you everything you need to deploy Payload to production, and this plugin is responsible for connecting your Payload instance to the resources that Payload Cloud provides.

### File storage

Payload Cloud gives you S3 file storage backed by Cloudflare as a CDN, and this plugin extends Payload so that all of your media will be stored in S3 rather than locally.

### Email delivery

Payload Cloud provides an email delivery service out-of-the-box for all Payload Cloud customers. Powered by [Resend](https://resend.com).

## How to use

This plugin should be added as a plugin to your Payload config

`yarn add @payloadcms/plugin-cloud`

```ts
import { payloadCloud } from '@payloadcms/plugin-cloud'
import { buildConfig } from 'payload/config'

export default buildConfig({
  plugins: [payloadCloud()]
  // rest of config
})
```

NOTE: If your Payload config already has an email with transport, this will be respected.

### Optional configuration

If you wish to opt-out of any Payload cloud features, the plugin also accepts options to do so.

```ts
payloadCloud({
  storage: false, // Disable file storage
  email: false,   // Disable email delivery
})
```

## Future enhancements

### API CDN

In the future, this plugin will also ship with a way to dynamically cache API requests as well as purge them whenever a resource is updated.

## When it executes

This plugin will only execute if the required environment variables set by Payload Cloud are in place.
