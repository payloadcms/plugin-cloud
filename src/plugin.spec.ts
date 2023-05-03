import { defaults } from 'payload/dist/config/defaults'
import type { Config } from 'payload/config'
import { payloadCloud } from './plugin'
import nodemailer from 'nodemailer'

describe('plugin', () => {
  let defaultConfig: Config

  beforeAll(() => {
    jest.mock('resend')
  })

  beforeEach(() => {
    defaultConfig = { ...defaults }
  })

  describe('not in Payload Cloud', () => {
    it('should return unmodified config', () => {
      const plugin = payloadCloud()
      const config = plugin(defaultConfig)

      assertPluginDidNotRun(config)
    })
  })

  describe('in Payload Cloud', () => {
    beforeEach(() => {
      process.env.PAYLOAD_CLOUD = 'true'
      process.env.PAYLOAD_CLOUD_EMAIL_API_KEY = 'test-key'
      process.env.PAYLOAD_CLOUD_EMAIL_DEFAULT_DOMAIN = 'test-domain.com'
    })

    it('should default to using payload cloud email', () => {
      const plugin = payloadCloud()
      const config = plugin(defaultConfig)

      assertPluginRan(config)
    })

    it('should allow email opt-out', () => {
      const plugin = payloadCloud({ disableEmail: true })
      const config = plugin(defaultConfig)

      assertPluginDidNotRun(config)
    })

    it('should not modify existing email transport', () => {
      const existingTransport = nodemailer.createTransport({
        name: 'existing-transport',
        version: '0.0.1',
        send: async mail => {
          console.log('mock send', mail)
        },
      })

      const configWithExistingTransport: Config = {
        ...defaultConfig,
        email: {
          fromName: 'Test',
          fromAddress: 'test@test.com',
          transport: existingTransport,
        },
      }

      const plugin = payloadCloud()
      const config = plugin(configWithExistingTransport)

      expect(
        config.email && 'transport' in config.email && config.email.transport?.transporter.name,
      ).toEqual('existing-transport')

      assertPluginDidNotRun(config)
    })

    it('should allow setting fromName and fromAddress', () => {
      const configWithPartialEmail: Config = {
        ...defaultConfig,
        email: {
          fromName: 'Test',
          fromAddress: 'test@test.com',
        },
      }

      const plugin = payloadCloud()
      const config = plugin(configWithPartialEmail)

      expect(config.email?.fromName).toEqual(configWithPartialEmail.email?.fromName)
      expect(config.email?.fromAddress).toEqual(configWithPartialEmail.email?.fromAddress)

      assertPluginRan(config)
    })
  })
})

function assertPluginRan(config: Config) {
  expect(config.admin).toHaveProperty('webpack')
  if (config.email && 'transport' in config.email) {
    expect(config.email?.transport?.transporter.name).toEqual('payload-cloud')
  }
}

/** Asserts that plugin did not run (other than webpack aliases) */
function assertPluginDidNotRun(config: Config) {
  expect(config.admin).toHaveProperty('webpack')
  if (config.email && 'transport' in config.email) {
    expect(config.email?.transport?.transporter.name).not.toEqual('payload-cloud')
  }
}
