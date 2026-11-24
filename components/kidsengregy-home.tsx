import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  HeartHandshake,
  Menu,
  MessageCircle,
  Mic2,
  Play,
  Sparkles,
  Star,
  Video,
  Volume2,
} from 'lucide-react'
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/config/site'
import { ScrollResetOnReload } from '@/components/scroll-reset-on-reload'

const heroImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-background-Mge1kcdgNawKl95CXS7x9T1OJVKSVH.png'
const logoImage = '/assets/aistudio/kidseng-logo_6a8965c0.png'

const benefits = [
  {
    icon: Mic2,
    title: 'কথা বলার সাহস',
    description: 'সহজ কথোপকথনের অনুশীলনে ধীরে ধীরে তৈরি হবে নিজের কথা বলার স্বাচ্ছন্দ্য।',
    tint: 'mint',
  },
  {
    icon: Volume2,
    title: 'শব্দভান্ডার ও ফনিক্স',
    description: 'নতুন শব্দ, ধ্বনি ও উচ্চারণ শেখা হবে গল্প আর মজার অনুশীলনের মাধ্যমে।',
    tint: 'yellow',
  },
  {
    icon: BookOpen,
    title: 'সহজ ব্যাকরণ',
    description: 'দৈনন্দিন উদাহরণে বাক্য গঠন ও ব্যাকরণের প্রাথমিক ধারণা।',
    tint: 'peach',
  },
  {
    icon: Headphones,
    title: 'শোনা ও বোঝা',
    description: 'শুনে বোঝার অভ্যাস এবং ইংরেজিতে সাড়া দেওয়ার অনুশীলন।',
    tint: 'mint',
  },
]

const steps = [
  ['০১', 'লাইভ ক্লাসে যোগ দাও', 'শিক্ষকের সাথে দেখা-সাক্ষাৎ আর মজার শেখা।'],
  ['০২', 'একসাথে অনুশীলন করো', 'নতুন শব্দ ও বাক্য ব্যবহার করে দেখো।'],
  ['০৩', 'বই আর ভিডিও দেখো', 'নিজের মতো সময়ে আবার ঝালিয়ে নাও।'],
  ['০৪', 'অগ্রগতি ভাগ করে নাও', 'অভিভাবক ও শিক্ষক মিলে শেখার পথ দেখুন।'],
]

const faqs = [
  ['কোন বয়সের শিশুরা ভর্তি হতে পারবে?', 'এই অনলাইন ইংলিশ প্রোগ্রামটি ৪–১০ বছর বয়সী শিশুদের জন্য বিশেষভাবে তৈরি।'],
  ['ক্লাসগুলো কীভাবে অনুষ্ঠিত হবে?', 'ক্লাসের মাধ্যম, সময়সূচি এবং বিস্তারিত জানতে আমাদের WhatsApp হেল্পলাইনে কথা বলুন।'],
  ['ফনিক্স বই কি প্যাকেজের মধ্যে অন্তর্ভুক্ত?', 'হ্যাঁ, প্যাকেজে ফনিক্স বই অন্তর্ভুক্ত। কুরিয়ারের মাধ্যমে সারা দেশে ডেলিভারি দেওয়া হয়।'],
  ['ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে কি?', 'হ্যাঁ, সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে ১,০৮০ টাকা পরিশোধ করবেন। কোনো অগ্রিম ফি নেই।'],
]

const programContents = [
  ['ফনিক্স ও রিডিং', 'আন্তর্জাতিকভাবে প্রমাণিত ফনিক্স পদ্ধতিতে একেবারে শুরু থেকে শেখা।', BookOpen, 'mint'],
  ['লাইভ ক্লাস', 'শিক্ষকের সাথে শেখার জন্য নির্ধারিত লাইভ ক্লাসের অভিজ্ঞতা।', Video, 'yellow'],
  ['রেকর্ডেড লেসন', '৮০+ রেকর্ড করা ভিডিওতে নিজের সময়ে আবার অনুশীলন।', Play, 'peach'],
  ['প্রগ্রেস ট্র্যাকিং', 'শিশুর শেখার অগ্রগতি বুঝতে প্রগ্রেস রিপোর্ট।', Check, 'mint'],
] as const

