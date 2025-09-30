import { useLanguage } from '@/contexts/LanguageContext'
import enTranslations from '@/locales/en.json'
import frTranslations from '@/locales/fr.json'

const translations = {
	en: enTranslations,
	fr: frTranslations,
}

export const useTranslation = () => {
	const { language } = useLanguage()

	const t = translations[language]

	return { t, language }
}
