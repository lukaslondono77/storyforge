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
    welcome: (name) => `Welcome, ${name}`,
    dash_sub: "Here's how your stories are performing.",
    new_story: "Write a story",
    stat_published: "Published",
    stat_paid: "Paid Stories",
    your_stories: "Your Stories",
    empty_dashboard: "Nothing here yet.",
    empty_dashboard_sub: "Your published stories will appear here.",
    write_first: "Write your first story",
    col_title: "Title",
    col_category: "Category",
    col_tier: "Tier",
    col_reads: "Reads",
    col_subs: "Subs",
    view: "View",
    earn_nudge_title: "Ready to earn?",
    earn_nudge_body: "Set a story to paid to start earning.",
    set_paid: "Monetize",
    stat_likes: "Likes",
    btn_follow: "Subscribe for free",
    btn_following: "Subscribed",
    sign_in_to_interact: "Sign in to interact",
    plans_title: "Support the stories that move you.",
    plans_sub: "Your subscription goes directly to independent writers building worlds worth disappearing into.",
    most_popular: "MOST POPULAR",
    per_month: "/month",
    plan_current: "Current Plan",
    plan_free_name: "Free",
    plan_free_price: "Free",
    plan_free_desc: "Access free-tier stories and first chapters.",
    plan_free_f1: "Read all free stories",
    plan_free_f2: "Read first chapters of paid stories",
    plan_free_f3: "Follow your favorite authors",
    plan_pass_name: "Story Pass",
    plan_pass_desc: "Unlock all paid stories, unlimited reading.",
    plan_pass_f1: "Everything in Free",
    plan_pass_f2: "Unlock all paid stories",
    plan_pass_f3: "Unlimited reading",
    plan_pass_f4: "Support the platform",
    plan_pass_cta: "Get Story Pass",
    plan_patron_name: "Patron",
    plan_patron_desc: "Everything + support authors directly, early chapters.",
    plan_patron_f1: "Everything in Story Pass",
    plan_patron_f2: "Support authors directly",
    plan_patron_f3: "Early access to new chapters",
    plan_patron_f4: "Exclusive Q&A",
    plan_patron_cta: "Become a Patron",
    all_plans_include: "All plans include:",
    perk1: "No ads, ever",
    perk2: "Cancel anytime",
    perk3: "New stories weekly",
    perk4: "Author Q&A access",
  },
  es: {
    story_not_found: "Historia no encontrada.",
    back_btn: "← Volver",
    written_by: "Escrito por",
    tier_free: "Gratis",
    tier_paid: "De pago",
    edit: "Editar",
    stat_reads: "Lecturas",
    stat_subs: "Suscriptores",
    stat_likes: "Me gusta",
    btn_follow: "Suscribirse gratis",
    btn_following: "Suscrito",
    sign_in_to_interact: "Inicia sesión para interactuar",
    paywall_title: "Esta historia es para suscriptores",
    paywall_cta: "Ver planes de suscripción",
    paywall_signin: "Inicia sesión si ya estás suscrito",
    plans_title: "Apoya las historias que te mueven.",
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");
  
  const t = (key, arg) => {
    const val = translations[lang]?.[key] || key;
    if (typeof val === "function") return val(arg);
    return val;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext) || { t: k => k };
