import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  QrCode, 
  Coins, 
  Users, 
  Award, 
  ExternalLink 
} from 'lucide-react';
import { GradePill } from '@/components/ui/GradePill';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8 sm:py-12 lg:space-y-24">
      <title>{t('brand', 'AI E-Mandi')} | {t('tagline', 'AI-Powered Agricultural Marketplace & Digital Grading')}</title>
      <meta
        name="description"
        content="Connect Indian tomato farmers with wholesale mandi buyers using YOLO-based automated crop grading and verifiable digital certificates."
      />

      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Hero Copy */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-800 dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-300">
              <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>{t('landing.badge', 'Next-Gen Agricultural Commerce • AgriGrade AI')}</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-stone-900 sm:text-5xl lg:text-6xl dark:text-stone-100">
              {t('landing.heroTitle', 'Fair Mandi Prices.')}{' '}
              <span className="text-brand-700 dark:text-brand-400">
                {t('landing.heroSubtitle', 'Verified by Computer Vision.')}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-stone-600 sm:text-lg lg:mx-0 dark:text-stone-300">
              {t('landing.heroDesc', 'AI-Powered E-Mandi bridges Indian tomato farmers directly with wholesale buyers. Snap a photo of your harvest to grade produce, generate verifiable digital certificates, and trade with zero middlemen cuts.')}
            </p>

            {/* Dual Role CTAs */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/register"
                className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-700 px-6 text-base font-bold text-white shadow-md transition-all hover:bg-brand-800 hover:shadow-lg focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <Sparkles className="h-5 w-5" />
                <span>{t('landing.farmerCta', 'Farmer: Sell Harvest')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/buyer/marketplace"
                className="flex h-13 items-center justify-center gap-2 rounded-2xl border-2 border-stone-300 bg-white px-6 text-base font-bold text-stone-800 transition-colors hover:border-brand-500 hover:bg-stone-50 hover:text-brand-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Store className="h-5 w-5" />
                <span>{t('landing.buyerCta', 'Buyer: Browse Lots')}</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-xs font-bold text-stone-600 sm:text-sm dark:text-stone-400">
              <div className="flex items-center justify-center gap-1.5 lg:justify-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t('landing.trustZeroMiddlemen', 'Zero Middlemen')}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 lg:justify-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t('landing.trustYoloScan', 'YOLO Defect Scan')}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 lg:justify-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t('landing.trustVerifiableQr', 'Verifiable QR')}</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-800 dark:bg-stone-900">
              {/* Mock Scan Image with Bounding Boxes */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"
                  alt="Harvest lot with computer vision overlays"
                  className="h-full w-full object-cover"
                />

                {/* Simulated bounding boxes */}
                <div className="absolute top-[20%] left-[25%] flex h-[35%] w-[25%] flex-col justify-between rounded-lg border-2 border-emerald-500 bg-emerald-500/10 p-1">
                  <span className="w-fit rounded bg-emerald-600 px-1 text-[9px] font-black text-white">
                    Fresh 96%
                  </span>
                </div>

                <div className="absolute top-[35%] right-[20%] flex h-[30%] w-[22%] flex-col justify-between rounded-lg border-2 border-emerald-500 bg-emerald-500/10 p-1">
                  <span className="w-fit rounded bg-emerald-600 px-1 text-[9px] font-black text-white">
                    Fresh 94%
                  </span>
                </div>

                <div className="absolute bottom-[15%] left-[40%] flex h-[28%] w-[20%] flex-col justify-between rounded-lg border-2 border-red-500 bg-red-500/15 p-1">
                  <span className="w-fit rounded bg-red-600 px-1 text-[9px] font-black text-white">
                    Defect
                  </span>
                </div>

                {/* Live Grade Badge Floating */}
                <div className="absolute top-3 left-3">
                  <GradePill grade="A" size="md" />
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-800/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t('landing.mockAiCertified', 'AI Certified')}</span>
                </div>
              </div>

              {/* Mock AI Metrics Bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-3 text-center text-xs dark:bg-stone-800/60">
                <div>
                  <span className="block text-stone-500 dark:text-stone-400">{t('landing.mockTotalScanned', 'Total Scanned')}</span>
                  <strong className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {t('landing.mockProduceUnits', '24 Produce')}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-500 dark:text-stone-400">{t('landing.mockHealthy', 'Healthy')}</span>
                  <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {t('landing.mockHealthyUnits', '23 Units')}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-500 dark:text-stone-400">{t('landing.mockDefectRate', 'Defect Rate')}</span>
                  <strong className="text-sm font-bold text-brand-700 dark:text-brand-400">
                    4.1%
                  </strong>
                </div>
              </div>

              {/* QR Verification Mock Bar */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs dark:border-stone-800 dark:bg-stone-800/30">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                  <div>
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      CERT #EM-849201
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      {t('landing.mockSolapurMandi', 'Solapur Mandi • Verified')}
                    </span>
                  </div>
                </div>

                <Link
                  to="/buyer/marketplace"
                  className="font-bold text-brand-700 hover:underline dark:text-brand-400"
                >
                  {t('landing.mockVerifyLive', 'Verify Live')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP "HOW IT WORKS" (Grade -> Certify -> Sell) */}
      <section className="border-y border-stone-200 bg-white py-16 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              {t('landing.howItWorksSubtitle', 'Simple 3-Step Process')}
            </span>
            <h2 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl dark:text-stone-100">
              {t('landing.howItWorksTitle', 'How AI-Powered E-Mandi Works')}
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {t('landing.howItWorksDesc', 'Transforming traditional APMC mandi trade into a verifiable digital ecosystem.')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1: Grade */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-50/60 p-6 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-800/40">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="mt-4 block font-mono text-xs font-black uppercase text-brand-700 dark:text-brand-400">
                  {t('landing.step1Tag', 'Step 01')}
                </span>
                <h3 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t('landing.step1Title', '1. Scan & Grade')}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  {t('landing.step1Desc', 'Farmer captures a harvest photo directly on mobile. Our YOLO neural network instantly detects individual tomatoes, identifies rotten spots, and computes standard defect percentages.')}
                </p>
              </div>

              <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-500">
                  {t('landing.step1Footer', 'Benchmark: Grade A (<10%), B (10-25%), C (>25%)')}
                </span>
              </div>
            </div>

            {/* Step 2: Certify */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-50/60 p-6 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-800/40">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="mt-4 block font-mono text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
                  {t('landing.step2Tag', 'Step 02')}
                </span>
                <h3 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t('landing.step2Title', '2. Certify & Lock')}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  {t('landing.step2Desc', 'A tamper-evident Digital Quality Certificate is minted with a unique ID and QR code. The verified grade is locked by backend logic, preventing misrepresentation and boosting buyer trust.')}
                </p>
              </div>

              <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-500">
                  {t('landing.step2Footer', 'Public verification without logins via /verify/:id')}
                </span>
              </div>
            </div>

            {/* Step 3: Sell */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-50/60 p-6 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-800/40">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <Coins className="h-6 w-6" />
                </div>
                <span className="mt-4 block font-mono text-xs font-black uppercase text-blue-700 dark:text-blue-400">
                  {t('landing.step3Tag', 'Step 03')}
                </span>
                <h3 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t('landing.step3Title', '3. Trade & Settle')}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  {t('landing.step3Desc', 'List the lot in the wholesale marketplace. Buyers place orders with atomic inventory reservation to avoid overselling. Farmer accepts, dispatches, and gets paid fair rates.')}
                </p>
              </div>

              <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-500">
                  {t('landing.step3Footer', 'Transparent orders with real-time status timelines')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY TRUST & ADVANTAGE METRICS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-900 p-8 text-white shadow-xl sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-black sm:text-4xl">
              {t('landing.metricsTitle', 'Engineered for Indian Agricultural Realities')}
            </h2>
            <p className="mt-2 text-sm text-brand-200 sm:text-base">
              {t('landing.metricsDesc', 'Built mobile-first for outdoor mandi environments, low-bandwidth village networks, and regional language preferences.')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            <div className="space-y-1">
              <span className="text-3xl font-black sm:text-4xl">0%</span>
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                {t('landing.metricCommission', 'Broker Commission')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl font-black sm:text-4xl">&lt; 2 MB</span>
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                {t('landing.metricCompressed', 'Client Compressed')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl font-black sm:text-4xl">360 px</span>
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                {t('landing.metricViewport', 'Base Android Viewport')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-3xl font-black sm:text-4xl">100%</span>
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                {t('landing.metricCertificates', 'Verifiable Certificates')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ROLE-BASED VALUE PROPOSITION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* For Farmers */}
          <div className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  {t('landing.farmerWhyTitle', 'Why Farmers Prefer E-Mandi')}
                </h3>
              </div>

              <ul className="mt-6 space-y-3.5 text-sm text-stone-700 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>
                    <strong>{t('landing.farmerAdv1Title', 'Objective Quality Proof:')}</strong>{' '}
                    {t('landing.farmerAdv1Desc', 'No more arbitrary price cuts by local middlemen claiming spoilage. AI inspection gives you hard data.')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>
                    <strong>{t('landing.farmerAdv2Title', 'Direct Wholesale Buyer Reach:')}</strong>{' '}
                    {t('landing.farmerAdv2Desc', 'Connect with institutional buyers, hotel chains, and retail wholesalers across Maharashtra and Gujarat.')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>
                    <strong>{t('landing.farmerAdv3Title', 'Multilingual Interface:')}</strong>{' '}
                    {t('landing.farmerAdv3Desc', 'Full support for Marathi, Hindi, and English with outdoor-readable high-contrast typography.')}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
              <Link
                to="/register"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-white transition-colors hover:bg-brand-800"
              >
                <span>{t('landing.farmerRegisterBtn', 'Register as Farmer')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* For Wholesale Buyers */}
          <div className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-8 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  {t('landing.buyerWhyTitle', 'Why Wholesale Buyers Rely on Us')}
                </h3>
              </div>

              <ul className="mt-6 space-y-3.5 text-sm text-stone-700 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>{t('landing.buyerAdv1Title', 'Zero Lot Rejection Surprises:')}</strong>{' '}
                    {t('landing.buyerAdv1Desc', 'Review defect rates and produce size breakdowns before placing purchase commitments.')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>{t('landing.buyerAdv2Title', 'Atomic Stock Locking:')}</strong>{' '}
                    {t('landing.buyerAdv2Desc', 'When you place an order, inventory is reserved atomically to eliminate out-of-stock race conditions.')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>{t('landing.buyerAdv3Title', 'Verifiable QR Certificates:')}</strong>{' '}
                    {t('landing.buyerAdv3Desc', 'Scan produce batch certificates on dispatch arrival for instant authenticity validation.')}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
              <Link
                to="/buyer/marketplace"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-300 text-sm font-bold text-stone-800 transition-colors hover:border-brand-500 hover:text-brand-700 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <span>{t('landing.buyerExploreBtn', 'Explore Live Produce Lots')}</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-stone-200 bg-stone-100/70 p-8 text-center sm:p-12 lg:flex-row lg:text-left dark:border-stone-800 dark:bg-stone-900/60">
          <div>
            <h2 className="text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
              {t('landing.ctaTitle', 'Ready to modernise your harvest trade?')}
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {t('landing.ctaSubtitle', 'Join hundreds of forward-thinking farmers and wholesale buyers on AI-Powered E-Mandi.')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="flex h-12 items-center justify-center rounded-xl bg-brand-700 px-6 text-sm font-bold text-white shadow-sm hover:bg-brand-800"
            >
              {t('landing.ctaGetStarted', 'Get Started Free')}
            </Link>
            <Link
              to="/buyer/marketplace"
              className="flex h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-6 text-sm font-bold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              {t('landing.ctaMarketplace', 'View Marketplace')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
