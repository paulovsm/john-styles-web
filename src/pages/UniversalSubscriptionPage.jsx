import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowBack, ArrowOutward, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useDocumentMeta from '../hooks/useDocumentMeta';
import JohnSignature from '../components/common/JohnSignature';

const CONTACT_EMAIL = 'contato@fleekauthority.com';

export default function UniversalSubscriptionPage() {
    const { t } = useTranslation();
    const subject = encodeURIComponent(t('experienceV2.subscriptionConcept.emailSubject'));

    useDocumentMeta({
        title: t('experienceV2.subscriptionConcept.metaTitle'),
        description: t('experienceV2.subscriptionConcept.description'),
        image: '/experience-v2/universal-occasions.webp',
        canonical: '/teste-novo-app/assinatura',
    });

    const hypotheses = ['curation', 'rhythm', 'circulation'];

    return (
        <div className="min-h-screen bg-white-off text-grey-dark">
            <header className="border-b border-grey-light bg-white-off">
                <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-display text-lg font-extrabold text-brand-navy">
                        <img src="/FA_Icon_White.avif" alt="" className="h-8 w-8 invert dark:invert-0" />
                        Fleek Authority
                    </Link>
                    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-grey-dark hover:opacity-65">
                        <ArrowBack fontSize="small" aria-hidden="true" />
                        {t('experienceV2.subscriptionConcept.back')}
                    </Link>
                </div>
            </header>

            <main id="main-content" tabIndex={-1}>
                <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-24">
                    <div>
                        <JohnSignature compact className="mb-6" />
                        <span className="inline-flex rounded-full border border-control-border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-gold-dark">
                            {t('experienceV2.subscriptionConcept.badge')}
                        </span>
                        <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-brand-navy sm:text-6xl">
                            {t('experienceV2.subscriptionConcept.title')}
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-grey-medium">
                            {t('experienceV2.subscriptionConcept.description')}
                        </p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}
                            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded bg-brand-navy px-6 text-sm font-extrabold uppercase tracking-[0.045em] text-white-pure hover:opacity-85"
                        >
                            {t('experienceV2.subscriptionConcept.cta')}
                            <ArrowOutward fontSize="small" aria-hidden="true" />
                        </a>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white-sunken">
                        <img
                            src="/experience-v2/universal-occasions.webp"
                            alt={t('experienceV2.occasions.imageAlt')}
                            width="1536"
                            height="1024"
                            className="min-h-[420px] w-full object-cover object-center lg:min-h-[620px]"
                        />
                    </div>
                </section>

                <section className="bg-brand-navy py-16 text-white-pure lg:py-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white-pure/70">
                            {t('experienceV2.subscriptionConcept.hypothesesKicker')}
                        </p>
                        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                            {t('experienceV2.subscriptionConcept.hypothesesTitle')}
                        </h2>
                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {hypotheses.map((item) => (
                                <article key={item} className="rounded-card border border-white-pure/20 bg-white-pure/5 p-6">
                                    <Check aria-hidden="true" />
                                    <h3 className="mt-8 text-xl font-semibold">
                                        {t(`experienceV2.subscriptionConcept.hypotheses.${item}.title`)}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-white-pure/70">
                                        {t(`experienceV2.subscriptionConcept.hypotheses.${item}.description`)}
                                    </p>
                                </article>
                            ))}
                        </div>
                        <p className="mt-8 max-w-3xl text-sm leading-6 text-white-pure/70">
                            {t('experienceV2.subscriptionConcept.disclaimer')}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
