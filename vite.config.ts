import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { Resvg } from '@resvg/resvg-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

function svgToPng(svgPath: string, pngPath: string) {
	const convert = () => {
		const svg = readFileSync(resolve(svgPath));
		const resvg = new Resvg(svg, {
			fitTo: { mode: 'width', value: 512 }
		});
		const png = resvg.render().asPng();
		writeFileSync(resolve(pngPath), png);
	};

	return {
		name: 'svg-to-png-icon',
		configResolved() {
			convert();
		},
		configureServer() {
			convert();
		},
		buildStart() {
			convert();
		}
	};
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svgToPng('static/icon.svg', 'static/icon.png')]
});
