import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Search, CheckCircle2, XCircle } from "lucide-react";

// Mock COP database for demonstration
const copDatabase = [
  {
    name: "Rajesh Kumar Sharma",
    enrollmentNumber: "UP/12345/2010",
    copNumber: "COP-UP-12345-2010",
    district: "Lucknow"
  },
  {
    name: "Priya Singh",
    enrollmentNumber: "UP/67890/2015",
    copNumber: "COP-UP-67890-2015",
    district: "Kanpur"
  },
  {
    name: "Arun Kumar Tripathi",
    enrollmentNumber: "UP/11111/2008",
    copNumber: "COP-UP-11111-2008",
    district: "Allahabad"
  }
];

interface COPResult {
  name: string;
  enrollmentNumber: string;
  copNumber: string;
  district: string;
}

interface COPCheckSectionProps {
  translations: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    enrollmentLabel: string;
    enrollmentPlaceholder: string;
    searchButton: string;
    searching: string;
    clearButton: string;
    sampleData: string;
    verified: string;
    notFound: string;
    notFoundMsg: string;
    submitRequest: string;
    searchAgain: string;
    requestTitle: string;
    requestName: string;
    requestPhone: string;
    requestEnrollment: string;
    requestSubmit: string;
    requestSuccess: string;
    copNumber: string;
    district: string;
  };
}

