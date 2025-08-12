import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#000000' },
				{ name: 'light', value: '#ffffff' },
			],
		},
		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo',
		},
	},
	globalTypes: {
		theme: {
			description: 'Global theme for components',
			defaultValue: 'dark',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: ['light', 'dark'],
			},
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme || 'dark'
			return React.createElement(
				'div',
				{ className: theme },
				React.createElement(
					'div',
					{ className: 'min-h-screen bg-black text-white' },
					React.createElement(Story),
				),
			)
		},
	],
}

export default preview
