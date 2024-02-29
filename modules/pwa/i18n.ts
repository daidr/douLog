import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import type { ManifestOptions } from 'vite-plugin-pwa'
import { getEnv } from '../../config/env'
import { currentLocales } from '../../config/i18n'

export type LocalizedWebManifest = Record<string, Partial<ManifestOptions>>

export const pwaLocales = currentLocales

type WebManifestEntry = Pick<ManifestOptions, 'name' | 'short_name' | 'description' | 'screenshots' | 'shortcuts'>
type RequiredWebManifestEntry = Required<WebManifestEntry & Pick<ManifestOptions, 'dir' | 'lang' | 'screenshots' | 'shortcuts'>>

export async function createI18n(): Promise<LocalizedWebManifest> {
  const { env } = await getEnv()
  const envName = `${env === 'release' ? '' : `(${env})`}`
  const { pwa } = await readI18nFile('en.json')

  const defaultManifest: Required<WebManifestEntry> = pwa.webmanifest[env]

  const manifestEntries: Partial<ManifestOptions> = {
    scope: '/',
    start_url: '/',
    display: 'standalone',
    id: '/',
    orientation: 'natural',
    icons: [
      {
        src: '/pwa/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    edge_side_panel: {
      preferred_width: 480,
    },
  }

  const locales: RequiredWebManifestEntry[] = await Promise.all(
    pwaLocales
      .filter(l => l.code !== 'en-US')
      .map(async ({ code, dir = 'ltr', file, files }) => {
        // read locale file or files
        const { app_desc_short, app_name, pwa } = file
          ? await readI18nFile(file as string)
          : await findBestWebManifestData(files as string[], env)
        const entry = pwa?.webmanifest?.[env] ?? {}

        if (!entry.name && app_name) {
          entry.name = dir === 'rtl' ? `${envName} ${app_name}` : `${app_name} ${envName}`
        }

        if (!entry.short_name && app_name) {
          entry.short_name = dir === 'rtl' ? `${envName} ${app_name}` : `${app_name} ${envName}`
        }

        if (!entry.description && app_desc_short) {
          entry.description = app_desc_short
        }

        return <RequiredWebManifestEntry>{
          ...defaultManifest,
          ...entry,
          lang: code,
          dir,
        }
      }),
  )
  locales.push({
    ...defaultManifest,
    lang: 'en-US',
    dir: 'ltr',
  })
  return locales.reduce((acc, {
    lang,
    dir,
    name,
    short_name,
    description,
    shortcuts,
    screenshots,
  }) => {
    acc[lang] = {
      lang,
      name,
      short_name,
      description,
      dir,
      background_color: '#ffffff',
      theme_color: '#ffffff',
      ...manifestEntries,
      shortcuts,
      screenshots,
    }
    acc[`${lang}-dark`] = {
      lang,
      name,
      short_name,
      description,
      dir,
      background_color: '#111111',
      theme_color: '#111111',
      ...manifestEntries,
      shortcuts,
      screenshots,
    }

    return acc
  }, {} as LocalizedWebManifest)
}

async function readI18nFile(file: string) {
  const { resolve } = createResolver(import.meta.url)
  return JSON.parse(Buffer.from(
    await readFile(resolve(`../../locales/${file}`), 'utf-8'),
  ).toString())
}

interface PWAEntry {
  webmanifest?: Record<string, {
    name?: string
    short_name?: string
    description?: string
  }>
  screenshots?: Record<string, string>
  shortcuts?: Record<string, string>
}

interface JsonEntry {
  pwa?: PWAEntry
  app_name?: string
  app_desc_short?: string
  action?: Record<string, any>
  screenshots?: Record<string, string>
}

async function findBestWebManifestData(files: string[], env: string) {
  const entries: JsonEntry[] = await Promise.all(files.map(async (file) => {
    const { action, app_name, app_desc_short, nav, pwa } = await readI18nFile(file)
    return { action, app_name, app_desc_short, nav, pwa }
  }))

  let pwa: PWAEntry | undefined
  let app_name: string | undefined
  let app_desc_short: string | undefined
  const action: Record<string, any> = {}

  for (const entry of entries) {
    const webmanifest = entry?.pwa?.webmanifest?.[env]
    if (webmanifest) {
      if (pwa) {
        if (webmanifest.name) {
          pwa.webmanifest![env].name = webmanifest.name
        }

        if (webmanifest.short_name) {
          pwa.webmanifest![env].short_name = webmanifest.short_name
        }

        if (webmanifest.description) {
          pwa.webmanifest![env].description = webmanifest.description
        }
      } else {
        pwa = entry.pwa
      }
    }

    if (entry.app_name) {
      app_name = entry.app_name
    }

    if (entry.app_desc_short) {
      app_desc_short = entry.app_desc_short
    }

    if (entry.action?.compose) {
      action.compose = entry.action.compose
    }

    if (entry.pwa?.screenshots) {
      if (!pwa) {
        pwa = {}
      }

      pwa.screenshots = pwa.screenshots ?? {}
      Object
        .entries(entry.pwa.screenshots)
        .forEach(([key, value]) => pwa!.screenshots![key] = value)
    }
  }

  return { action, app_desc_short, app_name, pwa }
}
