import { Card } from "./ui/card";
import { Shield, TrendingUp, Users, MessageSquare, Scale, Award } from "lucide-react";

interface ManifestoSectionProps {
  translations: {
    title: string;
    subtitle: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    point3Title: string;
    point3Desc: string;
    point4Title: string;
    point4Desc: string;
    point5Title: string;
    point5Desc: string;
    point6Title: string;
    point6Desc: string;
    slogan: string;
  };
}

export function ManifestoSection({ translations: t }: ManifestoSectionProps) {
  const manifestoPoints = [
    {
      icon: Shield,
      title: t.point1Title,
      description: t.point1Desc
    },
    {
      icon: TrendingUp,
      title: t.point2Title,
      description: t.point2Desc
    },
    {
      icon: Users,
      title: t.point3Title,
      description: t.point3Desc
    },
    {
      icon: MessageSquare,
      title: t.point4Title,
      description: t.point4Desc
    },
    {
      icon: Scale,
      title: t.point5Title,
      description: t.point5Desc
    },
    {
      icon: Award,
      title: t.point6Title,
      description: t.point6Desc
    }
  ];

  return (
    <section id="manifesto" className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] sm:text-[32px] text-[#0A2647] mb-3">
            {t.title}
          </h2>
          <div className="w-20 h-1 bg-[#FFD700] mx-auto mb-4"></div>
          <p className="text-[16px] sm:text-[18px] text-[#0A2647]/80 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {manifestoPoints.map((point, index) => (
            <Card 
              key={index} 
              className="p-6 border-2 border-[#0A2647]/10 hover:border-[#FFD700] hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#0A2647] flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-7 h-7 text-[#FFD700]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] sm:text-[20px] text-[#0A2647] mb-2">
                    {point.title}
                  </h3>
                  <p className="text-[16px] text-[#0A2647]/80 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Campaign Slogan */}
        <div className="mt-8 text-center">
          <Card className="p-6 bg-[#FFD700] border-0">
            <p className="text-[20px] sm:text-[24px] text-[#0A2647]">
              "{t.slogan}"
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
