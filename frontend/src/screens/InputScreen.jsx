/**
 * Screen 1: Input Screen
 *
 * UX flow:
 *  - Language toggle: Urdu / English  (drives SpeechRecognition lang + UI direction)
 *  - Mic button: uses Web Speech API, transcribes into textarea
 *  - Textarea: user can also type directly
 *  - "Generate My Website" button → POST /api/business/generate → redirects to /review/:id
 *
 * TODO (Phase 2): wire up API call and Web Speech integration
 */
function InputScreen() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dukaan.ai — Tell Us About Your Business</h1>
      <p style={{ color: '#666' }}>
        [Screen 1 placeholder — language toggle, mic button, textarea, generate button go here]
      </p>
    </div>
  );
}

export default InputScreen;
