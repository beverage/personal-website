'use client'

import { useState } from 'react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface ContactFormStrings {
	nameLabel: string
	namePlaceholder: string
	emailLabel: string
	emailPlaceholder: string
	messageLabel: string
	messagePlaceholder: string
	submit: string
	submitting: string
	success: string
	sendAnother: string
	errorGeneric: string
	errorValidation: string
	errorRateLimit: string
}

interface ContactFormProps {
	/** Locale strings — passed as a prop so the component does not subscribe
	 * to LanguageContext. This keeps the exiting AnimatePresence subtree
	 * frozen on its old strings while it fades out. */
	form: ContactFormStrings
	disabled?: boolean
}

export const ContactForm = ({ form, disabled }: ContactFormProps) => {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [website, setWebsite] = useState('') // honeypot
	const [status, setStatus] = useState<FormStatus>('idle')
	const [errorMessage, setErrorMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (status === 'submitting') return

		setStatus('submitting')
		setErrorMessage('')

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, website }),
			})

			if (response.ok) {
				setStatus('success')
				setName('')
				setEmail('')
				setMessage('')
				return
			}

			const data = (await response.json().catch(() => ({}))) as {
				error?: string
			}

			if (response.status === 429) {
				setErrorMessage(form.errorRateLimit)
			} else if (response.status === 400) {
				setErrorMessage(form.errorValidation)
			} else {
				setErrorMessage(data.error || form.errorGeneric)
			}
			setStatus('error')
		} catch {
			setErrorMessage(form.errorGeneric)
			setStatus('error')
		}
	}

	const handleReset = () => {
		setStatus('idle')
		setErrorMessage('')
	}

	const inputClasses =
		'font-exo2 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-cyan-400 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 disabled:opacity-50'

	if (status === 'success') {
		return (
			<div
				className="font-exo2 mx-auto max-w-xl rounded-2xl border border-cyan-400/30 bg-black/30 p-8 text-center backdrop-blur-md"
				role="status"
				aria-live="polite"
			>
				<p className="mb-6 text-xl text-white/90 sm:text-2xl">{form.success}</p>
				<button
					type="button"
					onClick={handleReset}
					className="font-exo2 rounded-lg border border-cyan-400 px-6 py-3 text-cyan-300 transition-all hover:bg-cyan-400/10"
				>
					{form.sendAnother}
				</button>
			</div>
		)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto w-full max-w-xl space-y-4 text-left"
			noValidate
		>
			{/* Honeypot — hidden from humans but visible to naive bots */}
			<div
				aria-hidden="true"
				style={{
					position: 'absolute',
					left: '-10000px',
					top: 'auto',
					width: '1px',
					height: '1px',
					overflow: 'hidden',
				}}
			>
				<label>
					Website
					<input
						type="text"
						name="website"
						tabIndex={-1}
						autoComplete="off"
						value={website}
						onChange={e => setWebsite(e.target.value)}
					/>
				</label>
			</div>

			<div>
				<label
					htmlFor="contact-name"
					className="font-exo2 mb-1.5 block text-sm text-white/60"
				>
					{form.nameLabel}
				</label>
				<input
					id="contact-name"
					type="text"
					name="name"
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder={form.namePlaceholder}
					maxLength={100}
					autoComplete="name"
					disabled={disabled || status === 'submitting'}
					className={inputClasses}
				/>
			</div>

			<div>
				<label
					htmlFor="contact-email"
					className="font-exo2 mb-1.5 block text-sm text-white/60"
				>
					{form.emailLabel}
				</label>
				<input
					id="contact-email"
					type="email"
					name="email"
					required
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder={form.emailPlaceholder}
					maxLength={254}
					autoComplete="email"
					disabled={disabled || status === 'submitting'}
					className={inputClasses}
				/>
			</div>

			<div>
				<label
					htmlFor="contact-message"
					className="font-exo2 mb-1.5 block text-sm text-white/60"
				>
					{form.messageLabel}
				</label>
				<textarea
					id="contact-message"
					name="message"
					required
					value={message}
					onChange={e => setMessage(e.target.value)}
					placeholder={form.messagePlaceholder}
					rows={6}
					minLength={10}
					maxLength={5000}
					disabled={disabled || status === 'submitting'}
					className={`${inputClasses} resize-y`}
				/>
			</div>

			{errorMessage && (
				<p
					role="alert"
					aria-live="polite"
					className="font-exo2 text-sm text-red-300"
				>
					{errorMessage}
				</p>
			)}

			<div className="flex justify-end pt-2">
				<button
					type="submit"
					disabled={disabled || status === 'submitting'}
					className="font-exo2 rounded-lg bg-cyan-500 px-8 py-3 text-white shadow-lg shadow-cyan-500/40 transition-all hover:bg-cyan-600 hover:shadow-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{status === 'submitting' ? form.submitting : form.submit}
				</button>
			</div>
		</form>
	)
}
