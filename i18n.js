// Language is independent from lesson progress and user-authored notes.
const LANGUAGE_KEY = 'infra-lab-language';
function initialLanguage() {
  const requested = new URLSearchParams(location.search).get('lang');
  if (requested === 'en' || requested === 'zh') return requested;
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch { /* A blocked storage API must not prevent learning. */ }
  return 'en';
}
let lang = initialLanguage();
function t(chinese) {
  if (lang === 'en') return EN[chinese] ?? chinese;
  return chinese.replace(/\\n/g, '&#10;');
}
function translateData(value) {
  if (typeof value === 'string') return t(value);
  if (Array.isArray(value)) return value.map(translateData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateData(item)]));
  }
  return value;
}
let MODULES, LESSONS;
function refreshLanguage() {
  MODULES = translateData(MODULES_ZH);
  LESSONS = translateData(LESSONS_ZH);
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.title = lang === 'en'
    ? 'Infra Lab — Bring your systems intuition into AI'
    : 'Infra Lab — 把系统直觉带进 AI';
  document.querySelector('meta[name="description"]').content = lang === 'en'
    ? 'Interactive AI infrastructure lessons for software engineers: memory, inference, scheduling, and capacity planning.'
    : '从软件工程师到 AI 基础设施工程师：通过可调参实验、工程场景和知识检验，理解 LLM 推理与系统。';
}
function setLanguage(next) {
  if (!['en', 'zh'].includes(next) || next === lang) return;
  const scrollPosition = window.scrollY;
  lang = next;
  try { localStorage.setItem(LANGUAGE_KEY, lang); } catch { /* Session selection still works. */ }
  // Keep shareable ?lang= links consistent with the user's selection.
  try {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  } catch { /* Some file:// environments restrict history writes. */ }
  refreshLanguage();
  render();
  window.scrollTo(0, scrollPosition);
  document.querySelector(`[data-language="${lang}"]`)?.focus({ preventScroll: true });
}
refreshLanguage();
