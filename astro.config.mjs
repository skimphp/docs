import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import AutoImport from 'astro-auto-import';
import mdx from '@astrojs/mdx';

export default defineConfig({
    integrations: [
        AutoImport({
            imports: [
                {
                    './src/components/docs/ApiSignature.astro': [['default', 'ApiSignature']],
                    './src/components/docs/ApiParam.astro': [['default', 'ApiParam']],
                    './src/components/docs/ApiThrows.astro': [['default', 'ApiThrows']],
                    './src/components/docs/ApiProperty.astro': [['default', 'ApiProperty']],
                    './src/components/docs/ApiMethod.astro': [['default', 'ApiMethod']],
                    './src/components/docs/ApiBadge.astro': [
                        ['default', 'ApiBadge'],
                        ['default', 'ApplicationBadge']
                    ],
                    './src/components/docs/ScopeBox.astro': [
                        ['default', 'ScopeBox'],
                        ['default', 'Scope']
                    ],
                    './src/components/docs/NoteBox.astro': [
                        ['default', 'NoteBox'],
                        ['default', 'Note']
                    ],
                    './src/components/docs/CodeExample.astro': [['default', 'CodeExample']],
                    './src/components/docs/WarningBox.astro': [
                        ['default', 'WarningBox'],
                        ['default', 'Warning']
                    ],
                    './src/components/docs/LifecycleFlow.astro': [['default', 'LifecycleFlow']],
                    './src/components/docs/AiContext.astro': [['default', 'AiContext']],
                    './src/components/docs/CustomHero.astro': [['default', 'CustomHero']],
                },
                {
                    '@astrojs/starlight/components': ['Tabs', 'TabItem'],
                }
            ]
        }),
        starlight({
            title: 'SKIM Framework',
            description: 'PHP 8.5+ micro-framework — auto-generated API reference',
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/skim-framework/skim' },
            ],
            sidebar: [
                {
                    label: 'Getting Started',
                    items: [
                        { label: 'Overview', slug: 'index' },
                        { label: 'Quick Start', slug: 'getting-started/quick-start' },
                        { label: 'Docker Setup', slug: 'getting-started/docker-setup' },
                    ],
                },
                {
                    label: 'Core Concepts',
                    items: [
                        { label: 'Request Lifecycle', slug: 'concepts/request-lifecycle' },
                        { label: 'Routing', slug: 'concepts/routing' },
                        { label: 'Middleware', slug: 'concepts/middleware' },
                        { label: 'DI Container & Scopes', slug: 'concepts/di-container' },
                        { label: 'Config & Env', slug: 'concepts/config-env' },
                        { label: 'Performance & Optimization', slug: 'concepts/performance' },
                    ],
                },
                {
                    label: 'Features',
                    items: [
                        { label: 'Database & ORM', slug: 'concepts/database-orm' },
                        { label: 'Cache', slug: 'api/cache/cache' },
                        { label: 'Session', slug: 'api/session/session' },
                        { label: 'Validation', slug: 'api/validation/validate' },
                        { label: 'Views & Templates', slug: 'features/templates' },
                        { label: 'Events', slug: 'api/events/event' },
                        { label: 'Queue', slug: 'features/queue' },
                        { label: 'CLI Commands', slug: 'api/cli/cli' },
                    ],
                },
                {
                    label: 'Extensions',
                    items: [
                        { label: 'Mailer', slug: 'extensions/mailer' },
                        { label: 'Auth', slug: 'extensions/auth' },
                    ],
                },
                {
                    label: 'AI & Docs',
                    items: [
                        { label: 'How it works', slug: 'concepts/ai-readable-docs' },
                    ],
                },
                {
                    label: 'API Reference',
                    autogenerate: { directory: 'api' },
                },
            ],
            customCss: ['./src/styles/docs-api.css', './src/styles/custom.css'],
            head: [
                {
                    tag: 'link',
                    attrs: {
                        rel: 'stylesheet',
                        href: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3/dist/tabler-icons.min.css',
                    },
                },
            ],
        }),
        mdx(),
    ],
    markdown: {
        shikiConfig: {
            transformers: [
                {
                    name: 'php-type-hints',
                    span(node, line, col) {
                        const text = node.children?.[0]?.value ?? '';
                        const typeHints = ['string', 'int', 'bool', 'float', 'callable', 'array', 'mixed', 'void', 'never', 'object', 'iterable'];
                        if (typeHints.includes(text)) {
                            node.properties['data-type'] = text;
                        }
                    },
                },
            ],
        },
    },
});
