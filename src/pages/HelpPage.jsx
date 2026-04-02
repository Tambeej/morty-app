import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';

/**
 * HelpPage — FAQ and support information.
 */
const HelpPage = () => (
  <PageLayout>
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Help & Support</h1>
        <p className="text-text-secondary mt-1">Frequently asked questions and guidance</p>
      </div>

      <div className="space-y-4">
        {[
          {
            q: 'How does Morty analyze my mortgage offer?',
            a: 'Morty uses AI-powered OCR to extract terms from your uploaded PDF or image, then compares them against current market rates and your financial profile to provide personalized recommendations.',
          },
          {
            q: 'Is my financial data secure?',
            a: 'Yes. All data is encrypted in transit (HTTPS) and at rest. We follow GDPR guidelines and Israeli privacy regulations. Your data is never shared with third parties.',
          },
          {
            q: 'What file formats are supported?',
            a: 'We support PDF, PNG, and JPG files up to 5MB. For best results, upload a clear scan or photo of your mortgage offer document.',
          },
          {
            q: 'How long does analysis take?',
            a: 'Most analyses complete within 1-2 minutes. You will see the status update in real-time on your dashboard.',
          },
        ].map((item, i) => (
          <Card key={i}>
            <h3 className="text-sm font-semibold text-text-primary mb-2">{item.q}</h3>
            <p className="text-sm text-text-secondary">{item.a}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Contact Support</h3>
        <p className="text-sm text-text-secondary">
          Need help? Email us at{' '}
          <a href="mailto:support@morty.co.il" className="text-gold hover:text-gold-light transition-colors">
            support@morty.co.il
          </a>
        </p>
      </Card>
    </div>
  </PageLayout>
);

export default HelpPage;
