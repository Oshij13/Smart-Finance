import { useState } from "react";
import { PageShell, PageHeader } from "../components/page/PageShell";
import { BookOpen, Headphones, Mail, Youtube, Globe } from "lucide-react";

const tabs = [
  { id: "books", label: "Books", icon: BookOpen },
  { id: "podcasts", label: "Podcasts", icon: Headphones },
  { id: "newsletters", label: "Newsletters", icon: Mail },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "platforms", label: "Platforms", icon: Globe },
] as const;

const data: Record<string, { title: string; by?: string; tag?: string; text: string }[]> = {
  books: [
    { title: "Let's Talk Money", by: "Monika Halan", tag: "Beginner", text: "Essential India-specific guide to personal finance covering everything from insurance to investments." },
    { title: "The Psychology of Money", by: "Morgan Housel", tag: "Mindset", text: "Timeless lessons on wealth, greed, and happiness. Focuses on behavior over formulas." },
    { title: "Rich Dad Poor Dad", by: "Robert Kiyosaki", tag: "Wealth", text: "Classic book on building wealth through assets and financial literacy." },
    { title: "Your Money or Your Life", by: "Vicki Robin", tag: "Independence", text: "Transform your relationship with money and achieve financial independence." },
    { title: "The Intelligent Investor", by: "Benjamin Graham", tag: "Advanced", text: "The definitive book on value investing. A must-read for serious investors." },
    { title: "I Will Teach You to Be Rich", by: "Ramit Sethi", tag: "Practical", text: "No-nonsense guide to personal finance for young professionals." },
  ],
  podcasts: [
    { title: "Paisa Vaisa", by: "IVM Podcasts", tag: "Weekly", text: "Weekly discussions on personal finance, markets, and money management in India." },
    { title: "The Seen and the Unseen", by: "Amit Varma", tag: "Weekly", text: "Deep dive into economics, policy, and society. Financial literacy through stories." },
    { title: "Capitalmind Podcast", by: "Deepak Shenoy", tag: "Bi-weekly", text: "Indian markets, investing strategies, and economic analysis." },
    { title: "BiggerPockets Money Podcast", by: "Mindy Jensen & Scott Trench", tag: "Weekly", text: "Financial independence and wealth building strategies." },
    { title: "ChooseFI", by: "Jonathan Mendonsa & Brad Barrett", tag: "3x Weekly", text: "Achieve financial independence through optimized saving and investing." },
  ],
  newsletters: [
    { title: "Finshots", tag: "Daily News", text: "Daily 3-minute newsletter breaking down financial news in simple language. (finshots.in)" },
    { title: "Morning Context", tag: "Deep Analysis", text: "In-depth analysis of Indian business, economy, and policy. (themorningcontext.com)" },
    { title: "The Ken", tag: "Investigative", text: "Long-form stories on technology, business, and finance in India. (the-ken.com)" },
    { title: "Capitalmind", tag: "Market Analysis", text: "Indian markets, stocks, and investment research. (capitalmind.in)" },
    { title: "Substack Finance Writers", tag: "Personal Finance", text: "Follow independent finance writers like Morgan Housel, Ben Carlson, and more. (substack.com)" },
  ],
  youtube: [
    { title: "Zerodha Varsity", tag: "Stock Market", text: "Free educational content on trading, investing, and financial markets." },
    { title: "CA Rachana Ranade", tag: "Investment", text: "Stock market basics, technical analysis, and investment strategies in Hindi & English." },
    { title: "Labour Law Advisor", tag: "Financial Planning", text: "Financial planning, mutual funds, insurance, and tax planning." },
    { title: "Pranjal Kamra", tag: "Youth Finance", text: "Personal finance, investing concepts, and money management for millennials." },
    { title: "The Plain Bagel", tag: "Finance Basics", text: "Financial concepts explained simply without jargon." },
    { title: "Ben Felix", tag: "Research-Based", text: "Evidence-based investing advice with academic research backing." },
  ],
  platforms: [
    { title: "Zerodha Varsity", tag: "Learning", text: "Comprehensive free modules on stocks, derivatives, personal finance, and more. (zerodha.com/varsity)" },
    { title: "NCFE", tag: "Government", text: "National Centre for Financial Education - Government-backed financial literacy resources and tools. (ncfe.org.in)" },
    { title: "Investopedia", tag: "Encyclopedia", text: "World's largest financial education website with detailed guides and definitions. (investopedia.com)" },
    { title: "Freefincal", tag: "Blog & Tools", text: "Independent financial planning blog with calculators and DIY guides. (freefincal.com)" },
  ],
};

const path = [
  { phase: "Foundation (Weeks 1–4)", desc: "Read 'Let's Talk Money', subscribe to Finshots, watch Zerodha Varsity basics." },
  { phase: "Building Knowledge (Months 2–3)", desc: "Listen to Paisa Vaisa, follow CA Rachana Ranade, implement budgeting." },
  { phase: "Advanced Learning (Months 4–6)", desc: "Read 'Psychology of Money', explore Capitalmind, start SIPs." },
  { phase: "Mastery (Ongoing)", desc: "Deep-dive into 'The Intelligent Investor', specialize, teach others." },
];

const tips = [
  { title: "Consistency over intensity", text: "15 minutes daily beats 2 hours once a week." },
  { title: "Apply immediately", text: "Don't just consume. Set up that SIP, calculate that tax." },
  { title: "Avoid analysis paralysis", text: "Don't wait to know everything. Start with basics." },
];

export function Resources() {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("books");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Library"
        title="Learning resources"
        description="A curated set of books, podcasts and newsletters."
      />

      <div className="rounded-2xl border hairline bg-card p-1 grid grid-cols-2 md:grid-cols-5 gap-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border hairline bg-card divide-y divide-border overflow-hidden">
        {data[tab].map((item) => (
          <div key={item.title} className="px-5 py-5 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-gray-900">{item.title}</p>
              {item.by && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">by {item.by}</p>}
              <p className="text-xs text-gray-500 font-medium mt-1.5 leading-relaxed">{item.text}</p>
            </div>
            {item.tag && (
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-full shrink-0">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="space-y-1 px-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Process</p>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Recommended Path</h2>
        </div>
        <div className="rounded-2xl border hairline bg-card divide-y divide-border overflow-hidden">
          {path.map((p, i) => (
            <div key={p.phase} className="px-5 py-5 flex gap-5 hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900">{p.phase}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1 px-1">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-left">Advice</p>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Pro Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {tips.map((t) => (
            <div key={t.title} className="p-6 bg-white border hairline rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">{t.title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
