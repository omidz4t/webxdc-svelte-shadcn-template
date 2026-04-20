import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// webxdc apps are static bundles, so emit a static site.
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
		paths: {
			// webxdc runs from a zip-like sandbox, so root-absolute URLs break.
			relative: true
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self']
			}
		},
		prerender: {
			entries: ['*']
		}
	}
};

export default config;
