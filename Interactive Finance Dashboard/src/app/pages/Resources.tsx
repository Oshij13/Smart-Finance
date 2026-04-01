import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BookMarked, Book, Headphones, Mail, Video, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function Resources() {
  const books = [
    {
      title: "Let's Talk Money",
      author: "Monika Halan",
      description: "Essential India-specific guide to personal finance covering everything from insurance to investments.",
      category: "Beginner Friendly"
    },
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      description: "Timeless lessons on wealth, greed, and happiness. Focuses on behavior over formulas.",
      category: "Mindset & Behavior"
    },
    {
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      description: "Classic book on building wealth through assets and financial literacy.",
      category: "Wealth Building"
    },
    {
      title: "Your Money or Your Life",
      author: "Vicki Robin & Joe Dominguez",
      description: "Transform your relationship with money and achieve financial independence.",
      category: "Financial Independence"
    },
    {
      title: "The Intelligent Investor",
      author: "Benjamin Graham",
      description: "The definitive book on value investing. A must-read for serious investors.",
      category: "Advanced Investing"
    },
    {
      title: "I Will Teach You to Be Rich",
      author: "Ramit Sethi",
      description: "No-nonsense guide to personal finance for young professionals.",
      category: "Practical Guide"
    }
  ];

  const podcasts = [
    {
      title: "Paisa Vaisa",
      host: "IVM Podcasts",
      description: "Weekly discussions on personal finance, markets, and money management in India.",
      frequency: "Weekly"
    },
    {
      title: "The Seen and the Unseen",
      host: "Amit Varma",
      description: "Deep dive into economics, policy, and society. Financial literacy through stories.",
      frequency: "Weekly"
    },
    {
      title: "Capitalmind Podcast",
      host: "Deepak Shenoy",
      description: "Indian markets, investing strategies, and economic analysis.",
      frequency: "Bi-weekly"
    },
    {
      title: "BiggerPockets Money Podcast",
      host: "Mindy Jensen & Scott Trench",
      description: "Financial independence and wealth building strategies.",
      frequency: "Weekly"
    },
    {
      title: "ChooseFI",
      host: "Jonathan Mendonsa & Brad Barrett",
      description: "Achieve financial independence through optimized saving and investing.",
      frequency: "3x per week"
    }
  ];

  const newsletters = [
    {
      title: "Finshots",
      description: "Daily 3-minute newsletter breaking down financial news in simple language.",
      focus: "Daily News",
      link: "finshots.in"
    },
    {
      title: "Morning Context",
      description: "In-depth analysis of Indian business, economy, and policy.",
      focus: "Deep Analysis",
      link: "themorningcontext.com"
    },
    {
      title: "The Ken",
      description: "Long-form stories on technology, business, and finance in India.",
      focus: "Investigative",
      link: "the-ken.com"
    },
    {
      title: "Capitalmind",
      description: "Indian markets, stocks, and investment research.",
      focus: "Market Analysis",
      link: "capitalmind.in"
    },
    {
      title: "Substack Finance Writers",
      description: "Follow independent finance writers like Morgan Housel, Ben Carlson, and more.",
      focus: "Personal Finance",
      link: "substack.com"
    }
  ];

  const youtubeChannels = [
    {
      title: "Zerodha Varsity",
      description: "Free educational content on trading, investing, and financial markets.",
      focus: "Stock Market Education"
    },
    {
      title: "CA Rachana Ranade",
      description: "Stock market basics, technical analysis, and investment strategies in Hindi & English.",
      focus: "Investment Education"
    },
    {
      title: "Labour Law Advisor",
      description: "Financial planning, mutual funds, insurance, and tax planning.",
      focus: "Financial Planning"
    },
    {
      title: "Pranjal Kamra",
      description: "Personal finance, investing concepts, and money management for millennials.",
      focus: "Youth Finance"
    },
    {
      title: "The Plain Bagel",
      description: "Financial concepts explained simply without jargon.",
      focus: "Finance Basics"
    },
    {
      title: "Ben Felix",
      description: "Evidence-based investing advice with academic research backing.",
      focus: "Research-Based"
    }
  ];

  const platforms = [
    {
      title: "Zerodha Varsity",
      description: "Comprehensive free modules on stocks, derivatives, personal finance, and more.",
      type: "Learning Platform",
      link: "zerodha.com/varsity"
    },
    {
      title: "National Centre for Financial Education (NCFE)",
      description: "Government-backed financial literacy resources and tools.",
      type: "Government Resource",
      link: "ncfe.org.in"
    },
    {
      title: "Investopedia",
      description: "World's largest financial education website with detailed guides and definitions.",
      type: "Encyclopedia",
      link: "investopedia.com"
    },
    {
      title: "Freefincal",
      description: "Independent financial planning blog with calculators and DIY guides.",
      type: "Blog & Tools",
      link: "freefincal.com"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
        </div>
        <p className="text-lg text-purple-50">
          Curated collection of books, podcasts, newsletters, and platforms to enhance your financial knowledge.
        </p>
      </div>

      {/* Tabs for different resource types */}
      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="books">
            <Book className="w-4 h-4 mr-2" />
            Books
          </TabsTrigger>
          <TabsTrigger value="podcasts">
            <Headphones className="w-4 h-4 mr-2" />
            Podcasts
          </TabsTrigger>
          <TabsTrigger value="newsletters">
            <Mail className="w-4 h-4 mr-2" />
            Newsletters
          </TabsTrigger>
          <TabsTrigger value="youtube">
            <Video className="w-4 h-4 mr-2" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <ExternalLink className="w-4 h-4 mr-2" />
            Platforms
          </TabsTrigger>
        </TabsList>

        {/* Books */}
        <TabsContent value="books" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{book.title}</CardTitle>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
                      {book.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{book.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Podcasts */}
        <TabsContent value="podcasts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {podcasts.map((podcast, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{podcast.title}</CardTitle>
                      <p className="text-sm text-gray-600">by {podcast.host}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                      {podcast.frequency}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{podcast.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Newsletters */}
        <TabsContent value="newsletters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsletters.map((newsletter, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{newsletter.title}</CardTitle>
                      <p className="text-sm text-blue-600">{newsletter.link}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                      {newsletter.focus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{newsletter.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* YouTube */}
        <TabsContent value="youtube" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {youtubeChannels.map((channel, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg mb-1">{channel.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 whitespace-nowrap">
                      {channel.focus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{channel.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Platforms */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{platform.title}</CardTitle>
                      <p className="text-sm text-indigo-600">{platform.link}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                      {platform.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Learning Path Recommendation */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Recommended Learning Path</CardTitle>
          <CardDescription>Start your financial education journey with these steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Foundation (Weeks 1-4)</h3>
              <p className="text-sm text-gray-700">Read "Let's Talk Money", subscribe to Finshots, watch Zerodha Varsity modules on basics.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Building Knowledge (Months 2-3)</h3>
              <p className="text-sm text-gray-700">Listen to Paisa Vaisa podcast, follow CA Rachana Ranade for investment basics, implement budgeting.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Advanced Learning (Months 4-6)</h3>
              <p className="text-sm text-gray-700">Read "The Psychology of Money", explore Capitalmind for market insights, start SIPs.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Mastery (Ongoing)</h3>
              <p className="text-sm text-gray-700">Deep dive into "The Intelligent Investor", follow specialized content based on your goals, teach others.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle>Pro Tips for Learning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-amber-900">Consistency over Intensity:</span> 15 minutes daily beats 2 hours once a week. Make learning a habit.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-amber-900">Apply Immediately:</span> Don't just consume. Set up that SIP, create that budget, calculate your tax.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-amber-900">Avoid Analysis Paralysis:</span> Don't wait to know everything. Start with basics and improve as you learn.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
