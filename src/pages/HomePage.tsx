import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * ────────────────────────────────────────────────────────────────────────
 *  IYF BÉNIN — Page vitrine
 * ────────────────────────────────────────────────────────────────────────
 *  International Youth Fellowship (IYF) est une ONG internationale fondée
 *  en 2001, aujourd'hui présente dans plus de 200 antennes à travers le
 *  monde (Bénin, Côte d'Ivoire, Zambie, Lesotho, Vietnam, Inde...).
 *  Sa mission : former des jeunes leaders à travers l'éducation,
 *  le service communautaire et les échanges interculturels.
 *
 *  Ce fichier est 100% autonome : le style est injecté via une balise
 *  <style> locale (aucune dépendance CSS externe requise), il suffit donc
 *  de déposer ce composant à la racine de vos pages/routes.
 *
 *  📌 À PERSONNALISER avant mise en ligne (repérez "TODO") :
 *     - Coordonnées réelles du siège IYF Bénin (adresse, tél., email)
 *     - Noms des responsables (Coordination nationale / Présidence pays)
 *     - Images du carrousel hero (tableau "heroSlides" plus bas — actuellement
 *       des photos libres de droits Unsplash, à remplacer par vos vraies photos)
 *     - Liens réseaux sociaux
 * ────────────────────────────────────────────────────────────────────────
 */

// TODO: remplacer ces visuels par de vraies photos des activités IYF Bénin
// (camps, cérémonies, actions de salubrité, groupes de jeunes...).
// Chemin conseillé une fois vos photos ajoutées au projet : "/images/hero/xxx.jpg"
const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1600&auto=format&fit=crop',
    alt: 'Jeunes réunis lors d’un camp de leadership IYF',
  },
  {
    src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop',
    alt: 'Action communautaire menée par des volontaires IYF',
  },
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop',
    alt: 'Rencontre interculturelle entre jeunes du réseau IYF',
  },
];

const pillars = [
  {
    n: '01',
    title: 'Mind Education',
    text: "Programmes de formation à la pensée critique et au leadership, dispensés en milieu scolaire et périscolaire pour élargir les horizons des jeunes.",
  },
  {
    n: '02',
    title: 'Service communautaire',
    text: "Actions de salubrité, campagnes de sensibilisation et missions médicales bénévoles au service des communautés locales.",
  },
  {
    n: '03',
    title: 'Échanges internationaux',
    text: "Camps mondiaux et régionaux réunissant des jeunes de dizaines de pays autour du partage culturel et de la fraternité.",
  },
  {
    n: '04',
    title: 'Good News Corps',
    text: "Corps de volontaires engagés dans des missions locales et à l'étranger, au service direct des populations les plus vulnérables.",
  },
  {
    n: '05',
    title: 'Relations institutionnelles',
    text: "Coopération avec les ministères, collectivités et partenaires internationaux pour ancrer durablement nos programmes sur le terrain.",
  },
];

const stats = [
  { value: '2001', label: 'Année de fondation d’IYF dans le monde' },
  { value: '200+', label: 'Antennes IYF réparties sur 5 continents' },
  { value: '1200+', label: 'Jeunes formés au leadership au Bénin' },
  { value: '12', label: 'Années de présence et d’action au Bénin' },
];

const testimonials = [
  {
    quote:
      "IYF se distingue par sa capacité à fédérer les jeunes autour d’un même idéal et à former, avec constance, les leaders de demain.",
    author: 'Vianney HOUANGNI',
    country: 'Participant camp IYF Bénin 2025',
  },
  {
    quote:
      "Les programmes d’échange menés par IYF ont considérablement élargi la vision de nos étudiants et renforcé la coopération entre nos nations.",
    author: 'Joseph ABOU',
    country: 'Participant IYF Côte d’Ivoire 2024',
  },
];

