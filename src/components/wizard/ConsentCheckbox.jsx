import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * ConsentCheckbox - mandatory consent for anonymous data storage.
 * Includes a privacy details modal.
 */

export default function ConsentCheckbox() {
  const { inputs, updateInput } = useWizard();
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    updateInput('consent', e.target.checked);
  };

  return (
    <>
      <div className="mb-4 p-4 rounded-lg border border-border bg-surface" dir="rtl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inputs.consent}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 rounded border-border text-primary
              focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 cursor-pointer flex-shrink-0"
            aria-describedby="consent-description"
          />
          <span id="consent-description" className="text-sm text-text2 leading-relaxed">
            אני מאשר/ת ל-Morty לשמור את נתוני ההצעה שלי (באופן אנונימי) לשיפור המערכת.{' '}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-primary underline hover:text-primary/80 transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded"
              aria-label="קרא עוד על מדיניות הפרטיות"
            >
              קרא עוד
            </button>
          </span>
        </label>
      </div>

      {/* Privacy Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10" dir="rtl">
            <h3 id="privacy-modal-title" className="text-lg font-semibold text-text1 mb-4">
              מדיניות פרטיות — שמירת נתונים אנונימיים
            </h3>
            <div className="text-sm text-text2 space-y-3 leading-relaxed">
              <p>
                Morty שומרת נתונים <strong>אנונימיים לחלוטין</strong> — ללא שם, כתובת, מספר טלפון או כל מידע מזהה.
              </p>
              <p>
                הנתונים שנשמרים כוללים: טווחי מחיר נכס, טווחי הכנסה, ותנאי הלוואה — כולם מעוגלים לטווחים כלליים.
              </p>
              <p>
                מידע זה משמש אך ורק לשיפור ההמלצות לכלל המשתמשים ולזיהוי הצעות טובות מבנקים ספציפיים.
              </p>
              <p>
                ניתן לבטל את ההסכמה בכל עת על ידי יצירת קשר עם{' '}
                <a href="mailto:privacy@morty.co.il" className="text-primary underline">privacy@morty.co.il</a>.
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium
                hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              הבנתי, סגור
            </button>
          </div>
        </div>
      )}
    </>
  );
}
