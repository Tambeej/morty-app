import React from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';

/**
 * HelpPage — FAQ and support information.
 */
const HelpPage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('help.title')}</h1>
          <p className="text-text-secondary mt-1">{t('help.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {t('help.faq', { returnObjects: true }).map((item, i) => (
            <Card key={i}>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{item.q}</h3>
              <p className="text-sm text-text-secondary">{item.a}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">{t('help.contact.title')}</h3>
          <p className="text-sm text-text-secondary">
            {t('help.contact.text')}{' '}
            <a href={`mailto:${t('help.contact.email')}`} className="text-gold hover:text-gold-light transition-colors">
              {t('help.contact.email')}
            </a>
          </p>
        </Card>
      </div>
    </PageLayout>
  );
};

export default HelpPage;
