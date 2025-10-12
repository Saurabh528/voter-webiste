import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { MessageSquare, Phone, MapPin, Send, Share2 } from "lucide-react";

interface ContactSectionProps {
  translations: {
    title: string;
    subtitle: string;
    chatTeam: string;
    chatDesc: string;
    openWhatsApp: string;
    phone: string;
    officeAddress: string;
    address: string;
    messageTitle: string;
    yourName: string;
    phoneNumber: string;
    message: string;
    messagePlaceholder: string;
    sendButton: string;
    thankYou: string;
    supportCampaign: string;
    shareDesc: string;
    namePlaceholder: string;
    phonePlaceholder: string;
  };
}

export function ContactSection({ translations: t }: ContactSectionProps) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) return;

    // In real implementation, send to backend
    console.log("Contact form submitted:", { contactName, contactPhone, contactMessage });
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setContactName("");
      setContactPhone("");
      setContactMessage("");
    }, 3000);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919999999999?text=Hello, I want to support Adv. Arun Kumar Tripathi", "_blank");
  };

  const handleShare = (platform: string) => {
    const shareText = "Vote for Adv. Arun Kumar Tripathi - Bar Council of UP Elections 2025";
    const shareUrl = window.location.href;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

  return (
    <section id="contact" className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] sm:text-[32px] text-[#0A2647] mb-3">
            {t.title}
          </h2>
          <div className="w-20 h-1 bg-[#FFD700] mx-auto mb-4"></div>
          <p className="text-[16px] sm:text-[18px] text-[#0A2647]/80">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* WhatsApp Contact */}
          <Card className="p-6 border-2 border-[#0A2647]/10 hover:border-[#25D366] transition-colors">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[20px] text-[#0A2647]">{t.chatTeam}</h3>
              <p className="text-[16px] text-[#0A2647]/70">
                {t.chatDesc}
              </p>
              <Button
                onClick={handleWhatsApp}
                className="w-full text-[18px] py-6 bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {t.openWhatsApp}
              </Button>
            </div>
          </Card>

          {/* Office Contact */}
          <Card className="p-6 border-2 border-[#0A2647]/10">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-[#0A2647] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[18px] text-[#0A2647] mb-1">{t.phone}</h4>
                  <p className="text-[16px] text-[#0A2647]/80">+91 99999 99999</p>
                  <p className="text-[16px] text-[#0A2647]/80">+91 88888 88888</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-[#0A2647] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[18px] text-[#0A2647] mb-1">{t.officeAddress}</h4>
                  <p className="text-[16px] text-[#0A2647]/80" style={{ whiteSpace: 'pre-line' }}>
                    {t.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20">
          <h3 className="text-[24px] text-[#0A2647] mb-6">{t.messageTitle}</h3>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#28a745] flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-white" />
              </div>
              <p className="text-[20px] text-[#28a745]">
                {t.thankYou}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-[18px] text-[#0A2647]">
                  {t.yourName}
                </Label>
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="text-[18px] py-6 border-2 border-[#0A2647]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-[18px] text-[#0A2647]">
                  {t.phoneNumber}
                </Label>
                <Input
                  id="contact-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="text-[18px] py-6 border-2 border-[#0A2647]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-[18px] text-[#0A2647]">
                  {t.message}
                </Label>
                <Textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  className="text-[18px] p-4 border-2 border-[#0A2647]/20 min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()}
                className="w-full text-[18px] py-7 bg-[#0A2647] hover:bg-[#144272] text-white gap-2"
              >
                <Send className="w-5 h-5" />
                {t.sendButton}
              </Button>
            </div>
          )}
        </Card>

        {/* Share Buttons */}
        <Card className="p-6 mt-6 border-2 border-[#FFD700] bg-[#FFD700]/5">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Share2 className="w-6 h-6 text-[#0A2647]" />
              <h3 className="text-[20px] text-[#0A2647]">{t.supportCampaign}</h3>
            </div>
            <p className="text-[16px] text-[#0A2647]/80">
              {t.shareDesc}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => handleShare("whatsapp")}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white text-[16px] px-6 py-5"
              >
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                className="bg-[#1877F2] hover:bg-[#145dbf] text-white text-[16px] px-6 py-5"
              >
                Facebook
              </Button>
              <Button
                onClick={() => handleShare("telegram")}
                className="bg-[#0088cc] hover:bg-[#006699] text-white text-[16px] px-6 py-5"
              >
                Telegram
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
