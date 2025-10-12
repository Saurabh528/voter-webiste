import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { CheckCircle2, XCircle, Search, MessageSquare, Phone } from "lucide-react";
import { upDistricts } from "../utils/translations";
import { searchByEnrollment, searchByNameDistrict } from "../utils/api";
import type { VoterResult as ApiVoterResult } from "../utils/api";

interface VoterResult {
  name: string;
  enrollmentNumber: string;
  copNumber: string;
  address: string;
  district: string;
}

interface VoterSearchSectionProps {
  searchTranslations: {
    tabEnrollment: string;
    tabNameDistrict: string;
    enrollmentLabel: string;
    enrollmentPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    districtLabel: string;
    districtPlaceholder: string;
    searchButton: string;
    searching: string;
    clearButton: string;
  };
  resultsTranslations: {
    registered: string;
    notRegistered: string;
    notRegisteredContact: string;
    contactNumber: string;
    enrollmentNumber: string;
    copNumber: string;
    address: string;
    searchAgain: string;
    joinWhatsApp: string;
    joinWhatsAppButton: string;
  };
  phonePromptTranslations: {
    title: string;
    message: string;
    phonePlaceholder: string;
    submitButton: string;
    skipButton: string;
  };
}

export function VoterSearchSection({ 
  searchTranslations: st, 
  resultsTranslations: rt,
  phonePromptTranslations: pt 
}: VoterSearchSectionProps) {
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResult, setSearchResult] = useState<VoterResult | null | "not-found">(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [pendingSearchType, setPendingSearchType] = useState<"enrollment" | "name-district" | null>(null);

  const initiateSearch = (type: "enrollment" | "name-district") => {
    // Validate before showing phone prompt
    if (type === "enrollment" && !enrollmentNumber.trim()) return;
    if (type === "name-district" && (!name.trim() || !district)) return;

    // Show phone prompt before search
    setPendingSearchType(type);
    setShowPhonePrompt(true);
  };

  const executeSearch = async () => {
    if (!pendingSearchType) return;

    // Save phone number if provided
    if (tempPhone.trim()) {
      setPhoneNumber(tempPhone);
    }

    setIsSearching(true);
    setShowPhonePrompt(false);

    try {
      let response;
      if (pendingSearchType === "enrollment") {
        response = await searchByEnrollment({
          enrollmentNumber: enrollmentNumber.trim(),
          phoneNumber: tempPhone.trim() || undefined
        });
      } else {
        response = await searchByNameDistrict({
          name: name.trim(),
          district: district,
          phoneNumber: tempPhone.trim() || undefined
        });
      }

      if (response.found && response.data) {
        setSearchResult({
          name: response.data.name,
          enrollmentNumber: response.data.enrollmentNumber,
          copNumber: response.data.copNumber?.toString() || '',
          address: response.data.address,
          district: response.data.district
        });
      } else {
        setSearchResult("not-found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult("not-found");
    } finally {
      setIsSearching(false);
      setPendingSearchType(null);
      setTempPhone("");
    }
  };

  const skipPhoneAndSearch = async () => {
    setShowPhonePrompt(false);
    setTempPhone("");
    
    // Execute search without phone
    setIsSearching(true);
    
    try {
      let response;
      if (pendingSearchType === "enrollment") {
        response = await searchByEnrollment({
          enrollmentNumber: enrollmentNumber.trim()
        });
      } else {
        response = await searchByNameDistrict({
          name: name.trim(),
          district: district
        });
      }

      if (response.found && response.data) {
        setSearchResult({
          name: response.data.name,
          enrollmentNumber: response.data.enrollmentNumber,
          copNumber: response.data.copNumber?.toString() || '',
          address: response.data.address,
          district: response.data.district
        });
      } else {
        setSearchResult("not-found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult("not-found");
    } finally {
      setIsSearching(false);
      setPendingSearchType(null);
    }
  };

  const saveSearchData = (data: any) => {
    // In real implementation, this would send to backend
    console.log("Search data saved:", data);
    // Save to localStorage for demo
    const searches = JSON.parse(localStorage.getItem("voterSearches") || "[]");
    searches.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem("voterSearches", JSON.stringify(searches));
  };

  const joinWhatsAppGroup = () => {
    window.open("https://wa.me/919415300191?text=नमस्ते, मैं श्री अरुण त्रिपाठी जी के अभियान से जुड़ना चाहता/चाहती हूँ।", "_blank");
  };

  const callContact = () => {
    window.location.href = "tel:+919415300191";
  };

  const handleReset = () => {
    setEnrollmentNumber("");
    setName("");
    setDistrict("");
    setSearchResult(null);
    setTempPhone("");
    setPhoneNumber("");
  };

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {!searchResult ? (
          <Tabs defaultValue="enrollment" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto p-2 mb-6">
              <TabsTrigger value="enrollment" className="text-[18px] py-4">
                {st.tabEnrollment}
              </TabsTrigger>
              <TabsTrigger value="name" className="text-[18px] py-4">
                {st.tabNameDistrict}
              </TabsTrigger>
            </TabsList>

            {/* Enrollment Number Search */}
            <TabsContent value="enrollment">
              <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20 shadow-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="enrollment" className="text-[20px] text-[#0A2647]">
                      {st.enrollmentLabel}
                    </Label>
                    <Input
                      id="enrollment"
                      type="text"
                      placeholder={st.enrollmentPlaceholder}
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && initiateSearch("enrollment")}
                      className="text-[20px] py-7 px-4 border-2 border-[#0A2647]/20 focus:border-[#FFD700]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => initiateSearch("enrollment")}
                      disabled={!enrollmentNumber.trim() || isSearching}
                      size="lg"
                      className="flex-1 text-[22px] py-8 gap-3 bg-[#0A2647] hover:bg-[#144272] text-white"
                    >
                      {isSearching ? st.searching : st.searchButton}
                    </Button>
                    <Button
                      onClick={() => setEnrollmentNumber("")}
                      variant="outline"
                      size="lg"
                      className="text-[20px] py-8 px-8 border-2 border-[#0A2647]/20"
                    >
                      {st.clearButton}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Name and District Search */}
            <TabsContent value="name">
              <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20 shadow-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[20px] text-[#0A2647]">
                      {st.nameLabel}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={st.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-[20px] py-7 px-4 border-2 border-[#0A2647]/20 focus:border-[#FFD700]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="district" className="text-[20px] text-[#0A2647]">
                      {st.districtLabel}
                    </Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger className="text-[20px] py-7 px-4 border-2 border-[#0A2647]/20">
                        <SelectValue placeholder={st.districtPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {upDistricts.map((dist) => (
                          <SelectItem key={dist} value={dist} className="text-[18px] py-3">
                            {dist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => initiateSearch("name-district")}
                      disabled={!name.trim() || !district || isSearching}
                      size="lg"
                      className="flex-1 text-[22px] py-8 gap-3 bg-[#0A2647] hover:bg-[#144272] text-white"
                    >
                      {isSearching ? st.searching : st.searchButton}
                    </Button>
                    <Button
                      onClick={() => {
                        setName("");
                        setDistrict("");
                      }}
                      variant="outline"
                      size="lg"
                      className="text-[20px] py-8 px-8 border-2 border-[#0A2647]/20"
                    >
                      {st.clearButton}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Results Display */}
            {searchResult === "not-found" ? (
              <Card className="p-8 sm:p-12 bg-[#ffebee] border-4 border-[#d32f2f]">
                <div className="text-center space-y-6">
                  <XCircle className="w-24 h-24 text-[#d32f2f] mx-auto" />
                  <div className="space-y-4">
                    <h3 className="text-[32px] sm:text-[36px] text-[#c62828]">
                      ❌ {rt.notRegistered}
                    </h3>
                    <div className="bg-white p-6 rounded-lg border-2 border-[#d32f2f] space-y-3">
                      <p className="text-[20px] sm:text-[24px] text-[#0A2647] leading-relaxed">
                        {rt.notRegisteredContact}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a 
                          href="tel:+919415300191"
                          className="text-[28px] sm:text-[32px] text-[#0A2647] hover:text-[#d32f2f] transition-colors flex items-center gap-3"
                        >
                          <Phone className="w-8 h-8" />
                          {rt.contactNumber}
                        </a>
                        <Button
                          onClick={callContact}
                          size="lg"
                          className="text-[18px] py-6 px-8 bg-[#0A2647] hover:bg-[#144272] text-white"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          कॉल करें
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 sm:p-12 bg-[#e8f5e9] border-4 border-[#388e3c]">
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="w-24 h-24 text-[#388e3c] mx-auto" />
                    <div className="bg-white p-6 sm:p-8 rounded-lg border-2 border-[#388e3c]">
                      <h3 className="text-[24px] sm:text-[28px] text-[#2e7d32] leading-relaxed">
                        ✔️ {rt.registered}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white p-6 sm:p-8 rounded-lg border-2 border-[#388e3c]">
                    <div className="space-y-2">
                      <p className="text-[18px] text-[#0A2647]/70">{rt.enrollmentNumber}:</p>
                      <p className="text-[24px] text-[#0A2647]">{searchResult.enrollmentNumber}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[18px] text-[#0A2647]/70">{rt.copNumber}:</p>
                      <p className="text-[24px] text-[#0A2647]">{searchResult.copNumber}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[18px] text-[#0A2647]/70">{rt.address}:</p>
                      <p className="text-[24px] text-[#0A2647]">{searchResult.address}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Join WhatsApp Button - Shown for both cases */}
            <div className="flex justify-center">
              <Button
                onClick={joinWhatsAppGroup}
                size="lg"
                className="text-[20px] sm:text-[22px] py-8 px-8 sm:px-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 w-full sm:w-auto"
              >
                <MessageSquare className="w-6 h-6" />
                {rt.joinWhatsAppButton}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="text-[22px] py-8 px-16 border-2 border-[#0A2647]/20 gap-3"
              >
                <Search className="w-6 h-6" />
                {rt.searchAgain}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Prompt Dialog - Shown BEFORE Search */}
      <Dialog open={showPhonePrompt} onOpenChange={setShowPhonePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[24px] text-[#0A2647] text-center">
              {pt.title}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-[#0A2647]/80 text-center pt-2">
              {pt.message}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#0A2647]" />
              </div>
            </div>
            <Input
              type="tel"
              placeholder={pt.phonePlaceholder}
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tempPhone.trim() && executeSearch()}
              className="text-[18px] py-6 border-2"
            />
            <div className="space-y-3">
              <Button
                onClick={executeSearch}
                disabled={!tempPhone.trim()}
                className="w-full text-[18px] py-6 bg-[#0A2647] hover:bg-[#144272]"
              >
                {pt.submitButton}
              </Button>
              <Button
                onClick={skipPhoneAndSearch}
                variant="outline"
                className="w-full text-[18px] py-6 border-2"
              >
                {pt.skipButton}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
