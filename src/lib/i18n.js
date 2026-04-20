import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    story_not_found: "Story not found.",
    back_btn: "← Back",
    written_by: "Written by",
    tier_free: "Free",
    tier_paid: "Paid",
    edit: "Edit story",
    stat_reads: "Reads",
    stat_subs: "Subscribers",
    paywall_title: "This story is for subscribers",
    paywall_cta: "See subscription plans",
    paywall_signin: "Sign in if you already subscribe",
    register_title: "Create an Account",
    register_sub: "Join StoryForge and start writing.",
    lbl_name: "Name",
    lbl_email: "Email Address",
    lbl_password: "Password",
    lbl_pref_lang: "Preferred Language",
    publishing: "Registering...",
    create_account: "Create Account",
    free_forever: "Free forever for writers.",
    already_account: "Already have an account?",
    sign_in_link: "Sign in",
    login_title: "Welcome Back",
    login_sub: "Sign in to your account.",
    loading: "Loading...",
    sign_in: "Sign In",
    no_account: "Don't have an account?",
    sign_up: "Sign up",
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");
  
  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext) || { t: k => k };
