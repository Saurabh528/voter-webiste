import { Card } from "./ui/card";
import { GraduationCap, Briefcase, Award, Users } from "lucide-react";

interface AboutSectionProps {
  translations: {
    title: string;
    bio1: string;
    bio2: string;
    education: string;
    educationDesc: string;
    experience: string;
    experienceDesc: string;
    achievements: string;
    achievementsDesc: string;
    community: string;
    communityDesc: string;
    whyVote: string;
    reason1: string;
    reason2: string;
    reason3: string;
    reason4: string;
  };
}

export function AboutSection({ translations: t }: AboutSectionProps) {
  return (
    <section id="about" className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] sm:text-[32px] text-[#0A2647] mb-3">
            {t.title}
          </h2>
          <div className="w-20 h-1 bg-[#FFD700] mx-auto mb-6"></div>
        </div>

        {/* Biography */}
        <Card className="p-6 sm:p-8 mb-8 border-2 border-[#0A2647]/10">
          <div className="space-y-4 text-[16px] sm:text-[18px] text-[#0A2647] leading-relaxed">
            <p>{t.bio1}</p>
            <p>{t.bio2}</p>
          </div>
        </Card>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 border-2 border-[#0A2647]/10 hover:border-[#FFD700] transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-[#0A2647]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] text-[#0A2647] mb-2">{t.education}</h3>
                <p className="text-[16px] text-[#0A2647]/80">{t.educationDesc}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-[#0A2647]/10 hover:border-[#FFD700] transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-[#0A2647]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] text-[#0A2647] mb-2">{t.experience}</h3>
                <p className="text-[16px] text-[#0A2647]/80">{t.experienceDesc}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-[#0A2647]/10 hover:border-[#FFD700] transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#0A2647]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] text-[#0A2647] mb-2">{t.achievements}</h3>
                <p className="text-[16px] text-[#0A2647]/80">{t.achievementsDesc}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-[#0A2647]/10 hover:border-[#FFD700] transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#0A2647]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] text-[#0A2647] mb-2">{t.community}</h3>
                <p className="text-[16px] text-[#0A2647]/80">{t.communityDesc}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Why Vote Section */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#0A2647] to-[#144272] text-white border-0">
          <h3 className="text-[24px] sm:text-[28px] mb-6 text-center">{t.whyVote}</h3>
          <div className="space-y-4 text-[16px] sm:text-[18px]">
            <div className="flex items-start gap-3">
              <div className="text-[#FFD700] text-[20px] flex-shrink-0">✓</div>
              <p>{t.reason1}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-[#FFD700] text-[20px] flex-shrink-0">✓</div>
              <p>{t.reason2}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-[#FFD700] text-[20px] flex-shrink-0">✓</div>
              <p>{t.reason3}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-[#FFD700] text-[20px] flex-shrink-0">✓</div>
              <p>{t.reason4}</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
