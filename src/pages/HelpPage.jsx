/**
 * Help Page
 * FAQ and support information
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';

const FAQ_ITEMS = [
  {
    question: 'How does Morty analyze my mortgage offer?',
    answer:
      'Morty uses advanced AI (OCR + GPT-4) to extract terms from your uploaded PDF or image, then compares them against current market rates and your financial profile to provide personalized recommendations.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes. All data is encrypted in transit (HTTPS) and at rest. We use JWT authentication, and your financial data is never shared with third parties. We comply with Israeli privacy regulations.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF, PNG, and JPG files up to 5MB. For best results, upload a clear scan or photo of your mortgage offer document.',
  },
  {
    question: 'How accurate is the analysis?',
    answer:
      'Our AI achieves 95%+ accuracy on standard Israeli bank mortgage documents. Always verify the extracted terms against your original document before making financial decisions.',
  },
  {
    question: 'Can I upload multiple offers for comparison?',
    answer:
      'Yes! Upload offers from multiple banks and Morty will compare them side-by-side, helping you identify the best deal.',
  },
];

function HelpPage() {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState(null);

  return (
    <PageLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Help & FAQ</h1>
          <p className="text-text-secondary mt-1">Answers to common questions about Morty</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <Card key={index}>
              <button
                className="flex items-center justify-between w-full text-left rtl:text-right"
                onClick={() => setOpenItem(openItem === index ? null : index)}
                aria-expanded={openItem === index}
              >
                <span className="font-medium text-text-primary pr-4">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 ${
                    openItem === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openItem === index && (
                <p className="mt-3 text-text-secondary text-sm leading-relaxed">{item.answer}</p>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <h2 className="font-semibold text-text-primary mb-2">Need more help?</h2>
          <p className="text-text-secondary text-sm mb-4">
            Contact our support team and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:support@morty.co.il"
            className="text-gold hover:text-gold-light font-medium text-sm"
          >
            support@morty.co.il
          </a>
        </Card>
      </div>
    </PageLayout>
  );
}

export default HelpPage;