export function COPCheckSection({ translations: t }: COPCheckSectionProps) {
  const [name, setName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [searchResult, setSearchResult] = useState<COPResult | null | "not-found">(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestEnrollment, setRequestEnrollment] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleSearch = () => {
    if (!name.trim() || !enrollmentNumber.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const result = copDatabase.find(
        voter =>
          voter.name.toLowerCase().includes(name.toLowerCase().trim()) &&
          voter.enrollmentNumber.toLowerCase().includes(enrollmentNumber.toLowerCase().trim())
      );
      setSearchResult(result || "not-found");
      setIsSearching(false);
    }, 500);
  };

  const handleReset = () => {
    setName("");
    setEnrollmentNumber("");
    setSearchResult(null);
    setShowRequestForm(false);
  };

  const handleSubmitRequest = () => {
    if (!requestName.trim() || !requestPhone.trim() || !requestEnrollment.trim()) return;
    
    // In real implementation, this would send data to backend
    console.log("Request submitted:", { requestName, requestPhone, requestEnrollment });
    setRequestSubmitted(true);
    
    setTimeout(() => {
      setRequestSubmitted(false);
      setShowRequestForm(false);
      setRequestName("");
      setRequestPhone("");
      setRequestEnrollment("");
    }, 3000);
  };

  return (
    <section id="cop-check" className="py-12 px-4 bg-white">
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

        {!searchResult ? (
          <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20 shadow-lg">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="cop-name" className="text-[18px] text-[#0A2647]">
                  {t.nameLabel}
                </Label>
                <Input
                  id="cop-name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-[18px] py-6 px-4 border-2 border-[#0A2647]/20 focus:border-[#FFD700]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="cop-enrollment" className="text-[18px] text-[#0A2647]">
                  {t.enrollmentLabel}
                </Label>
                <Input
                  id="cop-enrollment"
                  type="text"
                  placeholder={t.enrollmentPlaceholder}
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-[18px] py-6 px-4 border-2 border-[#0A2647]/20 focus:border-[#FFD700]"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSearch}
                  disabled={!name.trim() || !enrollmentNumber.trim() || isSearching}
                  size="lg"
                  className="flex-1 text-[18px] py-7 gap-3 bg-[#0A2647] hover:bg-[#144272] text-white"
                >
                  <Search className="w-6 h-6" />
                  {isSearching ? t.searching : t.searchButton}
                </Button>
                <Button
                  onClick={() => {
                    setName("");
                    setEnrollmentNumber("");
                  }}
                  variant="outline"
                  size="lg"
                  className="text-[18px] py-7 px-6 border-2 border-[#0A2647]/20"
                >
                  {t.clearButton}
                </Button>
              </div>

              {/* Sample Data */}
              <Card className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30">
                <p className="text-[14px] text-[#0A2647] mb-2">{t.sampleData}</p>
                <div className="text-[14px] text-[#0A2647]/80 space-y-1">
                  <p>• {t.nameLabel}: Rajesh Kumar Sharma | {t.enrollmentLabel}: UP/12345/2010</p>
                  <p>• {t.nameLabel}: Priya Singh | {t.enrollmentLabel}: UP/67890/2015</p>
                </div>
              </Card>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {searchResult === "not-found" ? (
              <Card className="p-6 sm:p-8 bg-[#ffe6e6] border-4 border-[#d32f2f]">
                <div className="text-center space-y-4">
                  <XCircle className="w-16 h-16 text-[#d32f2f] mx-auto" />
                  <h3 className="text-[28px] text-[#d32f2f]">{t.notFound}</h3>
                  <p className="text-[18px] text-[#d32f2f]/90">
                    {t.notFoundMsg}
                  </p>

                  {!showRequestForm ? (
                    <Button
                      onClick={() => setShowRequestForm(true)}
                      size="lg"
                      className="text-[18px] py-6 px-8 bg-[#0A2647] hover:bg-[#144272] text-white"
                    >
                      {t.submitRequest}
                    </Button>
                  ) : requestSubmitted ? (
                    <Card className="p-6 bg-[#d4edda] border-2 border-[#28a745]">
                      <div className="flex items-center justify-center gap-3 text-[#155724]">
                        <CheckCircle2 className="w-6 h-6" />
                        <p className="text-[18px]">{t.requestSuccess}</p>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6 bg-white border-2 border-[#0A2647]/20 text-left">
                      <h4 className="text-[20px] text-[#0A2647] mb-4">{t.requestTitle}</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="request-name" className="text-[16px]">{t.requestName}</Label>
                          <Input
                            id="request-name"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className="text-[16px] py-5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="request-phone" className="text-[16px]">{t.requestPhone}</Label>
                          <Input
                            id="request-phone"
                            value={requestPhone}
                            onChange={(e) => setRequestPhone(e.target.value)}
                            placeholder={t.requestPhone}
                            className="text-[16px] py-5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="request-enrollment" className="text-[16px]">{t.requestEnrollment}</Label>
                          <Input
                            id="request-enrollment"
                            value={requestEnrollment}
                            onChange={(e) => setRequestEnrollment(e.target.value)}
                            placeholder={t.enrollmentPlaceholder}
                            className="text-[16px] py-5"
                          />
                        </div>
                        <Button
                          onClick={handleSubmitRequest}
                          disabled={!requestName.trim() || !requestPhone.trim() || !requestEnrollment.trim()}
                          className="w-full text-[18px] py-6 bg-[#0A2647] hover:bg-[#144272]"
                        >
                          {t.requestSubmit}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 sm:p-8 bg-[#d4edda] border-4 border-[#28a745]">
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <CheckCircle2 className="w-16 h-16 text-[#28a745] mx-auto" />
                    <h3 className="text-[28px] text-[#155724]">✅ {t.verified}</h3>
                  </div>

                  <div className="space-y-4 bg-white p-6 rounded-lg border-2 border-[#28a745]">
                    <div className="space-y-2">
                      <p className="text-[16px] text-[#0A2647]/70">{t.nameLabel}:</p>
                      <p className="text-[20px] text-[#0A2647]">{searchResult.name}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[16px] text-[#0A2647]/70">{t.enrollmentLabel}:</p>
                      <p className="text-[20px] text-[#0A2647]">{searchResult.enrollmentNumber}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[16px] text-[#0A2647]/70">{t.copNumber}:</p>
                      <p className="text-[20px] text-[#0A2647]">{searchResult.copNumber}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[16px] text-[#0A2647]/70">{t.district}:</p>
                      <p className="text-[20px] text-[#0A2647]">{searchResult.district}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                size="lg"
                className="text-[18px] py-7 px-12 bg-[#0A2647] hover:bg-[#144272] gap-3"
              >
                <Search className="w-6 h-6" />
                {t.searchAgain}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