const liveClassMomentVideos = [
  { id: 'EYFiIj5Dj4E', title: 'লাইভ ক্লাস এর কিছু মুহূর্ত ১' },
  { id: 'I6lJFly-57w', title: 'লাইভ ক্লাস এর কিছু মুহূর্ত ২' },
  { id: 'caACWl6rv7U', title: 'লাইভ ক্লাস এর কিছু মুহূর্ত ৩' },
  { id: 'EohVLPBlysI', title: 'লাইভ ক্লাস এর কিছু মুহূর্ত ৪' },
] as const

const dailyPracticeVideos = [
  { id: 'rrsFuCfbZFM', title: 'প্রতিদিনের অনুশীলনের ভিডিও ১' },
  { id: 'OXC1Sr6nfrQ', title: 'প্রতিদিনের অনুশীলনের ভিডিও ২' },
  { id: 'MSdWhdk5jlw', title: 'প্রতিদিনের অনুশীলনের ভিডিও ৩' },
  { id: 'n_YE8MSAcQ8', title: 'প্রতিদিনের অনুশীলনের ভিডিও ৪' },
] as const

const reviewVideos = [
  { id: '5GR6jhuXtHw', title: 'অভিভাবকের ভিডিও রিভিউ ১' },
  { id: 'vEpcRkM36vw', title: 'অভিভাবকের ভিডিও রিভিউ ২' },
  { id: 'vJokAXxJilA', title: 'অভিভাবকের ভিডিও রিভিউ ৩' },
  { id: 'a2CMvcLSH8o', title: 'অভিভাবকের ভিডিও রিভিউ ৪' },
] as const

function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="#home" className={`brand-logo ${className}`} aria-label="KidsEngregy হোম">
      <Image src={logoImage} alt="KidsEngregy" width={120} height={120} priority className="brand-logo-image" />
    </Link>
  )
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <span className="section-eyebrow"><Sparkles aria-hidden="true" />{children}</span>
}

function MediaPlaceholder({ label, description }: { label: string; description: string }) {
  return <div className="media-placeholder" aria-label={`${label}: মিডিয়া এখনো যোগ করা হয়নি`}><div className="media-placeholder-icon"><Video aria-hidden="true" /></div><strong>{label}</strong><span>{description}</span><small>মিডিয়া এখনো যোগ করা হয়নি</small></div>
}

function VideoGallery({
  title,
  description = 'ভিডিও লিংক যোগ হলে এই জায়গা থেকে শিশুরা নিজের সময়ে দেখে অনুশীলন করতে পারবে।',
  items,
  videos,
}: {
  title: string
  description?: string
  items?: readonly (readonly [string, string])[]
  videos?: readonly { id: string; title: string }[]
}) {
  return (
    <section className="section video-gallery-section">
      <div className="section-heading">
        <SectionEyebrow>শেখার ভিডিও রিসোর্স</SectionEyebrow>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="video-gallery-grid">
        {videos
          ? videos.map((video) => (
              <article className="video-card" key={video.id}>
                <div className="video-embed-wrapper">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="video-embed-iframe"
                  />
                </div>
              </article>
            ))
          : items?.map(([label, desc], index) => (
              <article className="video-card" key={`${label}-${index}`}>
                <MediaPlaceholder label={label} description={desc} />
              </article>
            ))}
      </div>
    </section>
  )
}

