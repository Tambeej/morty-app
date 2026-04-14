/**
 * GoogleButton component.
 *
 * A styled button for Google OAuth sign-in/sign-up.
 * Follows the universal Google button pattern: white background, dark text,
 * Google multi-color icon. Supports loading state with spinner.
 *
 * Accessibility:
 *   - aria-label on the button
 *   - aria-busy on the button when loading
 *   - Keyboard-navigable (native <button>)
 *   - Focus ring using existing `focus:ring-gold` pattern
 *
 * @param {object}   props
 * @param {function} props.onClick   - Click handler
 * @param {boolean}  [props.loading] - Show spinner and "Connecting..." text
 * @param {boolean}  [props.disabled] - Disable the button
 * @param {string}   [props.label]   - Button label (default: "Continue with Google")
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

/**
 * Google multi-color SVG icon (official brand colors).
 */
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
    />
  </svg>
);

/**
 * GoogleButton — OAuth sign-in button following Google brand guidelines.
 *
 * @param {{ onClick: function, loading?: boolean, disabled?: boolean, label?: string }} props
 */
const GoogleButton = ({
  onClick,
  loading = false,
  disabled = false,
  label,
}) => {
  const { t } = useTranslation();
  const buttonLabel = label || t('google.continue');
  const loadingText = t('google.connecting');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      aria-label={buttonLabel}
      aria-busy={loading}
      className="
        w-full flex items-center justify-center gap-3
        bg-white text-gray-700 font-medium text-sm
        border border-gray-300 rounded-lg px-4 py-2.5
        hover:bg-gray-50 hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-surface
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150 shadow-sm
      "
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        <GoogleIcon />
      )}
      <span>{loading ? loadingText : buttonLabel}</span>
    </button>
  );
};

GoogleButton.propTypes = {
  /** Click handler invoked when the button is pressed */
  onClick: PropTypes.func.isRequired,
  /** When true, shows a spinner and disables the button */
  loading: PropTypes.bool,
  /** When true, disables the button without showing a spinner */
  disabled: PropTypes.bool,
  /** Button label text */
  label: PropTypes.string,
};

export default GoogleButton;
