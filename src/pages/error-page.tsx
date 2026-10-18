import { useEffect } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const { t } = useTranslation('errorpage')
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404
  const key = isNotFound ? 'notFound' : 'error'

  // Esta página vive fuera de App (sin useSeo): la 404 no debe indexarse; se restaura al salir
  useEffect(() => {
    const robots = document.head.querySelector('meta[name="robots"]')
    const previousRobots = robots?.getAttribute('content')
    robots?.setAttribute('content', 'noindex')
    return () => {
      if (previousRobots != null) robots?.setAttribute('content', previousRobots)
    }
  }, [])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-outer p-4 text-foreground">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 md:p-10">
        <p className="mono-label text-muted-foreground">{t(`${key}Code`)}</p>
        <h1 className="mt-3 text-display-sm">{t(`${key}Title`)}</h1>
        <p className="mt-4 text-muted-foreground">{t(`${key}Help`)}</p>
        <Button asChild size="lg" className="mt-8 min-h-11">
          {isNotFound ? <Link to="/aboutme">{t('notFoundAction')}</Link> : <a href="/">{t('errorAction')}</a>}
        </Button>
      </div>
    </main>
  )
}
