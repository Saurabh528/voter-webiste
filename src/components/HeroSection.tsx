import { Button } from "./ui/button";
import { ArrowDown, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onLearnMore: () => void;
  onCheckCOP: () => void;
  translations: {
    badge: string;
    title: string;
    name: string;
    slogan: string;
    subtitle: string;
    learnMore: string;
    checkCOP: string;
    tagline: string;
  };
}

export function HeroSection({ onLearnMore, onCheckCOP, translations: t }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#0A2647] to-[#144272] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-6">
          {/* Campaign Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#0A2647] px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[16px]">{t.badge}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-[32px] sm:text-[40px] leading-tight">
            {t.title}<br />
            <span className="text-[#FFD700]">{t.name}</span>
          </h1>

          {/* Slogan */}
          <p className="text-[20px] sm:text-[24px] text-white/90">
            {t.slogan}
          </p>

          {/* Candidate Photo Placeholder */}
          <div className="my-8 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-white/10 border-4 border-[#FFD700] flex items-center justify-center">
              <div className="text-center">
                <div className="text-[64px] mb-2">⚖️</div>
                <p className="text-[14px]">Adv. Arun Kumar<br />Tripathi</p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-[18px] sm:text-[20px] text-white/90 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={onLearnMore}
              size="lg"
              className="w-full sm:w-auto text-[18px] px-8 py-7 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0A2647] gap-2"
            >
              {t.learnMore}
              <ArrowDown className="w-5 h-5" />
            </Button>
            <Button
              onClick={onCheckCOP}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-[18px] px-8 py-7 bg-white/10 hover:bg-white/20 text-white border-2 border-white gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t.checkCOP}
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="pt-8 text-[16px] text-white/80">
            "{t.tagline}"
          </div>
        </div>
      </div>
    </section>
  );
}