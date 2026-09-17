# Component Inventory: DoctorCheck.vn

| Component Name | File Target | Purpose | Key Props / State |
|---|---|---|---|
| `TopBar` | `src/components/sites/doctorcheck-vn/root/TopBar.tsx` | Top utility announcement bar with phone & hours | `hotline`, `hours` |
| `Header` | `src/components/sites/doctorcheck-vn/root/Header.tsx` | Sticky navbar with logo, dropdown menus, search, booking CTA | `isScrolled`, `mobileMenuOpen` |
| `HeroSection` | `src/components/sites/doctorcheck-vn/root/HeroSection.tsx` | Above-the-fold hero with H1, badge, banner image, and CTA buttons | `title`, `ctaText` |
| `PainPointsSection` | `src/components/sites/doctorcheck-vn/root/PainPointsSection.tsx` | 4 Patient anxiety cards ("Gỡ bỏ 4 nỗi lo") | `concerns: ConcernItem[]` |
| `VideoTestimonialsSection` | `src/components/sites/doctorcheck-vn/root/VideoTestimonialsSection.tsx` | Real patient video carousel with modal playback | `videos: VideoItem[]`, `activeVideoId` |
| `BenefitsSection` | `src/components/sites/doctorcheck-vn/root/BenefitsSection.tsx` | 5 Golden rights (evidence-based, 60-90 min, specialists) | `benefits: BenefitItem[]` |
| `DoctorsSection` | `src/components/sites/doctorcheck-vn/root/DoctorsSection.tsx` | Doctor profiles carousel/grid with credentials from BV ĐHYD & Chợ Rẫy | `doctors: Doctor[]`, `selectedDoctor` |
| `EquipmentSection` | `src/components/sites/doctorcheck-vn/root/EquipmentSection.tsx` | Facilities & international-standard equipment showcase | `equipment: EquipmentItem[]` |
| `PricingSection` | `src/components/sites/doctorcheck-vn/root/PricingSection.tsx` | Gender switcher tabs (Nam/Nữ) + 3 packages with detailed checklist | `activeGender: 'male' \| 'female'`, `packages` |
| `CancerScreeningSection` | `src/components/sites/doctorcheck-vn/root/CancerScreeningSection.tsx` | Educational guide for early gastrointestinal screening | None |
| `CustomerStoriesSection` | `src/components/sites/doctorcheck-vn/root/CustomerStoriesSection.tsx` | Narrative case studies & social proof | `stories: StoryItem[]` |
| `FaqSection` | `src/components/sites/doctorcheck-vn/root/FaqSection.tsx` | Expandable FAQ accordion with rich schema parity | `openIndex: number \| null`, `faqs: FAQItem[]` |
| `BookingSection` | `src/components/sites/doctorcheck-vn/root/BookingSection.tsx` | Patient consultation and appointment booking form | `formState`, `status: 'idle' \| 'submitting' \| 'success'` |
| `Footer` | `src/components/sites/doctorcheck-vn/root/Footer.tsx` | Comprehensive clinic footer with operating license, address, links | None |
| `FloatingWidgets` | `src/components/sites/doctorcheck-vn/root/FloatingWidgets.tsx` | Floating Zalo, call button, and back-to-top | `showBackToTop: boolean` |
| `VideoModal` | `src/components/sites/doctorcheck-vn/root/VideoModal.tsx` | Reusable modal for YouTube patient testimonials | `isOpen`, `videoId`, `onClose` |
| `DoctorModal` | `src/components/sites/doctorcheck-vn/root/DoctorModal.tsx` | Detailed doctor bio and qualifications modal | `isOpen`, `doctor: Doctor \| null`, `onClose` |
