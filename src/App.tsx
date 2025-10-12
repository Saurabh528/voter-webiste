import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Languages, Phone, MessageSquare, Facebook } from "lucide-react";
import { PhoneCaptureModal } from "./components/PhoneCaptureModal";
import { VoterSearchSection } from "./components/VoterSearchSection";
import { translations, type Language } from "./utils/translations";

export default function App() {
  const [language, setLanguage] = useState<Language>("hi"); // Default to Hindi
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const t = translations[language];

  useEffect(() => {
    // Show phone capture modal on first visit (after 1 second delay)
    const hasSeenModal = localStorage.getItem("hasSeenPhoneModal");
    if (!hasSeenModal) {
      setTimeout(() => {
        setShowPhoneModal(true);
      }, 1000);
    }
  }, []);

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    localStorage.setItem("hasSeenPhoneModal", "true");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919415451856?text=नमस्ते, मैं श्री अरुण त्रिपाठी जी के अभियान से जुड़ना चाहता/चाहती हूँ।", "_blank");
  };

  const handleFacebookProfile = () => {
    window.open("https://www.facebook.com/arunkumar.tripathi.397", "_blank");
  };

  const handleFacebookPage = () => {
    window.open("https://www.facebook.com/share/1BZpxKeoZz/?mibextid=wwXIfr", "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Phone Capture Modal */}
      {showPhoneModal && (
        <PhoneCaptureModal
          onClose={handleClosePhoneModal}
          translations={t.phoneCapture}
        />
      )}

      {/* Header */}
      <header className="bg-[#0A2647] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Bar Council Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[28px] sm:text-[36px]">⚖️</div>
                </div>
              </div>
              <div>
                <h1 className="text-[16px] sm:text-[20px] leading-tight">
                  {t.hero.mainTitle}
                </h1>
              </div>
            </div>

            {/* Right Side - Language Toggle & Social Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Facebook Links - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  onClick={handleFacebookProfile}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-[#FFD700] gap-2 text-[14px] px-3 py-2"
                >
                  <Facebook className="w-4 h-4" />
                  Profile
                </Button>
                <Button
                  onClick={handleFacebookPage}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-[#FFD700] gap-2 text-[14px] px-3 py-2"
                >
                  <Facebook className="w-4 h-4" />
                  Page
                </Button>
              </div>

              {/* Language Toggle */}
              <Button
                onClick={toggleLanguage}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-[#FFD700] gap-2 text-[14px] sm:text-[16px] px-3 py-2"
              >
                <Languages className="w-4 h-4" />
                {language === "en" ? "हिंदी" : "English"}
              </Button>
            </div>
          </div>

          {/* Facebook Links - Mobile (Below Header) */}
          <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-white/20">
            <Button
              onClick={handleFacebookProfile}
              variant="ghost"
              size="sm"
              className="flex-1 text-white hover:bg-white/10 hover:text-[#FFD700] gap-2 text-[14px] py-2"
            >
              <Facebook className="w-4 h-4" />
              Profile
            </Button>
            <Button
              onClick={handleFacebookPage}
              variant="ghost"
              size="sm"
              className="flex-1 text-white hover:bg-white/10 hover:text-[#FFD700] gap-2 text-[14px] py-2"
            >
              <Facebook className="w-4 h-4" />
              Page
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Candidate Promotion Section */}
        <section className="bg-gradient-to-br from-[#0A2647] to-[#144272] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              {/* Candidate Photo Placeholder */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white/10 border-4 border-[#FFD700] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[64px] sm:text-[72px] mb-2">⚖️</div>
                    <p className="text-[14px] sm:text-[16px]">{t.hero.candidateName}</p>
                  </div>
                </div>
              </div>

              {/* Candidate Name - Always in Hindi */}
              <h2 className="text-[28px] sm:text-[36px]">
                <span className="text-[#FFD700]">{t.hero.candidateName}</span>
              </h2>

              {/* Primary Slogan - Always in Hindi */}
              <Card className="p-6 sm:p-8 bg-[#FFD700] border-0">
                <p className="text-[20px] sm:text-[24px] text-[#0A2647] leading-relaxed">
                  {t.hero.primarySlogan}
                </p>
              </Card>

              {/* Secondary Slogan - Always in Hindi */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-2 border-[#FFD700]">
                <p className="text-[18px] sm:text-[22px] text-white leading-relaxed">
                  {t.hero.secondarySlogan}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Title */}
        <section className="bg-white py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[28px] sm:text-[36px] text-[#0A2647] mb-2">
              {t.hero.searchTitle}
            </h2>
            <div className="w-24 h-1 bg-[#FFD700] mx-auto"></div>
          </div>
        </section>

        {/* Voter Search Section */}
        <VoterSearchSection
          searchTranslations={t.search}
          resultsTranslations={t.results}
          phonePromptTranslations={t.phonePrompt}
        />

        {/* Contact/Footer Section - Updated Design */}
        <section className="bg-gradient-to-br from-[#0A2647] to-[#144272] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Title - Always in Hindi */}
            <div className="text-center mb-8">
              <h2 className="text-[28px] sm:text-[36px] mb-3">
                {t.contact.joinCampaign}
              </h2>
              <p className="text-[18px] sm:text-[20px] text-white/90">
                {t.contact.joinSubtitle}
              </p>
              <div className="w-24 h-1 bg-[#FFD700] mx-auto mt-4"></div>
            </div>

            <div className="space-y-8">
              {/* WhatsApp Direct Message */}
              <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-2 border-[#FFD700] hover:bg-white/20 transition-all">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] text-white">
                    {t.contact.whatsappUpdate}
                  </h3>
                  <Button
                    onClick={handleWhatsApp}
                    size="lg"
                    className="text-[18px] sm:text-[20px] py-7 px-8 sm:px-12 bg-[#25D366] hover:bg-[#128C7E] text-white w-full sm:w-auto"
                  >
                    <MessageSquare className="w-6 h-6 mr-3" />
                    {t.contact.whatsappUpdate}
                  </Button>
                </div>
              </Card>

              {/* Contact Numbers */}
              <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-2 border-white/30">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#FFD700] flex items-center justify-center mx-auto">
                    <Phone className="w-10 h-10 text-[#0A2647]" />
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] text-white mb-4">
                    {t.contact.contactNumbers}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href="tel:+919415451856" className="text-[20px] text-white/90 hover:text-[#FFD700] transition-colors">
                      📞 +91 94154 51856
                    </a>
                    <a href="tel:+917905748686" className="text-[20px] text-white/90 hover:text-[#FFD700] transition-colors">
                      📞 +91 79057 48686
                    </a>
                    <a href="tel:+919514451856" className="text-[20px] text-white/90 hover:text-[#FFD700] transition-colors">
                      📞 +91 95144 51856
                    </a>
                    <a href="tel:+919415819786" className="text-[20px] text-white/90 hover:text-[#FFD700] transition-colors">
                      📞 +91 94158 19786
                    </a>
                  </div>
                  <div className="mt-4">
                    <a 
                      href="https://chat.whatsapp.com/EMnAZAnTaf1HjgAzFZJNsE?mode=wwt" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[18px] text-white/90 hover:text-[#FFD700] transition-colors bg-green-600/20 hover:bg-green-600/30 px-4 py-2 rounded-lg border border-green-500/30"
                    >
                      💬 WhatsApp Group
                    </a>
                  </div>
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm border-2 border-white/30">
                <div className="text-center space-y-4">
                  <h3 className="text-[22px] sm:text-[26px] text-white mb-4">
                    {t.contact.followUs}
                  </h3>
                  <div className="flex justify-center gap-6">
                    <Button
                      onClick={handleFacebookProfile}
                      size="lg"
                      className="bg-[#1877F2] hover:bg-[#145dbf] text-white gap-3 text-[18px] px-8 py-6"
                    >
                      <Facebook className="w-6 h-6" />
                      Facebook
                    </Button>
                    <Button
                      onClick={handleFacebookPage}
                      size="lg"
                      className="bg-[#1877F2] hover:bg-[#145dbf] text-white gap-3 text-[18px] px-8 py-6"
                    >
                      <Facebook className="w-6 h-6" />
                      Facebook Page
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2647] text-white py-8 px-4 border-t border-white/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-[24px]">⚖️</div>
          <h3 className="text-[20px]">{t.hero.candidateName}</h3>
          <p className="text-[16px] text-white/80">
            {language === "hi" 
              ? "बार कौंसिल ऑफ उत्तर प्रदेश चुनाव 2025"
              : "Bar Council of Uttar Pradesh Elections 2025"
            }
          </p>
          <div className="pt-4 border-t border-white/20">
            <p className="text-[14px] text-white/60">
              {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <Button
        onClick={handleWhatsApp}
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg z-40"
      >
        <MessageSquare className="w-7 h-7" />
      </Button>
    </div>
  );
}