export function KidsEngregyHome() {
  return (
    <main id="home">
      <ScrollResetOnReload />
      <div className="top-note">
        <div className="top-note-left">
          <span className="top-note-dot" />
          <span>৪–১০ বছরের বাচ্চাদের “ ইংরেজি রিডিং অনলাইন প্রোগ্রাম”</span>
        </div>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <nav className="desktop-nav" aria-label="প্রধান নেভিগেশন">
            <Link href="#home">হোম</Link>
            <Link href="#program">কোর্স সম্পর্কে</Link>
            <Link href="#learning">যেভাবে শিখবে</Link>
            <Link href="#reviews">অভিভাবকদের মতামত</Link>
            <Link href="#faq">সাধারণ প্রশ্ন</Link>
          </nav>
          <div className="header-actions">
            <a
              className="button button-whatsapp header-whatsapp"
              href={getWhatsAppUrl('KidsEngregy কোর্স সম্পর্কে বিস্তারিত জানতে চাই')}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" /> WhatsApp-এ কথা বলুন
            </a>
            <Link className="button button-primary header-cta" href="/checkout">
              ভর্তি সম্পর্কে জানুন <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <details className="mobile-menu">
            <summary aria-label="মেনু খুলুন"><Menu aria-hidden="true" /></summary>
            <nav aria-label="মোবাইল নেভিগেশন">
              <Link href="#program">কোর্স সম্পর্কে</Link>
              <Link href="#learning">যেভাবে শিখবে</Link>
              <Link href="#reviews">অভিভাবকদের মতামত</Link>
              <Link href="#faq">সাধারণ প্রশ্ন</Link>
              <Link href="/checkout">ভর্তি সম্পর্কে জানুন</Link>
              <a
                href={getWhatsAppUrl('KidsEngregy কোর্স সম্পর্কে বিস্তারিত জানতে চাই')}
                className="mobile-whatsapp-cta"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle aria-hidden="true" /> WhatsApp-এ কথা বলুন
              </a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-badge"><span className="badge-sprout">✳</span> ঘরে বসে আনন্দে ইংরেজি শেখা</div>
          <h1 id="hero-title">আনন্দ নিয়ে সহজেই<br /><span>ইংরেজিতে কথা বলবে</span><br />আপনার সন্তান</h1>
          <p className="hero-description">অভিজ্ঞ শিক্ষকের সাথে লাইভ ক্লাস, মজার ভোকাবুলারি গেমস এবং আকর্ষণীয় প্র্যাকটিস ভিডিওর মাধ্যমে ঘরে বসেই গড়ে উঠুক আপনার সন্তানের ইংরেজিতে কথা বলার আত্মবিশ্বাস।</p>
          <div className="hero-actions">
            <a href="#package" className="button button-primary button-large">
              কোর্স সম্পর্কে জানুন <ArrowRight aria-hidden="true" />
            </a>
            <a href="#program" className="button button-outline button-large">
              বিস্তারিত দেখুন <ArrowDown aria-hidden="true" />
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars" aria-hidden="true">
              <span>অ</span><span>শি</span><span>প</span>
            </div>
            <span>শিশুদের শেখার আনন্দে অভিভাবকদের পাশে</span>
            <span className="trust-star"><Star fill="currentColor" aria-hidden="true" /></span>
          </div>
        </div>
        <div className="hero-visual" aria-label="হেডফোন পরে বই নিয়ে পড়াশোনা করছে একটি শিশু">
          <Image src={heroImage} alt="হেডফোন পরে বই ও ট্যাবলেট নিয়ে পড়াশোনা করছে একটি শিশু" fill priority sizes="(max-width: 900px) 100vw, 54vw" className="hero-photo" unoptimized />
          <div className="hero-image-wash" />
          <div className="floating-note note-top"><span className="note-icon green"><Volume2 aria-hidden="true" /></span><span><strong>শোনো, বলো, শেখো</strong><small>প্রতিদিন একটু একটু করে</small></span></div>
          <div className="floating-note note-bottom"><span className="note-icon yellow"><BookOpen aria-hidden="true" /></span><span><strong>বই + ভিডিও</strong><small>শেখার সব উপকরণ একসাথে</small></span></div>
          <div className="hero-play" aria-hidden="true"><Play fill="currentColor" /></div>
        </div>
      </section>

      <section className="proof-strip" aria-label="কোর্সের বৈশিষ্ট্য">
        <div><span className="proof-icon"><Video aria-hidden="true" /></span><span><strong>লাইভ ক্লাস</strong><small>শিক্ষকের সাথে শেখা</small></span></div>
        <i />
        <div><span className="proof-icon proof-yellow"><BookOpen aria-hidden="true" /></span><span><strong>ফনিক্স বই</strong><small>হাতে-কলমে অনুশীলন</small></span></div>
        <i />
        <div><span className="proof-icon proof-orange"><HeartHandshake aria-hidden="true" /></span><span><strong>সাপোর্ট টিচার</strong><small>শেখার পথে পাশে</small></span></div>
        <i />
        <div><span className="proof-icon"><Play aria-hidden="true" /></span><span><strong>ভিডিও রিসোর্স</strong><small>আবার দেখে অনুশীলন</small></span></div>
      </section>

      <section className="section pain-section" id="program">
        <div className="section-heading">
          <SectionEyebrow>শিশুর শেখার পথে</SectionEyebrow>
          <h2>মুখস্ত নয় - মাত্র ৩০ দিনেই<br /><span>আপনার সন্তান নিজে নিজে ইংরেজি রিডিং পড়া শুরু করার লক্ষ্য</span></h2>
          <p>আন্তর্জাতিকভাবে প্রমাণিত ফনিক্স পদ্ধতিতে শেখানো হবে একেবারে শুরু থেকে — (শুধু ABC জানলেই যথেষ্ট!)</p>
        </div>
        <div className="benefit-grid">
          {benefits.map(({ icon: Icon, title, description, tint }, index) => (
            <article className="benefit-card" key={title}>
              <div className={`benefit-icon ${tint}`}><Icon aria-hidden="true" /></div>
              <span className="card-index">০{['১', '২', '৩', '৪'][index]}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section live-class-section" id="live-class">
        <div className="section-heading">
          <SectionEyebrow>লাইভ ক্লাস প্রিভিউ</SectionEyebrow>
          <h2>শিক্ষকের সাথে <span>শেখার আনন্দ</span></h2>
          <p>শিক্ষক কীভাবে আনন্দময় ও মিথস্ক্রিয়ামূলক উপায়ে শিশুদের পড়াচ্ছেন, তা এই ক্লাসরুম ভিডিও প্রিভিউতে দেখুন।</p>
        </div>
        <div className="live-class-layout">
          <div className="live-class-media">
            <div className="video-embed-wrapper">
              <iframe
                src="https://www.youtube-nocookie.com/embed/45VirQ0KaBI"
                title="KidsEngregy লাইভ ক্লাস প্রিভিউ"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="video-embed-iframe"
              />
            </div>
          </div>
          <div className="live-class-copy">
            <div className="live-class-note">
              <Video aria-hidden="true" />
              <span>সরাসরি শেখা, প্রশ্ন করা এবং অনুশীলন</span>
            </div>
            <h3>প্রতিটি শিশুর শেখার পথে যত্নশীল সহায়তা</h3>
            <p>আমাদের অভিজ্ঞ শিক্ষকের সরাসরি পরিচালনায় শিশুরা নির্ভুল উচ্চারণে আনন্দ নিয়ে ইংরেজি রিডিং শেখে।</p>
            <a
              href={getWhatsAppUrl('KidsEngregy লাইভ ক্লাসের বিস্তারিত জানতে চাই')}
              className="button button-outline"
              target="_blank"
              rel="noreferrer"
            >
              লাইভ ক্লাস সম্পর্কে জানুন <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="section program-contents-section" id="program-contents">
        <div className="section-heading">
          <SectionEyebrow>প্রোগ্রামে যা থাকছে</SectionEyebrow>
          <h2>শেখার প্রতিটি <span>প্রয়োজনীয় অংশ</span></h2>
          <p>ফনিক্স থেকে রিডিং, ভিডিও অনুশীলন থেকে প্রগ্রেস রিপোর্ট—প্যাকেজে থাকা শেখার উপাদানগুলো এক নজরে।</p>
        </div>
        <div className="program-contents-grid">
          {programContents.map(([title, description, Icon, tint]) => (
            <article className="program-content-card" key={title}>
              <div className={`program-content-icon ${tint}`}><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section learning-section" id="learning">
        <div className="learning-visual">
          <div className="learning-image-wrap">
            <iframe
              src="https://www.youtube-nocookie.com/embed/EYFiIj5Dj4E"
              title="KidsEngregy শেখার সহজ চার ধাপ ভিডিও প্রিভিউ"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="learning-video"
            />
          </div>
          <div className="learning-doodle" aria-hidden="true">✳</div>
        </div>
        <div className="learning-copy">
          <SectionEyebrow>শেখার সহজ চার ধাপ</SectionEyebrow>
          <h2>শেখা হবে আনন্দের সাথে,<br /><span>আত্মবিশ্বাসের সাথে।</span></h2>
          <p>লাইভ ক্লাস থেকে ঘরে বসে অনুশীলন—শেখার প্রতিটি ধাপে শিশুর পাশে থাকে যত্নশীল গাইডলাইন।</p>
          <div className="steps-list">
            {steps.map(([number, title, description]) => (
              <div className="step-row" key={number}>
                <span className="step-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Check className="step-check" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section homework-section" id="homework">
        <div className="homework-inner">
          <div>
            <SectionEyebrow>প্রগ্রেস দেখুন</SectionEyebrow>
            <h2>মাত্র ৩০ দিনে বাচ্চার দুর্দান্ত পরিবর্তন! <span>নিজেই দেখুন স্মার্ট প্রগ্রেস রিপোর্টে</span></h2>
            <p>আপনার সন্তান কি প্রতিদিন একটু একটু করে এগিয়ে যাচ্ছে? ৩০ দিনের স্মার্ট প্রগ্রেস রিপোর্টেই পেয়ে যান এর আসল প্রমাণ!</p>
          </div>
          <div className="homework-card">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3">
                <div className="progress-card-icon">
                  <Check aria-hidden="true" />
                </div>
                <div>
                  <strong>৩০ দিনের স্মার্ট প্রগ্রেস রিপোর্ট</strong>
                  <span>প্রতিদিনের ক্লাস, ফিডব্যাক ও নম্বর ট্র্যাকিং শিট</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#d8ecdd] bg-white shadow-xs">
                <Image
                  src="/assets/aistudio/image_440af394.png"
                  alt="KidsEngregy ৩০ দিনের স্মার্ট প্রগ্রেস রিপোর্ট"
                  width={900}
                  height={1280}
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoGallery
        title="লাইভ ক্লাস এর কিছু মুহূর্ত"
        description="যেখানে বাচ্চারা আনন্দের সাথে মনোযোগ দিয়ে ক্লাস করছে!"
        videos={liveClassMomentVideos}
      />
      <VideoGallery
        title="ক্লাস শেষে বাচ্চাদের প্রতিদিনের অনুশীলনের কিছু ভিডিও"
        description="প্রতিদিনের নিয়মিত চর্চায় ওদের আত্মবিশ্বাস ও দক্ষতা বৃদ্ধির বাস্তব চিত্র"
        videos={dailyPracticeVideos}
      />

      <section className="section course-band">
        <div className="course-band-content">
          <SectionEyebrow>একটি পরিপূর্ণ শেখার অভিজ্ঞতা</SectionEyebrow>
          <h2>শব্দ থেকে বাক্য,<br />আত্মবিশ্বাসে এগিয়ে চলা।</h2>
          <p>ফনিক্স, শব্দভান্ডার, সহজ ব্যাকরণ আর কথোপকথনের অনুশীলন—সবকিছুই শিশুর বয়স উপযোগী করে সাজানো।</p>
          <a href="#package" className="button button-primary">প্যাকেজ সম্পর্কে জানুন <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className="course-tiles">
          <div className="course-tile tile-one"><span><Volume2 aria-hidden="true" /></span><strong>শোনো ও বলো</strong><small>ইংরেজি: “সুপ্রভাত!”</small></div>
          <div className="course-tile tile-two"><span><BookOpen aria-hidden="true" /></span><strong>পড়ো ও বোঝো</strong><small>নতুন শব্দের সাথে পরিচয়</small></div>
          <div className="course-tile tile-three"><span><MessageCircle aria-hidden="true" /></span><strong>কথা বলো</strong><small>সহজ বাক্যে নিজের কথা</small></div>
          <div className="course-tile tile-four"><span><Sparkles aria-hidden="true" /></span><strong>খেলতে খেলতে শেখো</strong><small>মজার অনুশীলন প্রতিদিন</small></div>
        </div>
      </section>

      <section className="section progress-section" id="progress">
        <div className="section-heading">
          <SectionEyebrow>শিশুর অগ্রগতি</SectionEyebrow>
          <h2>ক্লাস শেষে সাপোর্ট টিচার সবার <span>Homework দেখে ভুল উচ্চারণ ঠিক করে দেবেন</span></h2>
          <p>বাচ্চাদের আত্মবিশ্বাস বাড়বে, আরো মনযোগী হবে</p>
        </div>
        <div className="progress-card">
          <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="progress-card-icon"><Check aria-hidden="true" /></div>
              <div className="min-w-0 flex-1">
                <h3>সাপোর্ট টিচারের হোমওয়ার্ক ফিডব্যাক</h3>
                <p>প্রতিদিনের হোমওয়ার্ক ভিডিও দেখে ব্যক্তিগতভাবে উচ্চারণ ও সাউন্ড ঠিক করে দেওয়া হয়।</p>
              </div>
              <span className="progress-status">সরাসরি ফিডব্যাক</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#d8ecdd] bg-white shadow-xs">
              <Image
                src="/assets/aistudio/image_9af7401f.png"
                alt="সাপোর্ট টিচারের সাথে শিক্ষার্থীদের হোমওয়ার্ক ফিডব্যাক চ্যাট স্ক্রিনশট"
                width={1000}
                height={1000}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="guarantee-strip" aria-label="৩০ দিনের প্রতিশ্রুতি">
        <div>
          <SectionEyebrow>৩০ দিনের শেখার প্রতিশ্রুতি</SectionEyebrow>
          <h2>মুখস্ত নয়—শিশু নিজে নিজে ইংরেজি রিডিং পড়া শুরু করার লক্ষ্য</h2>
          <p>পুরোনো সাইটের ৩০ দিনের প্রতিশ্রুতির নির্দিষ্ট শর্ত ও নীতিমালা নিশ্চিত হলে এখানে প্রকাশ করা হবে।</p>
        </div>
        <a href="#package" className="button button-primary">প্যাকেজের বিস্তারিত দেখুন <ArrowRight aria-hidden="true" /></a>
      </section>

      <section className="section package-section" id="package">
        <div className="section-heading">
          <SectionEyebrow>একসাথে শেখার সবকিছু</SectionEyebrow>
          <h2>শুরু হোক <span>নতুন শেখার যাত্রা</span></h2>
          <p>শিশুর শেখার জন্য পরিকল্পিত একটি যত্নশীল লার্নিং প্যাকেজ।</p>
        </div>
        <article className="package-card">
          <div className="package-main">
            <div className="package-heading">
              <span className="package-mark">
                <Image src={logoImage} alt="KidsEngregy" width={36} height={36} className="h-9 w-9 object-contain" />
              </span>
              <div>
                <span className="package-kicker">KidsEngregy</span>
                <h3>সম্পূর্ণ লার্নিং প্যাকেজ</h3>
                <p>শেখার যাত্রায় প্রয়োজনীয় সহায়তা একসাথে (বয়স: {SITE_CONFIG.targetAge})</p>
              </div>
            </div>
            <div className="package-features">
              <div><Check aria-hidden="true" />২৬টি লাইভ ক্লাস</div>
              <div><Check aria-hidden="true" />সাপোর্ট টিচারের সহায়তা</div>
              <div><Check aria-hidden="true" />ফনিক্স বই (হোম ডেলিভারি)</div>
              <div><Check aria-hidden="true" />৮০+ রেকর্ড করা ভিডিও</div>
              <div><Check aria-hidden="true" />প্রগ্রেস রিপোর্ট</div>
            </div>
            <p className="pricing-note">
              ভর্তি, ক্লাসের সময়সূচি ও ডেলিভারির বিস্তারিত আমাদের WhatsApp হেল্পলাইনে কথা বলে জেনে নিন।
            </p>
          </div>
          <div className="package-price">
            <div className="price-breakdown">
              <div><span>প্যাকেজের মোট মূল্য</span><strong>৳{SITE_CONFIG.pricing.regularPrice.toLocaleString('bn-BD')}</strong></div>
              <div><span>বিশেষ অফার মূল্য</span><strong>৳{SITE_CONFIG.pricing.packagePrice.toLocaleString('bn-BD')}</strong></div>
              <div className="delivery-row"><span>ডেলিভারি চার্জ (Steadfast)</span><strong>৳{SITE_CONFIG.pricing.deliveryFee.toLocaleString('bn-BD')}</strong></div>
              <div className="total-row"><span>সর্বমোট ক্যাশ অন ডেলিভারি</span><strong>৳{SITE_CONFIG.pricing.totalCodAmount.toLocaleString('bn-BD')}</strong></div>
            </div>

            <Link
              className="button button-primary button-large package-cta"
              href="/checkout"
              id="confirm-admission-btn"
            >
              ভর্তি ও ক্যাশ অন ডেলিভারি নিশ্চিত করুন <ArrowRight aria-hidden="true" />
            </Link>

            <div className="cod-badge-box">
              <span className="cod-note"><Check aria-hidden="true" /> ক্যাশ অন ডেলিভারি (COD) সুবিধা</span>
              <p className="cod-desc">কোনো অগ্রিম পেমেন্ট নেই। পার্সেল হাতে পেয়ে কুরিয়ারকে ১,০৮০ টাকা পরিশোধ করুন।</p>
            </div>
          </div>
        </article>
      </section>

      <section className="section testimonial-section" id="reviews">
        <div className="section-heading">
          <SectionEyebrow>অভিভাবকদের মতামত</SectionEyebrow>
          <h2>জেনে নিন আমাদের ৮,০০০+ অভিভাবক <span>কী বলছেন</span></h2>
          <p>পুরোনো সাইটে থাকা অভিভাবক ভিডিও রিভিউগুলোর নির্দিষ্ট লিংক ও অনুমতি পাওয়া গেলে এই স্লাইডে প্রকাশ করা হবে।</p>
        </div>
        <div className="review-carousel" aria-label="অভিভাবকদের ভিডিও রিভিউ">
          <div className="review-carousel-track">
            {reviewVideos.map((video) => (
              <article className="review-card" key={video.id}>
                <div className="video-embed-wrapper">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="video-embed-iframe"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="testimonial-inner testimonial-invite-row">
          <div>
            <p>সত্যিকারের অভিভাবক মতামত যুক্ত হলে নতুন পরিবারগুলো কোর্স সম্পর্কে আরও জানতে পারবে।</p>
            <a
              className="button button-outline"
              href={getWhatsAppUrl('KidsEngregy সম্পর্কে আমার অভিজ্ঞতা শেয়ার করতে চাই')}
              target="_blank"
              rel="noreferrer"
            >
              আপনার মতামত জানান <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <div className="testimonial-invite">
            <HeartHandshake aria-hidden="true" />
            <h3>আপনার গল্পটি বলুন</h3>
            <p>অভিভাবকদের আসল অভিজ্ঞতা সাদরে আমন্ত্রণ জানাই।</p>
            <a
              href={getWhatsAppUrl('KidsEngregy সম্পর্কে আমার মতামত শেয়ার করতে চাই')}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp-এ লিখুন <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <SectionEyebrow>আপনার প্রশ্নের উত্তর</SectionEyebrow>
          <h2>জানতে চান <span>আরও কিছু?</span></h2>
          <p>কোর্স, ক্লাস বা ভর্তি নিয়ে প্রশ্ন থাকলে আমরা সাহায্য করতে প্রস্তুত।</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details className="faq-item" key={question}>
              <summary>{question}<ChevronDown aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-sparkle sparkle-one" aria-hidden="true">✳</div>
        <div className="final-cta-content">
          <span>একসাথে শুরু হোক</span>
          <h2>আপনার সন্তানের ইংরেজি শেখার<br />যাত্রা শুরু হোক আজই।</h2>
          <p>কোর্স ও ভর্তির বিস্তারিত জানতে আমাদের সাথে কথা বলুন।</p>
          <div className="final-cta-actions">
            <a
              className="button button-white button-large final-whatsapp-btn"
              href={getWhatsAppUrl('KidsEngregy কোর্সে ভর্তির বিস্তারিত জানতে চাই')}
              target="_blank"
              rel="noreferrer"
              id="final-whatsapp-button"
            >
              <MessageCircle aria-hidden="true" /> WhatsApp-এ কথা বলুন <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="final-cta-sparkle sparkle-two" aria-hidden="true">✳</div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <BrandLogo />
            <p>শিশুদের জন্য আনন্দময় ইংরেজি শেখার যাত্রায় আমরা আছি পাশে।</p>
          </div>
          <div className="footer-links">
            <h3>জানুন</h3>
            <Link href="#program">কোর্স সম্পর্কে</Link>
            <Link href="#learning">যেভাবে শিখবে</Link>
            <Link href="#package">লার্নিং প্যাকেজ</Link>
            <Link href="#faq">সাধারণ প্রশ্ন</Link>
          </div>
          <div className="footer-links">
            <h3>তথ্য</h3>
            <a href="#package">ভর্তি সংক্রান্ত তথ্য (COD)</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© KidsEngregy · সর্বস্বত্ব সংরক্ষিত · হেল্পলাইন: {SITE_CONFIG.support.whatsappFormatted}</span>
          <div className="footer-bottom-actions">
            <a className="back-top" href="#home">উপরে যান ↑</a>
          </div>
        </div>
      </footer>

      <Link className="mobile-sticky-cta" href="/checkout">
        ভর্তি ও ক্যাশ অন ডেলিভারি <ArrowRight aria-hidden="true" />
      </Link>
    </main>
  )
}
