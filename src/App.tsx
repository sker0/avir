/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView } from 'motion/react';
import { Icon } from '@iconify/react';
import UnicornScene from 'unicornstudio-react';
import emailjs from '@emailjs/browser';

// Counter Component
function Counter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let frame = 0;
      const totalFrames = duration * 60;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easedProgress = progress * (2 - progress);
        setCount(Math.floor(easedProgress * value));
        if (frame === totalFrames) {
          clearInterval(counter);
          setCount(value);
        }
      }, 1000 / 60);
      return () => clearInterval(counter);
    } else {
      setCount(0);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

// ============================================================
// TODO: 클라이언트로부터 받은 후 교체 필요
// ============================================================

// 실제 크리에이터 정보 (사진은 /public/creators/ 폴더에 넣기)
const creators = [
  { name: "YU MI JANG", category: "Model", id: 1, image: "/creators/creator-1.jpg" },
  { name: "JUNG_THE_VERY_JUNG_JUNG", category: "Influencer · 2.8K", id: 2, image: "/creators/creator-2.png" },
  { name: "SEUNG HWAN SON", category: "Model", id: 3, image: "/creators/creator-3.jpg" },
  { name: "JIN WOO LEE", category: "Model", id: 4, image: "/creators/creator-4.jpg" },
  { name: "HYUN SEONG", category: "Influencer · 3.2K", id: 5, image: "/creators/creator-5.jpg" },
  { name: "FREEMAN", category: "Influencer · 23.7K", id: 6, image: "/creators/creator-6.jpg" },
];

// TODO: 카카오 채널 ID 교체 (_xxxx → 실제 ID)
const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_UxbkuX";

// TODO: 문의 이메일 교체
const CONTACT_EMAIL = "avirhelp@gmail.com";

// 실제 프로젝트 영상 (파일은 /public/videos/ 폴더에 넣기)
const projects = [
  { id: 1, title: "GS25 협업", brand: "GS25", desc: "언제나 가까운 'GS25' 편의점과 협업하여 코미디 콘텐츠로 누적 조회수 총 2800만회", date: "2024.06.27", icon: "ph:film-strip-bold", video: "/videos/gs25.mp4", poster: "/thumbnails/thumb-gs25.png" },
  { id: 2, title: "JYP 협업", brand: "JYP ENTERTAINMENT / (TWICE) NAYEON - ABCD", desc: "K-팝 명가 'JYP 엔터테인먼트'와 협업하여 음원 프로모션 캠페인 촬영, 누적 조회수 총 10만회", date: "2024.06.20", icon: "ph:monitor-play-bold", video: "/videos/jyp.mp4", poster: "/thumbnails/thumb-jyp.png" },
  { id: 3, title: "Z플립 삼성 협업", brand: "SAMSUNG / GALAXY Z FLIP 6", desc: "스마트폰 혁신의 아이콘 '삼성'과 협업하여 리뷰 캠페인 촬영, 누적 조회수 총 20만회", date: "2024.08.15", icon: "ph:broadcast-bold", video: "/videos/samsung.mp4", poster: "/thumbnails/thumb-samsung.png" },
  { id: 4, title: "샤브로 협업", brand: "SHABURO21 / YEOKBUK", desc: "신선함을 끓이는 '샤브로21' 협업하여 공간 협찬 및 촬영 지원, 누적 조회수 50만회", date: "2024.07.21", icon: "ph:camera-rotate-bold", video: "/videos/chabro.mp4", poster: "/thumbnails/thumb-chabro.png" },
];

// ============================================================
// 실제 브랜드 목록 + 로고 경로
// 파일은 /public/brands/ 폴더에 넣기
// ============================================================
const brands = [
  { name: "SAMSUNG", id: 1, logo: "/brands/samsung.png" },
  { name: "JYP", id: 2, logo: "/brands/jyp.png" },
  { name: "아이루미 성형외과", id: 3, logo: "/brands/ilumi.png" },
  { name: "PandaTV", id: 4, logo: "/brands/pandatv.jpg" },
  { name: "치지직", id: 6, logo: "/brands/chizizik.png" },
  { name: "TikTok", id: 7, logo: "/brands/tiktok.png" },
  { name: "GS25", id: 8, logo: "/brands/gs25.png" },
  { name: "Instagram", id: 9, logo: "/brands/instagram.png" },
  { name: "YouTube", id: 10, logo: "/brands/youtube.png" },
  { name: "CELEBe", id: 11, logo: "/brands/celebe.png" },
  { name: "차다이렉트", id: 12, logo: "/brands/chadirect.png" },
];

export default function App() {
  const [logoError, setLogoError] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showSticky, setShowSticky] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const scrollPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const smoothPercentage = useSpring(scrollPercentage, { damping: 20, stiffness: 100 });
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    return smoothPercentage.onChange((v) => setDisplayPercent(Math.round(v)));
  }, [smoothPercentage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => setShowSticky(container.scrollTop > 100);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setFormStatus('sending');
    emailjs.sendForm(
      'avircontact',
      'contactavir',
      formRef.current,
      '9mwLosMHOcwSY_MX0'
    ).then(() => {
      setFormStatus('sent');
      formRef.current?.reset();
    }).catch(() => {
      setFormStatus('error');
    });
  };

  const Logo = ({ className }: { className?: string }) => (
    !logoError ? (
      <img
        src="/logo.png"
        alt="AVIR Logo"
        className={className}
        onError={() => setLogoError(true)}
      />
    ) : (
      <span className="font-black text-primary">AVIR</span>
    )
  );

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black text-white selection:bg-primary/30"
    >
      {/* Scroll Progress */}
      <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-4">
        <div className="h-40 w-[2px] bg-white/10 relative rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-primary origin-top"
            style={{ height: `${displayPercent}%` }}
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-primary font-bold">{displayPercent}%</span>
          <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse" />
        </div>
      </div>

      {/* Sticky Header */}
      <AnimatePresence>
        {showSticky && (
          <motion.header
            initial={{ y: -100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl"
          >
            <div className="liquid-glass flex justify-between items-center">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Logo className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,145,182,0.3)]" />
              </div>
              <div className="hidden md:flex gap-8 text-sm font-medium">
                <a href="#about" className="hover:text-primary transition-colors">About</a>
                <a href="#services" className="hover:text-primary transition-colors">Services</a>
                <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
                <a href="#partners" className="hover:text-primary transition-colors">Partners</a>
              </div>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-primary transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Contact
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Background: Unicorn Studio */}
      <div className="fixed inset-0 z-0 opacity-60">
        <UnicornScene
          projectId="sHEhLnsmNJ8taz1WbF18"
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.6/dist/unicornStudio.umd.js"
          width="100%"
          height="100vh"
        />
      </div>

      <div className="relative z-10 w-full">

        {/* ── Hero ── */}
        <section className="h-screen w-full snap-start snap-always flex flex-col relative overflow-hidden">
          <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8 md:py-12 max-w-7xl mx-auto flex justify-between items-center" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Logo className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,145,182,0.5)]" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex gap-8 text-sm font-medium text-white/70">
              <a href="#about" className="hover:text-primary transition-colors">About</a>
              <a href="#services" className="hover:text-primary transition-colors">Services</a>
              <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
              <a href="#partners" className="hover:text-primary transition-colors">Partners</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </motion.div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col justify-center items-center h-full relative z-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 md:mb-12"
              >
                <div className="w-48 h-48 md:w-64 md:h-64 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-2xl border border-primary/30 relative group">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                  <Logo className="w-4/5 h-4/5 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,145,182,0.6)]" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-tight"
              >
                크리에이터의 가치를 <span className="text-primary">시스템</span>으로 증명하다<br />
                <span className="text-white/40 text-3xl md:text-5xl">Proving Creator Value through Systems</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto"
              >
                아비르는 크리에이터의 가능성을 발견하고, 지속 가능한 <br className="hidden md:block" />
                성장으로 이어주는 차세대 MCN입니다.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-primary text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,145,182,0.4)]"
                >
                  파트너십 문의
                </button>
                <button
                  onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
                >
                  크리에이터 라인업
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Scroll</span>
              <div className="w-[20px] h-[32px] border-2 border-white/20 rounded-full flex justify-center p-1">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-1 bg-primary rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full pt-28 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-grow">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-primary font-mono tracking-[0.3em] uppercase text-xs">About</span>
                    <Logo className="h-4 w-auto object-contain opacity-80" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                    크리에이터의 가치를<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-mint">시스템으로 설계하다</span>
                  </h2>
                  <div className="h-1 w-20 bg-primary rounded-full mb-8" />
                  <p className="text-lg md:text-xl text-white/70 leading-relaxed">
                    아비르는 차세대 크리에이터를 위한 종합 콘텐츠 매니지먼트 기업입니다. 우리는 음악, 영상, 라이브 콘텐츠 등 다양한 영역에서 깊이 연결될 수 있도록 독창적인 시선, 진정성 있는 스토리, 독창적인 재능을 가진 인물들을 발굴하고, 그들이 자신만의 색깔과 영향력을 극대화할 수 있도록 전문적인 기획과 브랜딩을 제공합니다. 아비르는 단순한 매니지먼트를 넘어, 콘텐츠 제작, 유통, 브랜드 협업까지 아우르며 크리에이터의 가능성을 실현하는 든든한 파트너가 됩니다.
                  </p>
                </div>
                <div className="flex gap-8 items-center pt-4">
                  {[
                    { icon: "ph:users-three-bold", value: 50, label: "Creators" },
                    { icon: "ph:handshake-bold", value: 120, label: "Brands" },
                    { icon: "ph:rocket-launch-bold", value: 200, label: "Projects" },
                  ].map((stat, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="w-[1px] h-10 bg-white/10" />}
                      <div className="text-center group">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Icon icon={stat.icon} className="text-primary/50 group-hover:text-primary transition-colors text-sm" />
                          <p className="text-3xl font-bold text-primary"><Counter value={stat.value} />+</p>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {[
                  { title: "Entertainment Legacy", desc: "아비르만의 독보적인 검증된 비즈니스 전략", icon: "ph:star-four-fill", color: "from-primary/20 to-transparent" },
                  { title: "Support System", desc: "크리에이터의 성장 및 활동의 필요한 지원을 아끼지 않습니다", icon: "ph:cpu-fill", color: "from-accent-mint/20 to-transparent" },
                  { title: "Branding Partnership", desc: "콘텐츠 제작,유통,브랜드 협업까지 크리에이터의 가능성을 함께 실현", icon: "ph:globe-hemisphere-east-fill", color: "from-blue-500/20 to-transparent" },
                ].map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    whileHover={{ x: 10 }}
                    className={`bento-card p-6 md:p-8 flex items-start gap-6 group cursor-default bg-gradient-to-br ${value.color}`}
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all shrink-0">
                      <Icon icon={value.icon} className="text-2xl md:text-3xl text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                      <p className="text-sm md:text-base text-white/50 leading-relaxed group-hover:text-white/80 transition-colors">{value.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full pt-24 pb-10">
            <div className="mb-2">
              <span className="text-primary font-mono tracking-widest uppercase text-sm">Our Services</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">서비스</h2>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 w-full relative flex-grow justify-center overflow-visible isolate">
              {[
                { title: "All-in-One Creator Care", desc: "라이브 스트리밍 전담 기술 지원 및 장비 제공", details: "라이브 스트리밍을 위한 전담 기술 지원. 실시간 채팅 매니저와 1,000만 원 상당의 고성능 방송 장비를 제공하여 오직 콘텐츠에만 집중할 수 있는 환경을 만듭니다.", icon: "ph:broadcast-bold" },
                { title: "Visual Branding Lab", desc: "웹 화보 및 아티스트 브랜딩 전문 인프라", details: "웹 화보 및 아티스트 브랜딩을 위한 전문 인프라. 자택 근무 지원부터 스튜디오 메이크업, 촬영 장비 지원까지 크리에이터의 비주얼 영향력을 극대화합니다.", icon: "ph:camera-plus-bold" },
                { title: "Engineering & Sync", desc: "최적의 방송 환경을 위한 엔지니어링 솔루션", details: "최적의 방송 환경을 위한 엔지니어링 솔루션. 정밀 오디오 튜닝, 노이즈 제거, 보이스 톤 보정 및 방송 플랫폼 최적화 세팅으로 프로페셔널한 송출을 보장합니다.", icon: "ph:equalizer-bold" },
                { title: "Monetization Strategy", desc: "수익 최대화 전략 및 팬덤 관리 시스템", details: "수익 최대화 전략 및 팬덤 관리 시스템. 크리에이터 고유의 IP를 브랜드 협업 및 커머스 비즈니스와 연결하여 지속 가능한 수익 구조를 설계합니다.", icon: "ph:currency-circle-dollar-bold" },
                { title: "Secure & Legal Protocol", desc: "24시 긴급 대응 서비스 및 강력한 권익 보호", details: "24시 긴급 대응 서비스 및 강력한 권익 보호. 방송 중 돌발 상황 해결을 위한 온/오프라인 긴급 지원과 전문 법률 자문 시스템을 제공합니다.", icon: "ph:shield-star-bold" },
              ].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring", damping: 20 }}
                  onClick={() => setActiveService(activeService === i ? null : i)}
                  className="relative h-16 md:h-20 cursor-pointer group"
                >
                  <div className={`absolute inset-0 liquid-glass !rounded-2xl flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${activeService === i ? 'opacity-0' : 'opacity-100 group-hover:border-primary/30 group-hover:bg-white/5'}`}>
                    <div className="flex items-center gap-6">
                      <Icon icon={service.icon} className="text-2xl md:text-3xl text-primary/70 group-hover:text-primary transition-colors" />
                      <h3 className="text-xl md:text-2xl font-bold text-white/80 group-hover:text-white transition-colors">{service.title}</h3>
                    </div>
                    <p className="hidden md:block text-white/40 text-sm group-hover:text-white/60 transition-colors">{service.desc}</p>
                    <Icon icon="ph:plus-bold" className="text-xl text-white/20 group-hover:text-primary group-hover:rotate-90 transition-all" />
                  </div>

                  <AnimatePresence>
                    {activeService === i && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: i === 0 ? 0 : i === 4 ? 0 : "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: i === 0 ? 0 : i === 4 ? 0 : "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: i === 0 ? 0 : i === 4 ? 0 : "-50%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`absolute left-0 right-0 z-[200] !rounded-3xl p-8 md:p-10 border border-primary shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(255,51,102,0.3)] flex flex-col justify-between
                          bg-[#111118]
                          ${i === 0 ? 'top-0 origin-top' : i === 4 ? 'bottom-0 origin-bottom' : 'top-1/2 origin-center'}`}
                        style={{ minHeight: '320px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(255,51,102,0.3)]">
                              <Icon icon={service.icon} className="text-3xl text-primary" />
                            </div>
                            <div>
                              <h3 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">{service.title}</h3>
                              <p className="text-white/60 text-sm mt-1">{service.desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveService(null); }}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all"
                          >
                            <Icon icon="ph:x-bold" className="text-xl text-primary" />
                          </button>
                        </div>
                        <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 via-primary/20 to-transparent mb-8" />
                        <p className="text-white/90 leading-relaxed text-lg md:text-xl font-light flex-grow">{service.details}</p>
                        <div className="mt-8 flex justify-end items-center gap-4">
                          <div className="h-[1px] flex-grow bg-white/5" />
                          <div className="flex items-center gap-2">
                            <Logo className="h-3 w-auto object-contain opacity-60" />
                            <span className="text-primary/60 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap">Service Excellence</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section id="portfolio" className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 w-full flex flex-col h-full pt-28 pb-10">
            <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <span className="text-primary font-mono tracking-widest uppercase text-[10px] md:text-xs">Portfolio</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-1">프로젝트</h2>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all text-xs md:text-sm">
                상세 페이지 바로가기 <Icon icon="line-md:arrow-right" className="text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-grow overflow-hidden">
              {projects.map((project, i) => (
                <motion.div
                  key={i}
                  layoutId={`project-${project.id}`}
                  onClick={() => setSelectedProject(project.id)}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                  whileHover={{ scale: 1 }}
                  className="relative bento-card overflow-hidden group cursor-pointer h-full min-h-[200px] md:min-h-[240px]"
                >
                  {/* 그라데이션 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />
                  {/* 영상 */}
                  <video
                    src={project.video}
                    poster={project.poster}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted playsInline preload="none"
                  />
                  {/* 텍스트 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex flex-col gap-1">
                    <span className="text-primary font-mono text-[10px] tracking-widest uppercase">{project.brand}</span>
                    <p className="text-white text-sm leading-snug">{project.desc}</p>
                    <span className="text-white/50 text-xs mt-1">{project.date}</span>
                  </div>
                  {/* 플레이 버튼 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/40">
                      <Icon icon="ph:play-fill" className="text-primary text-xl ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedProject(null)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl cursor-zoom-out"
                  />
                  <motion.div
                    layoutId={`project-${selectedProject}`}
                    className="relative w-full max-w-5xl aspect-video bento-card overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(255,145,182,0.3)] z-10 bg-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <video
                      src={projects.find(p => p.id === selectedProject)?.video}
                      className="w-full h-full object-contain"
                      controls autoPlay playsInline
                    />
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-primary/30 flex items-center justify-center border border-white/20 hover:border-primary transition-all z-10"
                    >
                      <Icon icon="ph:x-bold" className="text-xl text-white" />
                    </button>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary pointer-events-none" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary pointer-events-none" />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Partners ── */}
        <section id="partners" className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center overflow-hidden relative">
          <div className="max-w-7xl mx-auto w-full flex flex-col h-full pt-24 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="mb-4 text-center px-6 pt-12"
            >
              <span className="text-primary font-mono tracking-widest uppercase text-[10px]">Partners</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-1">파트너십</h2>
              <p className="text-white/60 mt-4 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                AVIR는 현재 50여 명의 크리에이터와 함께 성장하며,<br className="hidden md:block" />
                120개 이상의 글로벌 브랜드와 협력하여 200회 이상의 프로젝트를 성공적으로 완수했습니다.
              </p>
            </motion.div>

            <div className="flex flex-col gap-4 md:gap-6 flex-grow justify-center">
              {/* Creators Row */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs md:text-sm font-mono text-white/80 uppercase tracking-[0.2em] font-bold">Our Creators</span>
                </div>
                <div className="relative flex overflow-hidden py-2">
                  <motion.div
                    className="flex gap-4 md:gap-6"
                    animate={{ x: [0, "-50%"] }}
                    transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                  >
                    {[...creators, ...creators].map((creator, i) => (
                      <div key={i} className="w-40 md:w-56 flex-shrink-0 bento-card p-3 flex flex-col items-center text-center group">
                        <div className="w-full aspect-square bg-white/5 rounded-xl mb-2 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                          <img
                            src={creator.image}
                            alt={creator.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <h4 className={`font-bold text-center break-words leading-tight ${creator.id === 2 ? 'text-[10px] md:text-xs' : 'text-sm md:text-base'}`}>{creator.name}</h4>
                        <p className="text-xs text-white/40 mt-0.5">{creator.category}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Brands Rows */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs md:text-sm font-mono text-white/80 uppercase tracking-[0.2em] font-bold">Collaborated Brands</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="relative flex overflow-hidden py-1">
                    <motion.div
                      className="flex gap-8 md:gap-16 items-center"
                      animate={{ x: [0, "-50%"] }}
                      transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                    >
                      {[...brands, ...brands].map((brand, i) => (
                        <div key={i} className="flex-shrink-0 flex items-center justify-center group">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-8 md:h-10 w-auto object-contain opacity-30 group-hover:opacity-100 transition-all duration-500 filter grayscale group-hover:grayscale-0"
                          />
                        </div>
                      ))}
                    </motion.div>
                  </div>
                  <div className="relative flex overflow-hidden py-1">
                    <motion.div
                      className="flex gap-8 md:gap-16 items-center"
                      animate={{ x: ["-50%", 0] }}
                      transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                    >
                      {[...brands, ...brands].map((brand, i) => (
                        <div key={i} className="flex-shrink-0 flex items-center justify-center group">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-8 md:h-10 w-auto object-contain opacity-30 group-hover:opacity-100 transition-all duration-500 filter grayscale group-hover:grayscale-0"
                          />
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full pt-28 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 flex-grow items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                  Let's Create<br /><span className="text-primary">Together</span>
                </h2>
                <p className="text-white/60 mb-6 md:mb-10 text-sm md:text-base lg:text-lg">
                  당신의 가능성을 시스템으로 구축할 준비가 되셨나요?<br />
                  지금 바로 AVIR와 함께 미래를 설계하세요.
                </p>
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
                      <Icon icon="line-md:email-twotone" className="text-lg md:text-xl text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 font-mono">Email</p>
                      <p className="text-sm md:text-base font-bold">{CONTACT_EMAIL}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
                      <Icon icon="line-md:map-marker-twotone" className="text-lg md:text-xl text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 font-mono">Location</p>
                      <p className="text-sm md:text-base font-bold">Seoul, South Korea</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 md:mt-12 w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#FEE500] text-black font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-3 animate-pulse-custom text-sm md:text-base"
                  onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
                >
                  <Icon icon="ri:kakao-talk-fill" className="text-xl md:text-2xl" />
                  카카오톡 채널 문의하기
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-7 bento-card bg-white/10 border-white/20 p-6 md:p-8"
              >
                <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">문의 폼</h3>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium text-white/60 ml-1">성함 / 활동명</label>
                      <input
                        required
                        name="from_name"
                        type="text"
                        placeholder="Name / Creator Name"
                        className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                      />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium text-white/60 ml-1">연락처 / 이메일</label>
                      <input
                        required
                        name="from_contact"
                        type="text"
                        placeholder="Contact / Email"
                        className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-xs md:text-sm font-medium text-white/60 ml-1">문의 유형</label>
                    <div className="relative">
                      <select
                        required
                        name="inquiry_type"
                        defaultValue=""
                        className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-primary transition-colors text-sm md:text-base appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-black text-white/40">문의 유형을 선택해주세요</option>
                        <option value="크리에이터 지원" className="bg-black text-white">크리에이터 지원</option>
                        <option value="브랜드 콜라보레이션" className="bg-black text-white">브랜드 콜라보레이션</option>
                        <option value="기타문의" className="bg-black text-white">기타문의</option>
                      </select>
                      <Icon icon="ph:caret-down-bold" className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-xs md:text-sm font-medium text-white/60 ml-1">문의 내용</label>
                    <textarea
                      required
                      name="message"
                      rows={4}
                      placeholder="협업 제안 또는 문의 사항을 입력해주세요..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-primary transition-colors resize-none text-sm md:text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus !== 'idle'}
                    className="w-full py-3 md:py-4 bg-primary text-black font-bold rounded-xl md:rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm md:text-base"
                  >
                    {formStatus === 'idle' && '문의 보내기'}
                    {formStatus === 'sending' && '전송 중...'}
                    {formStatus === 'sent' && '✓ 전송 완료!'}
                    {formStatus === 'error' && '❌ 전송 실패 — 다시 시도해주세요'}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Footer */}
            <footer className="mt-8 md:mt-16 pt-6 md:pt-8 pb-6 md:pb-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              <Logo className="h-8 md:h-10 w-auto object-contain" />
              <p className="text-white/40 text-[9px] md:text-sm text-center">© 2026 AVIR MCN. Part of Lucid Entertainment. All rights reserved.</p>
              <div className="flex gap-4 md:gap-6">
                <Icon icon="line-md:instagram" className="text-lg md:text-2xl text-white/40 hover:text-primary cursor-pointer transition-colors" />
                <Icon icon="line-md:twitter-x" className="text-lg md:text-2xl text-white/40 hover:text-primary cursor-pointer transition-colors" />
                <Icon icon="line-md:youtube" className="text-lg md:text-2xl text-white/40 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </footer>
          </div>
        </section>

      </div>
    </div>
  );
}