const valueCards = [
  {
    icon: '⚡',
    title: 'Défi',
    text: 'Pousser chaque jeune à repousser ses limites et à imaginer des actions qui changent durablement son milieu.',
  },
  {
    icon: '🌱',
    title: 'Changement',
    text: 'Faire évoluer les mentalités par l’éducation, la discipline personnelle et l’esprit d’initiative.',
  },
  {
    icon: '🤝',
    title: 'Cohésion',
    text: 'Créer une fraternité durable entre jeunes de cultures différentes, unis par des valeurs communes.',
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFeedback, setContactFeedback] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContactFeedback('Message reçu. Merci pour votre intérêt !');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  }

  return (
    <div className="iyf-page">
      <style>{`
        :root {
          --iyf-navy-900: #0a1f38;
          --iyf-navy-800: #0f2b4c;
          --iyf-navy-700: #163a63;
          --iyf-gold-500: #c8983f;
          --iyf-gold-300: #e3c179;
          --iyf-cream-050: #f8f6f1;
          --iyf-ink-900: #14181f;
          --iyf-slate-600: #5b6472;
          --iyf-slate-400: #8b93a1;
          --iyf-line: rgba(10, 31, 56, 0.10);
          --iyf-radius: 14px;
          --iyf-shadow: 0 20px 45px -25px rgba(10, 31, 56, 0.35);
        }

        .iyf-page {
          --font-display: 'Fraunces', 'Georgia', serif;
          --font-body: 'Inter', 'Segoe UI', sans-serif;
          font-family: var(--font-body);
          color: var(--iyf-ink-900);
          background: var(--iyf-cream-050);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .iyf-page * { box-sizing: border-box; }

        .iyf-page h1, .iyf-page h2, .iyf-page h3 {
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--iyf-navy-900);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .iyf-page p { margin: 0; }

        .iyf-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--iyf-gold-500);
        }
        .iyf-eyebrow::before {
          content: '';
          width: 22px;
          height: 1.5px;
          background: var(--iyf-gold-500);
        }

        .iyf-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 28px;
        }

        /* ── HEADER ─────────────────────────────────────────────── */
        .iyf-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(248, 246, 241, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--iyf-line);
        }
        .iyf-header-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .iyf-logo { display: flex; align-items: center; gap: 12px; }
        .iyf-logo-mark {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          overflow: hidden;
          display: block;
          flex-shrink: 0;
          background: white;
          border: 1px solid rgba(10, 31, 56, 0.12);
        }
        .iyf-logo-mark img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .iyf-logo strong {
          display: block;
          font-family: var(--font-display);
          font-size: 16.5px;
          color: var(--iyf-navy-900);
          font-weight: 700;
          line-height: 1.15;
        }
        .iyf-logo span {
          display: block;
          font-size: 11.5px;
          color: var(--iyf-slate-600);
          letter-spacing: 0.03em;
        }

        .iyf-nav {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .iyf-menu-toggle {
          display: none;
          border: none;
          background: transparent;
          padding: 10px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-direction: column;
        }
        .iyf-menu-toggle span {
          display: block;
          width: 26px;
          height: 2.5px;
          background: var(--iyf-ink-900);
          border-radius: 999px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .iyf-nav.open .iyf-menu-toggle span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }
        .iyf-nav.open .iyf-menu-toggle span:nth-child(2) {
          opacity: 0;
        }
        .iyf-nav.open .iyf-menu-toggle span:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }
        .iyf-nav-links {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          align-items: center;
        }
        .iyf-nav a {
          font-size: 14px;
          font-weight: 500;
          color: var(--iyf-ink-900);
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.15s ease;
        }
        .iyf-nav a:hover { opacity: 1; }

        .iyf-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          white-space: nowrap;
        }
        .iyf-btn-primary {
          background: var(--iyf-navy-900);
          color: #fff;
        }
        .iyf-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -10px rgba(10, 31, 56, 0.55);
        }
        .iyf-btn-gold {
          background: var(--iyf-gold-500);
          color: var(--iyf-navy-900);
        }
        .iyf-btn-gold:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -10px rgba(200, 152, 63, 0.55);
        }
        .iyf-btn-ghost {
          background: transparent;
          border-color: rgba(255,255,255,0.35);
          color: #fff;
        }
        .iyf-btn-ghost:hover { background: rgba(255,255,255,0.08); }

        /* ── HERO ───────────────────────────────────────────────── */
        .iyf-hero {
          position: relative;
          background: var(--iyf-navy-900);
          overflow: hidden;
          padding: 96px 0 0;
        }
        .iyf-hero-slides {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .iyf-hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.1s ease;
        }
        .iyf-hero-slide.is-active { opacity: 1; }
        .iyf-hero-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .iyf-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(10,31,56,0.88) 0%, rgba(10,31,56,0.80) 45%, rgba(10,31,56,0.94) 100%),
            radial-gradient(circle at 18% 20%, rgba(22,58,99,0.55), transparent 55%);
        }
        .iyf-hero-network {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          pointer-events: none;
        }
        .iyf-hero-dots {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 9px;
          margin-top: 8px;
        }
        .iyf-hero-dots button {
          width: 26px;
          height: 3px;
          border-radius: 2px;
          border: none;
          background: rgba(255,255,255,0.28);
          padding: 0;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .iyf-hero-dots button.is-active { background: var(--iyf-gold-300); }
        .iyf-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 28px 90px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: center;
        }
        .iyf-hero h1 {
          color: #fff;
          font-size: clamp(34px, 4.4vw, 52px);
          line-height: 1.08;
          margin: 18px 0 20px;
        }
        .iyf-hero-text {
          color: rgba(255,255,255,0.78);
          font-size: 16.5px;
          max-width: 480px;
          margin-bottom: 34px;
        }
        .iyf-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

        .iyf-hero-panel {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: var(--iyf-radius);
          padding: 28px;
          backdrop-filter: blur(6px);
        }
        .iyf-hero-panel-quote {
          font-family: var(--font-display);
          font-size: 18px;
          color: #fff;
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .iyf-hero-panel-sign {
          font-size: 13px;
          color: var(--iyf-gold-300);
          font-weight: 600;
        }
        .iyf-hero-panel-sign span {
          display: block;
          color: rgba(255,255,255,0.55);
          font-weight: 400;
          margin-top: 2px;
        }

        .iyf-stat-strip {
          position: relative;
          background: var(--iyf-navy-900);
          border-top: 1px solid rgba(255,255,255,0.10);
        }
        .iyf-stat-grid {
          max-width: 1160px;
          margin: 0 auto;
          padding: 30px 28px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .iyf-stat-grid strong {
          display: block;
          font-family: var(--font-display);
          font-size: 30px;
          color: var(--iyf-gold-300);
        }
        .iyf-stat-grid p {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          margin-top: 4px;
        }

        /* ── SECTIONS GÉNÉRIQUES ────────────────────────────────── */
        .iyf-section { padding: 96px 0; }
        .iyf-section-alt { background: #fff; }
        .iyf-section-header {
          max-width: 620px;
          margin-bottom: 52px;
        }
        .iyf-section-header h2 {
          font-size: clamp(26px, 3vw, 34px);
          margin-top: 14px;
        }
        .iyf-section-header p {
          margin-top: 16px;
          color: var(--iyf-slate-600);
          font-size: 15.5px;
        }
        .iyf-section-header.center {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        /* Vision / Mission / Valeurs */
        .iyf-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .iyf-value-card {
          border: 1px solid var(--iyf-line);
          border-radius: var(--iyf-radius);
          padding: 30px 26px;
          background: var(--iyf-cream-050);
          min-height: 260px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .iyf-value-card h3 {
          font-size: 19px;
          margin-bottom: 10px;
        }
        .iyf-value-card p {
          color: var(--iyf-slate-600);
          font-size: 14.5px;
          line-height: 1.7;
          flex: 1;
        }
        .iyf-value-icon {
          width: 46px;
          height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          font-size: 20px;
          background: linear-gradient(135deg, rgba(200, 152, 63, 0.18), rgba(10, 31, 56, 0.10));
          color: var(--iyf-navy-900);
          border: 1px solid rgba(10, 31, 56, 0.08);
        }

        /* Piliers d'action */
        .iyf-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--iyf-line);
          border: 1px solid var(--iyf-line);
          border-radius: var(--iyf-radius);
          overflow: hidden;
        }
        .iyf-pillar {
          background: #fff;
          padding: 32px 28px;
          transition: background 0.15s ease;
        }
        .iyf-pillar:hover { background: var(--iyf-cream-050); }
        .iyf-pillar .iyf-n {
          font-family: var(--font-display);
          font-size: 13px;
          color: var(--iyf-gold-500);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .iyf-pillar h3 {
          font-size: 17.5px;
          margin: 12px 0 10px;
        }
        .iyf-pillar p {
          font-size: 14px;
          color: var(--iyf-slate-600);
        }

        /* Bénin focus */
        .iyf-benin {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 56px;
          align-items: center;
        }
        .iyf-benin-visual {
          border-radius: var(--iyf-radius);
          min-height: 340px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--iyf-shadow);
          background: #f8f6f1;
        }
        .iyf-benin-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .iyf-benin-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10, 31, 56, 0.08), rgba(10, 31, 56, 0.54));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 26px;
          color: #fff;
          text-shadow: 0 18px 40px rgba(0,0,0,0.30);
        }
        .iyf-benin-image-overlay strong {
          display: block;
          font-size: 21px;
          margin-bottom: 8px;
          letter-spacing: 0.01em;
        }
        .iyf-benin-image-overlay span {
          display: block;
          font-size: 14px;
          color: rgba(255,255,255,0.92);
          max-width: 280px;
          line-height: 1.55;
        }
        .iyf-benin-visual .iyf-flag-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 8px;
          display: flex;
        }
        .iyf-benin-visual .iyf-flag-bar span:nth-child(1) { flex: 1; background: #0a7b3e; }
        .iyf-benin-visual .iyf-flag-bar span:nth-child(2) { flex: 1; background: #ffd100; }
        .iyf-benin-visual .iyf-flag-bar span:nth-child(3) { flex: 1; background: #c81f2a; }
        .iyf-benin-badge {
          position: absolute;
          top: 26px; left: 26px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--iyf-gold-300);
        }
        .iyf-benin-caption {
          position: absolute;
          left: 26px; right: 26px; bottom: 26px;
          color: #fff;
          font-family: var(--font-display);
          font-size: 21px;
          line-height: 1.35;
        }
        .iyf-benin-list {
          list-style: none;
          margin: 24px 0 0;
          padding: 0;
          display: grid;
          gap: 14px;
        }
        .iyf-benin-list li {
          display: flex;
          gap: 12px;
          font-size: 14.5px;
          color: var(--iyf-slate-600);
        }
        .iyf-benin-list li::before {
          content: '';
          flex-shrink: 0;
          width: 8px; height: 8px;
          margin-top: 6px;
          border-radius: 50%;
          background: var(--iyf-gold-500);
        }

        /* Témoignages */
        .iyf-testimonials {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .iyf-testimonial {
          border-radius: var(--iyf-radius);
          padding: 32px;
          background: var(--iyf-navy-900);
          color: #fff;
        }
        .iyf-testimonial p.q {
          font-family: var(--font-display);
          font-size: 18px;
          line-height: 1.55;
        }
        .iyf-testimonial .iyf-attr {
          margin-top: 22px;
          font-size: 13px;
          color: var(--iyf-gold-300);
          font-weight: 600;
        }
        .iyf-testimonial .iyf-attr span {
          display: block;
          color: rgba(255,255,255,0.55);
          font-weight: 400;
        }

        /* Contact / CTA */
        .iyf-contact-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 32px;
          align-items: flex-start;
        }
        .iyf-map-card,
        .iyf-contact-card {
          border-radius: var(--iyf-radius);
          overflow: hidden;
          box-shadow: var(--iyf-shadow);
          background: #fff;
          border: 1px solid var(--iyf-line);
        }
        .iyf-map-card iframe {
          width: 100%;
          min-height: 360px;
          border: 0;
          display: block;
        }
        .iyf-contact-card {
          padding: 32px;
        }
        .iyf-contact-card h3 {
          font-size: clamp(24px, 2.4vw, 28px);
          margin-bottom: 16px;
        }
        .iyf-contact-card p {
          color: var(--iyf-slate-600);
          line-height: 1.75;
          margin-bottom: 22px;
        }
        .iyf-form-field {
          display: grid;
          gap: 8px;
          margin-bottom: 18px;
        }
        .iyf-form-field label {
          font-size: 14px;
          font-weight: 600;
          color: var(--iyf-ink-900);
        }
        .iyf-form-field input,
        .iyf-form-field textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(10, 31, 56, 0.14);
          background: #fff;
          padding: 14px 16px;
          font-size: 14px;
          color: var(--iyf-ink-900);
          resize: vertical;
        }
        .iyf-form-field textarea {
          min-height: 140px;
        }
        .iyf-form-response {
          margin-bottom: 20px;
          color: var(--iyf-navy-900);
          font-weight: 600;
        }
        .iyf-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: var(--iyf-navy-900);
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .iyf-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 16px 24px -14px rgba(10, 31, 56, 0.55); }
        .iyf-cta h2 { color: #fff; font-size: 27px; }
        .iyf-cta p { color: rgba(255,255,255,0.72); margin-top: 12px; font-size: 15px; }
        .iyf-contact-grid {
          display: grid;
          gap: 16px;
        }
        .iyf-contact-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .iyf-contact-item .iyf-mark {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.10);
          flex-shrink: 0;
        }
        .iyf-contact-item strong { color: #fff; font-size: 14px; display: block; }
        .iyf-contact-item span { color: rgba(255,255,255,0.6); font-size: 13.5px; }

        /* Footer */
        .iyf-footer {
          border-top: 1px solid var(--iyf-line);
          padding: 40px 0;
        }
        .iyf-footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .iyf-footer p {
          font-size: 13px;
          color: var(--iyf-slate-600);
        }
        .iyf-footer-links { display: flex; gap: 22px; }
        .iyf-footer-links a {
          font-size: 13px;
          color: var(--iyf-slate-600);
          text-decoration: none;
        }
        .iyf-footer-links a:hover { color: var(--iyf-navy-900); }

        /* ── RESPONSIVE ─────────────────────────────────────────── */
        @media (max-width: 920px) {
          .iyf-header-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .iyf-nav {
            width: 100%;
            justify-content: space-between;
          }
          .iyf-menu-toggle {
            display: inline-flex;
          }
          .iyf-nav-links {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            padding: 16px 18px 20px;
            background: rgba(255,255,255,0.96);
            border: 1px solid rgba(10, 31, 56, 0.08);
            border-radius: 18px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, opacity 0.25s ease;
            opacity: 0;
          }
          .iyf-nav.open .iyf-nav-links {
            max-height: 380px;
            opacity: 1;
          }
          .iyf-nav a {
            display: block;
            padding: 10px 0;
          }
          .iyf-hero-inner { grid-template-columns: 1fr; }
          .iyf-hero-panel { order: -1; }
          .iyf-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .iyf-values-grid { grid-template-columns: 1fr; }
          .iyf-pillars { grid-template-columns: 1fr; }
          .iyf-benin { grid-template-columns: 1fr; }
          .iyf-testimonials { grid-template-columns: 1fr; }
          .iyf-contact-section { grid-template-columns: 1fr; }
          .iyf-contact-card { padding: 24px; }
          .iyf-section { padding: 64px 0; }
        }
        @media (max-width: 640px) {
          .iyf-header-inner { padding: 16px; }
          .iyf-logo strong { font-size: 15px; }
          .iyf-logo span { font-size: 11px; }
          .iyf-nav a { font-size: 13px; }
          .iyf-hero { padding-top: 72px; }
          .iyf-hero-inner { gap: 24px; padding-bottom: 48px; }
          .iyf-hero-text { max-width: 100%; font-size: 15px; }
          .iyf-values-grid, .iyf-pillars, .iyf-stat-grid { grid-template-columns: 1fr; }
          .iyf-map-card iframe { min-height: 260px; }
          .iyf-header { position: relative; }
          .iyf-nav { gap: 16px; }
          .iyf-nav-links { padding: 14px 16px 18px; }
        }
        @media (max-width: 640px) {
          .iyf-header-inner { padding: 16px; }
          .iyf-logo strong { font-size: 15px; }
          .iyf-logo span { font-size: 11px; }
          .iyf-nav a { font-size: 13px; }
          .iyf-hero { padding-top: 72px; }
          .iyf-hero-inner { gap: 24px; padding-bottom: 48px; }
          .iyf-hero-text { max-width: 100%; font-size: 15px; }
          .iyf-values-grid, .iyf-pillars, .iyf-stat-grid { grid-template-columns: 1fr; }
          .iyf-map-card iframe { min-height: 260px; }
          .iyf-header { position: relative; }
          .iyf-nav { gap: 16px; }
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="iyf-header">
        <div className="iyf-header-inner">
          <div className="iyf-logo">
            <div className="iyf-logo-mark">
              <img src="/iyf.png" alt="Logo IYF" />
            </div>
            <div>
              <strong>IYF Bénin</strong>
              <span>International Youth Fellowship</span>
            </div>
          </div>

          <nav className={`iyf-nav ${menuOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="iyf-menu-toggle"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="iyf-nav-links">
              <a href="#apropos" onClick={() => setMenuOpen(false)}>À propos</a>
              <a href="#piliers" onClick={() => setMenuOpen(false)}>Nos programmes</a>
              <a href="#benin" onClick={() => setMenuOpen(false)}>IYF au Bénin</a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            </div>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="iyf-hero">
        <div className="iyf-hero-slides">
          {heroSlides.map((slide, i) => (
            <div key={slide.src} className={`iyf-hero-slide${i === activeSlide ? ' is-active' : ''}`}>
              <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
          <div className="iyf-hero-overlay" />
        </div>

        <svg className="iyf-hero-network" viewBox="0 0 1160 620" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <g stroke="rgba(227,193,121,0.28)" strokeWidth="1">
            <line x1="120" y1="120" x2="360" y2="260" />
            <line x1="360" y1="260" x2="640" y2="160" />
            <line x1="640" y1="160" x2="900" y2="280" />
            <line x1="360" y1="260" x2="420" y2="480" />
            <line x1="640" y1="160" x2="760" y2="440" />
            <line x1="900" y1="280" x2="1020" y2="520" />
            <line x1="420" y1="480" x2="760" y2="440" />
          </g>
          <g fill="#e3c179">
            <circle cx="120" cy="120" r="4" opacity="0.6" />
            <circle cx="360" cy="260" r="5" opacity="0.85" />
            <circle cx="640" cy="160" r="4" opacity="0.6" />
            <circle cx="900" cy="280" r="5" opacity="0.85" />
            <circle cx="420" cy="480" r="4" opacity="0.6" />
            <circle cx="760" cy="440" r="6" opacity="1" />
            <circle cx="1020" cy="520" r="4" opacity="0.6" />
          </g>
        </svg>

        <div className="iyf-hero-inner">
          <div>
            <span className="iyf-eyebrow">ONG internationale — Fondée en 2001</span>
            <h1>Former les jeunes leaders qui transformeront le Bénin de demain.</h1>
            <p className="iyf-hero-text">
              IYF Bénin accompagne la jeunesse à travers l'éducation, le service communautaire
              et les échanges interculturels, au sein d'un réseau présent dans plus de 200 pays.
            </p>
            <div className="iyf-hero-actions">
              <Link to="#" className="iyf-btn iyf-btn-gold">
                Accéder à l'espace inscription
              </Link>
              <a href="#contact" className="iyf-btn iyf-btn-ghost">
                Nous contacter
              </a>
              
            </div>

            <div className="iyf-hero-dots">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Afficher l'image ${i + 1}`}
                  className={i === activeSlide ? 'is-active' : ''}
                  onClick={() => setActiveSlide(i)}
                />
              ))}
            </div>
          </div>

          <div className="iyf-hero-panel">
            <p className="iyf-hero-panel-quote">
              « Un vrai leader n'est pas seulement celui qui dirige, mais celui qui vit pour les
              autres et leur apporte un changement véritable. »
            </p>
            <p className="iyf-hero-panel-sign">
              Philosophie IYF
              <span>Partagée dans l'ensemble des antennes du réseau mondial</span>
            </p>
          </div>
        </div>
      </section>

      <div className="iyf-stat-strip">
        <div className="iyf-stat-grid">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── À PROPOS ───────────────────────────────────────── */}
      <section id="apropos" className="iyf-section">
        <div className="iyf-container">
          <div className="iyf-section-header center">
            <span className="iyf-eyebrow" style={{ justifyContent: 'center' }}>Vision · Mission · Valeurs</span>
            <h2>Une organisation dédiée à la jeunesse engagée</h2>
            <p>
              IYF définit une nouvelle approche du leadership : former des jeunes capables
              d'élargir leurs horizons, de dépasser leurs limites et de mettre leurs compétences
              au service des autres.
            </p>
          </div>

          <div className="iyf-values-grid">
            {valueCards.map((card) => (
              <div className="iyf-value-card" key={card.title}>
                <div className="iyf-value-icon" aria-hidden="true">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILIERS ────────────────────────────────────────── */}
      <section id="piliers" className="iyf-section iyf-section-alt">
        <div className="iyf-container">
          <div className="iyf-section-header">
            <span className="iyf-eyebrow">Nos programmes</span>
            <h2>Cinq piliers d'action, un seul objectif</h2>
            <p>
              Chaque programme IYF répond à un même but : préparer des jeunes leaders à impact
              global, capables de proposer des solutions concrètes aux défis de leur époque.
            </p>
          </div>

          <div className="iyf-pillars">
            {pillars.map((p) => (
              <div className="iyf-pillar" key={p.n}>
                <span className="iyf-n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IYF AU BÉNIN ───────────────────────────────────── */}
      <section id="benin" className="iyf-section">
        <div className="iyf-container">
          <div className="iyf-benin">
            <div className="iyf-benin-visual">
              <img src="/centre.png" alt="Centre IYF" className="iyf-benin-image" />
              <div className="iyf-benin-image-overlay">
                <strong>Centre IYF</strong>
                <span>Un centre construit pour accompagner la jeunesse béninoise et soutenir l'ancrage local durable.</span>
              </div>
            </div>

            <div>
              <span className="iyf-eyebrow">Ancrage local</span>
              <h2 style={{ marginTop: 14, fontSize: 'clamp(24px, 3vw, 30px)' }}>
                Une présence engagée sur le terrain, au Bénin
              </h2>
              <p style={{ marginTop: 16, color: 'var(--iyf-slate-600)', fontSize: 15.5 }}>
                Depuis plusieurs années, IYF Bénin conduit des actions de formation, de
                sensibilisation et de service communautaire au bénéfice direct de la jeunesse
                locale, en lien avec le réseau international IYF.
              </p>
              <ul className="iyf-benin-list">
                <li>Un centre construit pour encourager les jeunes à grandir ensemble</li>
                <li>Des formations ancrées dans le contexte local béninois</li>
                <li>Des espaces de partage, d'orientation et d'accompagnement</li>
                <li>Une action coordonnée avec les écoles et les leaders communautaires</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ────────────────────────────────────── */}
      <section className="iyf-section iyf-section-alt">
        <div className="iyf-container">
          <div className="iyf-section-header">
            <span className="iyf-eyebrow">Reconnaissance internationale</span>
            <h2>Ce qu'en disent nos partenaires institutionnels</h2>
          </div>
          <div className="iyf-testimonials">
            {testimonials.map((t) => (
              <div className="iyf-testimonial" key={t.author}>
                <p className="q">"{t.quote}"</p>
                <p className="iyf-attr">
                  {t.author}
                  <span>{t.country}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA ──────────────────────────────────── */}
      <section id="contact" className="iyf-section">
        <div className="iyf-container">
          <div className="iyf-stack" style={{ display: 'grid', gap: '34px' }}>
            <div>
              <span className="iyf-eyebrow">Rejoignez-nous</span>
              <h2 style={{ marginTop: 14, fontSize: 'clamp(28px, 3.1vw, 34px)' }}>
                Découvrez notre centre et envoyez-nous un message
              </h2>
              <p style={{ marginTop: 18, color: 'var(--iyf-slate-600)', maxWidth: 720, fontSize: 15.5 }}>
                Nous sommes là pour accompagner les jeunes, les familles et les partenaires qui souhaitent
                contribuer à la transformation sociale par l’éducation, le volontariat et le leadership.
              </p>
            </div>
            <div className="iyf-contact-section">
              <div className="iyf-map-card">
                <iframe
                  title="Localisation du centre IYF"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=2.3613%2C6.3787%2C2.3898%2C6.4001&layer=mapnik&marker=6.3894%2C2.3756"
                  loading="lazy"
                />
              </div>
              <div className="iyf-contact-card">
                <h3>Laissez un message</h3>
                <p>Remplissez ce formulaire et vous verrez une confirmation instantanée sur la page.</p>
                {contactFeedback && <div className="iyf-form-response">{contactFeedback}</div>}
                <form onSubmit={(e: FormEvent<HTMLFormElement>) => handleContactSubmit(e)}>
                  <div className="iyf-form-field">
                    <label htmlFor="contact-name">Nom complet</label>
                    <input
                      id="contact-name"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div className="iyf-form-field">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="exemple@mail.com"
                      required
                    />
                  </div>
                  <div className="iyf-form-field">
                    <label htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Votre message ici"
                      required
                    />
                  </div>
                  <button type="submit" className="iyf-submit-btn">Envoyer le message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="iyf-footer">
        <div className="iyf-container iyf-footer-inner">
          <p>© {new Date().getFullYear()} IYF Bénin — International Youth Fellowship. Tous droits réservés.</p>
          <div className="iyf-footer-links">
            <a href="#apropos">À propos</a>
            <a href="#piliers">Programmes</a>
            <a href="#benin">IYF au Bénin</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}