import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { CheckCircle2, XCircle, Search, MessageSquare, Phone } from "lucide-react";
import { upDistricts, districtMappings } from "../utils/translations";
import { searchByEnrollment, searchByNameDistrict, getBilingualDistricts } from "../utils/api";
import { sanitizeEnrollmentInput, sanitizeNameInput, isEnrollmentInputSafe, isNameInputSafe } from "../utils/inputSanitization";
import { PhoneInput } from "./ui/phone-input";
import type { VoterResult as ApiVoterResult } from "../utils/api";

interface VoterResult {
  name: string;
  enrollmentNumber: string;
  copNumber: string;
  address: string;
  district: string;
  noCopNumber?: boolean;
  slNo?: string;
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
    callButton: string;
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
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResult, setSearchResult] = useState<VoterResult | null | "not-found">(null);
  const [allResults, setAllResults] = useState<VoterResult[]>([]); // Store all matching results
  const [totalResults, setTotalResults] = useState<number>(0); // Store total results count from backend
  const [isSearching, setIsSearching] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [pendingSearchType, setPendingSearchType] = useState<"enrollment" | "name-district" | null>(null);
  const [bilingualDistricts, setBilingualDistricts] = useState<Array<{
    english: string;
    hindi: string;
    display: string;
    value: string;
  }>>([]);
  const [districtsLoaded, setDistrictsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"enrollment" | "name">("enrollment");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  // Fetch bilingual districts on mount
  useEffect(() => {
    async function loadDistricts() {
      try {
        console.log('Loading bilingual districts...');
        const response = await getBilingualDistricts();
        console.log('Bilingual districts response:', response);
        if (response.districts && response.districts.length > 0) {
          setBilingualDistricts(response.districts);
        }
        setDistrictsLoaded(true);
      } catch (error) {
        console.error('Failed to load bilingual districts, using default:', error);
        // Use default fallback from translations
        setDistrictsLoaded(true);
      }
    }
    loadDistricts();
  }, []);

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

    // Save phone number if provided (validation already done by PhoneInput)
    if (tempPhone.trim()) {
      setPhoneNumber(tempPhone);
    }

    setIsSearching(true);
    setShowPhonePrompt(false);

    try {
      let response;
      
      // Test missing COP number functionality
      if (pendingSearchType === "enrollment" && enrollmentNumber.trim().toUpperCase() === "TEST") {
        const testResponse = await fetch('http://localhost:3001/api/test/missing-cop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        response = await testResponse.json();
      } else if (pendingSearchType === "enrollment") {
        console.log('Searching enrollment:', enrollmentNumber.trim());
        response = await searchByEnrollment({
          enrollmentNumber: enrollmentNumber.trim(),
          phoneNumber: tempPhone.trim() || undefined
        });
        console.log('Enrollment search response:', response);
      } else {
        response = await searchByNameDistrict({
          name: name.trim(),
          district: district,
          phoneNumber: tempPhone.trim() || undefined
        });
      }

      if (response.found && (response.data || (response as any).allResults)) {
        // Store first result for backward compatibility (use first allResults item if data is missing)
        const firstResult = response.data || (response as any).allResults?.[0];
        if (firstResult) {
          setSearchResult({
            name: firstResult.name,
            enrollmentNumber: firstResult.enrollmentNumber,
            copNumber: firstResult.copNumber?.toString() || '',
            address: firstResult.address,
            district: firstResult.district,
            noCopNumber: response.noCopNumber || false,
            slNo: firstResult.slNo
          });
        }

        // Store total results count from backend
        setTotalResults((response as any).totalResults || 0);

        // Store all results if available
        if ((response as any).allResults) {
          const results = (response as any).allResults.map((r: any) => ({
            name: r.name,
            enrollmentNumber: r.enrollmentNumber,
            copNumber: r.copNumber?.toString() || '',
            address: r.address,
            district: r.district,
            noCopNumber: !r.copNumber || r.copNumber === null || r.copNumber === '' || response.noCopNumber || false,
            slNo: r.slNo
          }));
          setAllResults(results);
        } else {
          setAllResults([{
            name: response.data.name,
            enrollmentNumber: response.data.enrollmentNumber,
            copNumber: response.data.copNumber?.toString() || '',
            address: response.data.address,
            district: response.data.district,
            noCopNumber: response.noCopNumber || false,
            slNo: response.data.slNo
          }]);
        }
      } else {
        setSearchResult("not-found");
        setAllResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult("not-found");
      setAllResults([]);
    } finally {
      setIsSearching(false);
      setPendingSearchType(null);
      setTempPhone("");
      setIsPhoneValid(false);
    }
  };

  const skipPhoneAndSearch = async () => {
    setShowPhonePrompt(false);
    setTempPhone("");
    
    // Execute search without phone
    setIsSearching(true);
    
    try {
      let response;
      
      // Test missing COP number functionality
      if (pendingSearchType === "enrollment" && enrollmentNumber.trim().toUpperCase() === "TEST") {
        const testResponse = await fetch('http://localhost:3001/api/test/missing-cop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        response = await testResponse.json();
      } else if (pendingSearchType === "enrollment") {
        response = await searchByEnrollment({
          enrollmentNumber: enrollmentNumber.trim()
        });
      } else {
        response = await searchByNameDistrict({
          name: name.trim(),
          district: district
        });
      }

      if (response.found && (response.data || (response as any).allResults)) {
        // Store first result for backward compatibility (use first allResults item if data is missing)
        const firstResult = response.data || (response as any).allResults?.[0];
        if (firstResult) {
          setSearchResult({
            name: firstResult.name,
            enrollmentNumber: firstResult.enrollmentNumber,
            copNumber: firstResult.copNumber?.toString() || '',
            address: firstResult.address,
            district: firstResult.district,
            noCopNumber: (response as any).noCopNumber || false,
            slNo: firstResult.slNo
          });
        }

        // Store total results count from backend
        setTotalResults((response as any).totalResults || 0);

        // Store all results if available
        if ((response as any).allResults) {
          const results = (response as any).allResults.map((r: any) => ({
            name: r.name,
            enrollmentNumber: r.enrollmentNumber,
            copNumber: r.copNumber?.toString() || '',
            address: r.address,
            district: r.district,
            noCopNumber: !r.copNumber || r.copNumber === null || r.copNumber === '' || (response as any).noCopNumber || false,
            slNo: r.slNo
          }));
          setAllResults(results);
        } else {
          setAllResults([{
            name: response.data.name,
            enrollmentNumber: response.data.enrollmentNumber,
            copNumber: response.data.copNumber?.toString() || '',
            address: response.data.address,
            district: response.data.district,
            noCopNumber: (response as any).noCopNumber || false,
            slNo: response.data.slNo
          }]);
        }
      } else {
        setSearchResult("not-found");
        setAllResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult("not-found");
      setAllResults([]);
    } finally {
      setIsSearching(false);
      setPendingSearchType(null);
      setIsPhoneValid(false);
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
    window.open("https://chat.whatsapp.com/Li9S9v5yaNEKIu5oVsUBaa?mode=wwt", "_blank");
  };

  const callContact = () => {
    window.location.href = "tel:+919721777720";
  };

  const handleReset = () => {
    setEnrollmentNumber("");
    setName("");
    setDistrict("");
    setSearchResult(null);
    setAllResults([]);
    setTotalResults(0);
    setTempPhone("");
    setPhoneNumber("");
    setIsPhoneValid(false);
    setCurrentPage(1);
  };

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {!searchResult ? (
          <div className="w-full">
            {/* Search Method Selection */}
            <div className="mb-8">
              <div className="text-center mb-6 p-4 bg-[#FFD700]/20 border-2 border-[#FFD700] rounded-xl">
                <Label className="text-[20px] sm:text-[24px] text-[#0A2647] font-bold block leading-relaxed">
                  {/[\u0900-\u097F]/.test(st.tabEnrollment)
                    ? 'कृपया नीचे दिए गए बटन पर क्लिक करके चयन खोज विकल्प (नामांकन / नाम) चुनें।'
                    : 'Select the search option (Enrollment/Name) by clicking the button below'
                  }
                </Label>
                
                {/* Pointing Arrows */}
                <div className="flex justify-center items-center mt-4 gap-2">
                  <div className="text-[36px] text-red-600 animate-bounce">👇</div>
                  <div className="text-[36px] text-red-600 animate-bounce" style={{ animationDelay: '0.1s' }}>👇</div>
                  <div className="text-[36px] text-red-600 animate-bounce" style={{ animationDelay: '0.2s' }}>👇</div>
                </div>
                
                {/* CSS Arrow pointing down */}
                <div className="flex justify-center mt-2">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-600 animate-pulse"></div>
                </div>
              </div>
              
              {/* Flashing Border Around Dropdown */}
              <div className="relative p-2 border-4 border-red-500 rounded-xl animate-pulse bg-red-100/30">
                <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-red-600 rounded-xl animate-ping"></div>
                
                <Select
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as "enrollment" | "name")}
                >
                  <SelectTrigger
                    className="w-full py-10 px-6 text-[22px] sm:text-[26px] font-bold border-4 border-[#0A2647] bg-gradient-to-r from-white to-[#FFD700]/10 hover:from-[#FFD700]/20 hover:to-[#FFD700]/30 focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/30 rounded-xl shadow-2xl transition-all duration-300 cursor-pointer relative z-10"
                    aria-label="Select search method"
                  >
                  <SelectValue
                    placeholder={
                      /[\u0900-\u097F]/.test(st.tabEnrollment)
                        ? "👇 यहाँ क्लिक करें 👇"
                        : "👇 Click Here 👇"
                    }
                  >
                    <span className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-4">
                        {activeTab === "enrollment" && (
                          <>
                            <span className="text-[32px]">📋</span>
                            <span>{st.tabEnrollment}</span>
                          </>
                        )}
                        {activeTab === "name" && (
                          <>
                            <span className="text-[32px]">👤</span>
                            <span>{st.tabNameDistrict}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[28px] text-[#0A2647]/60">▼</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="w-full border-4 border-[#0A2647] shadow-2xl bg-white rounded-xl z-50"
                  position="popper"
                  sideOffset={4}
                >
                  <div className="p-2">
                    <SelectItem
                      value="enrollment"
                      className="text-[20px] sm:text-[22px] py-6 px-4 hover:bg-[#FFD700]/30 focus:bg-[#FFD700]/40 cursor-pointer rounded-lg mb-2 border-2 border-transparent hover:border-[#0A2647]/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <span className="text-[28px]">📋</span>
                        <span className="font-bold text-[#0A2647]">{st.tabEnrollment}</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="name"
                      className="text-[20px] sm:text-[22px] py-6 px-4 hover:bg-[#FFD700]/30 focus:bg-[#FFD700]/40 cursor-pointer rounded-lg border-2 border-transparent hover:border-[#0A2647]/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <span className="text-[28px]">👤</span>
                        <span className="font-bold text-[#0A2647]">{st.tabNameDistrict}</span>
                      </div>
                    </SelectItem>
                  </div>
                </SelectContent>
                </Select>
              </div>
              
              {/* Side Arrows pointing to dropdown */}
              <div className="flex justify-between items-center mt-2 px-4">
                <div className="text-[40px] text-red-600 animate-bounce" style={{ animationDelay: '0.3s' }}>👉</div>
                <div className="text-[16px] text-red-600 font-bold animate-pulse">
                  {/[\u0900-\u097F]/.test(st.tabEnrollment) ? 'यहाँ क्लिक करें!' : 'CLICK HERE!'}
                </div>
                <div className="text-[40px] text-red-600 animate-bounce" style={{ animationDelay: '0.3s' }}>👈</div>
              </div>
            </div>

            {/* Enrollment Number Search */}
            {activeTab === "enrollment" && (
              <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20 shadow-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="enrollment" className="text-[22px] sm:text-[24px] text-[#0A2647] font-bold">
                      {st.enrollmentLabel}
                    </Label>
                    <Input
                      id="enrollment"
                      type="text"
                      placeholder={st.enrollmentPlaceholder}
                      value={enrollmentNumber}
                      onChange={(e) => {
                        if (isEnrollmentInputSafe(e.target.value)) {
                          setEnrollmentNumber(sanitizeEnrollmentInput(e.target.value));
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && initiateSearch("enrollment")}
                      className="py-8 px-5 border-2 border-[#0A2647]/20 focus:border-[#FFD700] focus:border-4 rounded-lg"
                      style={{
                        fontSize: '26px',
                        color: '#0A2647',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => initiateSearch("enrollment")}
                      disabled={!enrollmentNumber.trim() || isSearching}
                      size="lg"
                      className="flex-1 text-[22px] py-8 gap-3 bg-[#0A2647] hover:bg-[#144272] text-white font-bold"
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
            )}

            {/* Name and District Search */}
            {activeTab === "name" && (
              <Card className="p-6 sm:p-8 border-2 border-[#0A2647]/20 shadow-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[22px] sm:text-[24px] text-[#0A2647] font-bold">
                      {st.nameLabel}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={st.namePlaceholder}
                      value={name}
                      onChange={(e) => {
                        if (isNameInputSafe(e.target.value)) {
                          setName(sanitizeNameInput(e.target.value));
                        }
                      }}
                      className="py-8 px-5 border-2 border-[#0A2647]/20 focus:border-[#FFD700] focus:border-4 rounded-lg"
                      style={{
                        fontSize: '26px',
                        color: '#0A2647',
                        fontWeight: '700'
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="district" className="text-[22px] sm:text-[24px] text-[#0A2647] font-bold">
                      {st.districtLabel}
                    </Label>

                    {/* Industry Standard Dropdown */}
                    <div className="relative">
                      <div
                        onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                        className="py-8 px-5 border-2 border-[#0A2647]/20 rounded-lg cursor-pointer bg-white hover:border-[#FFD700] transition-colors flex items-center justify-between"
                        style={{
                          fontSize: '26px',
                          color: district ? '#0A2647' : '#9CA3AF',
                          fontWeight: '700'
                        }}
                      >
                        <span>
                          {district ? (bilingualDistricts.find(d => d.value === district)?.display || district) : st.districtPlaceholder}
                        </span>
                        <span className="text-gray-400 text-[24px]">▼</span>
                      </div>

                      {isDistrictDropdownOpen && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDistrictDropdownOpen(false)}
                          />

                          {/* Dropdown List */}
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50">
                            {/* Search Input */}
                            <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
                              <Input
                                type="text"
                                placeholder="Type to search..."
                                value={districtSearchTerm}
                                onChange={(e) => setDistrictSearchTerm(e.target.value)}
                                className="text-[20px] text-[#0A2647] font-semibold py-3 border-2 border-gray-300"
                                autoFocus
                              />
                            </div>

                            {/* Scrollable List - Shows only 4 items, scroll for more */}
                            <div
                              className="overflow-y-scroll overflow-x-hidden"
                              style={{ maxHeight: '240px' }}
                            >
                              {(districtsLoaded && bilingualDistricts.length > 0
                                ? bilingualDistricts
                                : upDistricts.map(d => ({
                                    value: d,
                                    display: `${d} (${districtMappings[d]})`,
                                    english: d,
                                    hindi: districtMappings[d]
                                  }))
                              )
                                .filter(dist =>
                                  !districtSearchTerm ||
                                  dist.display.toLowerCase().includes(districtSearchTerm.toLowerCase()) ||
                                  dist.english.toLowerCase().includes(districtSearchTerm.toLowerCase()) ||
                                  dist.hindi.includes(districtSearchTerm)
                                )
                                .map((dist) => (
                                  <div
                                    key={dist.value}
                                    onClick={() => {
                                      setDistrict(dist.value);
                                      setDistrictSearchTerm("");
                                      setIsDistrictDropdownOpen(false);
                                    }}
                                    className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                  >
                                    <span className="text-[20px] text-[#0A2647] font-medium">
                                      {dist.english} <span className="text-gray-600">({dist.hindi})</span>
                                    </span>
                                  </div>
                                ))
                              }

                              {/* No results */}
                              {(districtsLoaded && bilingualDistricts.length > 0
                                ? bilingualDistricts
                                : upDistricts.map(d => ({
                                    value: d,
                                    display: `${d} (${districtMappings[d]})`,
                                    english: d,
                                    hindi: districtMappings[d]
                                  }))
                              ).filter(dist =>
                                !districtSearchTerm ||
                                dist.display.toLowerCase().includes(districtSearchTerm.toLowerCase()) ||
                                dist.english.toLowerCase().includes(districtSearchTerm.toLowerCase()) ||
                                dist.hindi.includes(districtSearchTerm)
                              ).length === 0 && (
                                <div className="px-4 py-6 text-center text-gray-500 text-[15px]">
                                  No district found
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => initiateSearch("name-district")}
                      disabled={!name.trim() || !district || isSearching}
                      size="lg"
                      className="flex-1 text-[22px] py-8 gap-3 bg-[#0A2647] hover:bg-[#144272] text-white font-bold"
                    >
                      {isSearching ? st.searching : st.searchButton}
                    </Button>
                    <Button
                      onClick={() => {
                        setName("");
                        setDistrict("");
                        setDistrictSearchTerm("");
                      }}
                      variant="outline"
                      size="lg"
                      className="text-[20px] py-8 px-8 border-2 border-[#0A2647]/20 font-semibold"
                    >
                      {st.clearButton}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
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
                          href="tel:+919721777720"
                          className="text-[28px] sm:text-[32px] text-[#0A2647] hover:text-[#d32f2f] transition-colors flex items-center gap-3"
                        >
                          <Phone className="w-8 h-8" />
                          +91 97217 77720
                        </a>
                        <Button
                          onClick={callContact}
                          size="lg"
                          className="text-[18px] py-6 px-8 bg-[#0A2647] hover:bg-[#144272] text-white"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          {rt.callButton}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
                <div className="space-y-6">
                {/* Single Result with COP - Green Success Message */}
                {allResults.length === 1 && !allResults[0].noCopNumber && (
                  <Card className="p-6 sm:p-8 bg-[#e8f5e9] border-4 border-[#388e3c]">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <CheckCircle2 className="w-20 h-20 text-[#388e3c]" />
                      </div>
                      <h3 className="text-[24px] sm:text-[28px] text-[#2e7d32] font-bold leading-relaxed">
                        ✔️ आप एक पंजीकृत मतदाता हैं!
                      </h3>
                      <p className="text-[20px] sm:text-[24px] text-[#1b5e20] leading-relaxed font-semibold">
                        अब वकीलों के हक़ और सम्मान की इस लड़ाई में, अपना बहुमूल्य वोट देकर श्री अरुण कुमार त्रिपाठी को प्रथम वरीयता (1) पर विजयी बनाने की कृपा करें।
                      </p>
                    </div>
                  </Card>
                )}

                {/* Single Result without COP - Red Warning */}
                {allResults.length === 1 && allResults[0].noCopNumber && (
                  <Card className="p-6 sm:p-8 bg-[#ffebee] border-4 border-[#d32f2f]">
                    <div className="text-center space-y-6">
                      <XCircle className="w-24 h-24 text-[#d32f2f] mx-auto" />
                      <div className="space-y-4">
                        <h3 className="text-[32px] sm:text-[36px] text-[#c62828] font-bold">
                          ❌ {rt.notRegistered}
                        </h3>
                        <div className="bg-white p-6 rounded-lg border-2 border-[#d32f2f] space-y-3">
                          <p className="text-[20px] sm:text-[24px] text-[#0A2647] leading-relaxed">
                            {rt.notRegisteredContact}
                          </p>
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <a
                              href="tel:+919721777720"
                              className="text-[28px] sm:text-[32px] text-[#0A2647] hover:text-[#d32f2f] transition-colors flex items-center gap-3"
                            >
                              <Phone className="w-8 h-8" />
                              +91 97217 77720
                            </a>
                            <Button
                              onClick={callContact}
                              size="lg"
                              className="text-[18px] py-6 px-8 bg-[#0A2647] hover:bg-[#144272] text-white"
                            >
                              <Phone className="w-5 h-5 mr-2" />
                              {rt.callButton}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Multiple Results - Show Total and Campaign Message */}
                {allResults.length > 1 && (
                  <>
                    <Card className="p-4 sm:p-6 bg-[#f5f5f5] border-2 border-[#0A2647]/20">
                      <div className="text-center">
                        <h3 className="text-[20px] sm:text-[24px] text-[#0A2647] font-semibold">
                          📊 Total Results: {totalResults}
                        </h3>
                        {allResults.some((r: any) => r.noCopNumber) && (
                          <p className="text-[16px] text-[#d32f2f] mt-2">
                            ⚠️ Some voters found without COP numbers
                          </p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6 sm:p-8 bg-[#fff3e0] border-4 border-[#ff9800]">
                      <div className="text-center space-y-4">
                        <h3 className="text-[20px] sm:text-[24px] text-[#e65100] font-semibold leading-relaxed">
                          इस लड़ाई में, अपना बहुमूल्य वोट देकर श्री अरुण कुमार त्रिपाठी को प्रथम वरीयता (1) पर विजयी बनाने की कृपा करें।
                        </h3>

                        <div className="bg-white p-4 rounded-lg border-2 border-[#ff9800]">
                          <h4 className="text-[18px] font-semibold text-[#0A2647] mb-3">
                            COP नंबर की जांच करें:
                          </h4>
                          <div className="space-y-2 text-[16px]">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-[#388e3c] text-[20px]">✅</span>
                              <span className="text-[#0A2647]">अगर COP नंबर मौजूद है, तो</span>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-[#d32f2f] text-[20px]">❌</span>
                              <span className="text-[#0A2647]">कृपया COP नंबर जांचें।</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </>
                )}

                {/* Display Results with Pagination */}
                {allResults.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage).map((result: any, index: any) => (
                  <Card key={index} className={`p-6 sm:p-8 ${result.noCopNumber ? 'bg-[#ffebee] border-4 border-[#d32f2f]' : 'bg-white border-2 border-[#388e3c]'} hover:shadow-lg transition-shadow`}>
                    <div className="space-y-6">
                      {/* Not Found Header for Missing COP */}
                      {result.noCopNumber && (
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
                                  href="tel:+919721777720"
                                  className="text-[28px] sm:text-[32px] text-[#0A2647] hover:text-[#d32f2f] transition-colors flex items-center gap-3"
                                >
                                  <Phone className="w-8 h-8" />
                                  +91 97217 77720
                                </a>
                                <Button
                                  onClick={callContact}
                                  size="lg"
                                  className="text-[18px] py-6 px-8 bg-[#0A2647] hover:bg-[#144272] text-white"
                                >
                                  <Phone className="w-5 h-5 mr-2" />
                                  {rt.callButton}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Voter Details Section */}
                      <div className={`space-y-4 ${result.noCopNumber ? 'mt-6' : ''}`}>
                        {/* Result Number Header - Only show for valid results */}
                        {!result.noCopNumber && (
                          <div className="flex items-center gap-3 pb-3 border-b-2 border-[#388e3c]/20">
                            <div className="w-10 h-10 rounded-full bg-[#388e3c] flex items-center justify-center">
                              <span className="text-white text-[20px]">✅</span>
                            </div>
                            <h4 className="text-[22px] text-[#388e3c] font-semibold">
                              {allResults.length > 1 ? `Result ${(currentPage - 1) * resultsPerPage + index + 1} of ${allResults.length}` : 'Voter Details'}
                            </h4>
                          </div>
                        )}
                        
                        {/* Voter Information Header for Missing COP */}
                        {result.noCopNumber && (
                          <div className="text-center">
                            <h4 className="text-[24px] text-[#d32f2f] font-semibold mb-4">
                              📋 Voter Information Found:
                            </h4>
                          </div>
                        )}

                      {/* Name */}
                      <div className="space-y-2">
                        <p className="text-[16px] text-[#0A2647]/70 font-medium">Name:</p>
                        <p className="text-[22px] text-[#0A2647] font-semibold">{result.name}</p>
                      </div>

                      {/* Enrollment Number */}
                    <div className="space-y-2">
                        <p className="text-[16px] text-[#0A2647]/70 font-medium">{rt.enrollmentNumber}:</p>
                        <p className="text-[22px] text-[#0A2647]">{result.enrollmentNumber}</p>
                    </div>

                      {/* COP Number */}
                    <div className="space-y-2">
                        <p className="text-[16px] text-[#0A2647]/70 font-medium">{rt.copNumber}:</p>
                        {result.noCopNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[22px] text-[#d32f2f] font-bold">✗</span>
                            <p className="text-[22px] text-[#d32f2f] font-medium">Not Available</p>
                          </div>
                        ) : (
                          <p className="text-[22px] text-[#0A2647]">{result.copNumber}</p>
                        )}
                    </div>

                      {/* Sl No */}
                      {result.slNo && (
                        <div className="space-y-2">
                          <p className="text-[16px] text-[#0A2647]/70 font-medium">Sl No:</p>
                          <p className="text-[22px] text-[#0A2647]">{result.slNo}</p>
                        </div>
                      )}

                      {/* Address */}
                    <div className="space-y-2">
                        <p className="text-[16px] text-[#0A2647]/70 font-medium">{rt.address}:</p>
                        <p className="text-[20px] text-[#0A2647]">{result.address}</p>
                    </div>
                  </div>
                </div>
              </Card>
                ))}

              {/* Pagination Controls - Only show for multiple results */}
              {allResults.length > resultsPerPage && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    size="lg"
                    variant="outline"
                    className="text-[18px] py-6 px-8 border-2 border-[#0A2647]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </Button>
                  <div className="text-[18px] font-semibold text-[#0A2647]">
                    Page {currentPage} of {Math.ceil(allResults.length / resultsPerPage)}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(allResults.length / resultsPerPage)}
                    size="lg"
                    variant="outline"
                    className="text-[18px] py-6 px-8 border-2 border-[#0A2647]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </Button>
                </div>
              )}
              </div>
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

            <PhoneInput
              value={tempPhone}
              onChange={setTempPhone}
              onValidationChange={(isValid) => setIsPhoneValid(isValid)}
              placeholder={pt.phonePlaceholder}
              autoFocus
              onEnter={() => isPhoneValid && executeSearch()}
            />

            <div className="space-y-3">
              <Button
                onClick={executeSearch}
                disabled={!tempPhone.trim() || !isPhoneValid}
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
