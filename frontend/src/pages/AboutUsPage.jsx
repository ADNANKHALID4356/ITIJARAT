import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AboutUsPage = () => {
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);

  // SEO: Set document title and meta description
  useEffect(() => {
    document.title = "About Us - International Tijarat | Our Story & Mission";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn about International Tijarat - a premium international marketplace representing Pakistani craftsmanship and quality products for everyday life.';
      document.head.appendChild(meta);
    }
  }, []);

  const ValueCard = ({ icon, title, description }) => (
    <div className="bg-white rounded-2xl p-8 border border-[#E8DED8] hover:border-[#5B1830]/30 transition-all duration-300 shadow-2xs hover:shadow-md">
      <div className="w-14 h-14 bg-[#F4E9ED] border border-[#5B1830]/20 rounded-xl flex items-center justify-center mb-6 text-[#5B1830]">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-[#241A1D] mb-3">{title}</h3>
      <p className="text-[#746B6C] leading-relaxed text-sm">{description}</p>
    </div>
  );

  const TimelineItem = ({ year, title, description, isActive, onClick }) => (
    <div 
      className={`flex items-start cursor-pointer transition-all duration-300 p-4 rounded-xl ${
        isActive ? 'bg-[#F4E9ED] border border-[#5B1830]/30' : 'hover:bg-[#FCFAF8]'
      }`}
      onClick={onClick}
    >
      <div className={`w-3.5 h-3.5 rounded-full mt-2 mr-4 flex-shrink-0 transition-all duration-300 ${
        isActive ? 'bg-[#5B1830] ring-4 ring-[#5B1830]/20' : 'bg-[#D8C9C0]'
      }`} />
      <div className="flex-1">
        <div className={`text-base font-bold mb-1 transition-colors ${
          isActive ? 'text-[#5B1830]' : 'text-[#746B6C]'
        }`}>
          {year}
        </div>
        <h3 className="text-lg font-semibold text-[#241A1D] mb-1 font-display">{title}</h3>
        <p className="text-[#746B6C] leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );

  const timelineData = [
    {
      year: "2019",
      title: "Foundation & Vision",
      description: "International Tijarat was founded with a clear ambition: to connect global customers with authentic craftsmanship, everyday essentials, and premium lifestyle goods."
    },
    {
      year: "2020",
      title: "Global Reach",
      description: "Expanded our cross-border shipping network, establishing trusted artisan and manufacturer partnerships to verify authenticity and strict quality standards."
    },
    {
      year: "2021",
      title: "Technology & Curation",
      description: "Deployed our smart catalog recommendation engine and secure end-to-end purchasing pipelines, delivering 99.9% fulfillment accuracy."
    },
    {
      year: "2022",
      title: "Heritage Handcraft Initiative",
      description: "Launched our signature Pakistani Heritage collection, spotlighting regional stone craft, artisanal textiles, and cultural brass decor with fair artisan trade."
    },
    {
      year: "2023",
      title: "Trusted Marketplace",
      description: "Reached over 100,000 customers globally, earned trusted exporter accolades, and established dedicated trade channels across the Americas, Europe, and GCC."
    },
    {
      year: "2024",
      title: "Modern Marketplace Experience",
      description: "Continuing our evolution with refined digital shopping journeys, augmented product previews, and streamlined wholesale dealer integrations."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F3] font-body text-[#241A1D]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F4E9ED] border border-[#5B1830]/20 rounded-2xl shadow-xs mb-4">
            <svg className="w-10 h-10 text-[#5B1830]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-[#241A1D] tracking-tight">
            About <span className="text-[#5B1830]">International Tijarat</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[#746B6C] max-w-3xl mx-auto leading-relaxed">
            A premium international marketplace connecting authentic Pakistani craftsmanship and trusted everyday products with customers worldwide.
          </p>

          <div className="max-w-2xl mx-auto">
            <p className="text-[#746B6C] text-sm sm:text-base leading-relaxed">
              We stand at the intersection of prestige, cultural identity, and reliable everyday trade. Every collection is curated to honor authenticity, craftsmanship, and seamless service.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 sm:mb-20">
          <div className="bg-white rounded-2xl border border-[#E8DED8] p-8 shadow-2xs">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 bg-[#F4E9ED] border border-[#5B1830]/20 rounded-xl flex items-center justify-center mr-4 text-[#5B1830]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-display text-[#241A1D]">Our Mission</h2>
            </div>
            <p className="text-sm sm:text-base text-[#746B6C] leading-relaxed mb-6">
              To democratize access to exceptional craftsmanship and reliable everyday essentials through a secure, transparent, and culturally rich shopping experience.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Authentic Heritage", "Quality Standards", "Buyer Protection", "Global Logistics"].map((tag) => (
                <span key={tag} className="px-3.5 py-1.5 bg-[#FCFAF8] text-[#5B1830] border border-[#E8DED8] rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DED8] p-8 shadow-2xs">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 bg-[#FAF7F3] border border-[#B97855]/30 rounded-xl flex items-center justify-center mr-4 text-[#B97855]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-display text-[#241A1D]">Our Vision</h2>
            </div>
            <p className="text-sm sm:text-base text-[#746B6C] leading-relaxed mb-6">
              To be the most trusted cross-border e-commerce brand celebrating regional artistry, driving fair commercial opportunity, and setting a benchmark for service.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Artisan Empowerment", "Global Recognition", "Seamless Trade", "Long-term Trust"].map((tag) => (
                <span key={tag} className="px-3.5 py-1.5 bg-[#FCFAF8] text-[#75462F] border border-[#E8DED8] rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#241A1D] mb-3">Our Core Values</h2>
            <p className="text-sm sm:text-base text-[#746B6C] max-w-2xl mx-auto">
              Principles guiding our curations, customer relationships, and platform integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>}
              title="Verified Quality"
              description="Rigorous curation ensuring each piece matches verified authenticity, material integrity, and precision craftsmanship."
            />

            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>}
              title="Global Accessibility"
              description="Eliminating cross-border friction to provide reliable delivery and international payment safety worldwide."
            />

            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>}
              title="Continuous Innovation"
              description="Modernizing catalog discovery, search accuracy, and merchant logistics to elevate online shopping convenience."
            />

            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>}
              title="Customer Centricity"
              description="Every policy, warranty, and communication is designed around clarity, responsive support, and complete buyer peace of mind."
            />

            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>}
              title="Integrity & Transparency"
              description="Transparent pricing, authentic photography, clear product origins, and honest delivery timelines."
            />

            <ValueCard
              icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>}
              title="Cultural Stewardship"
              description="Honoring traditional artisan techniques by providing creators direct commercial visibility and fair sustainable returns."
            />
          </div>
        </div>

        {/* Company Timeline */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#241A1D] mb-3">Our Journey</h2>
            <p className="text-sm sm:text-base text-[#746B6C] max-w-2xl mx-auto">
              Key milestones shaping International Tijarat into a globally connected marketplace.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DED8] p-6 sm:p-8 shadow-2xs">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E8DED8]"></div>
              <div className="space-y-3">
                {timelineData.map((item, index) => (
                  <TimelineItem
                    key={index}
                    year={item.year}
                    title={item.title}
                    description={item.description}
                    isActive={activeTimelineItem === index}
                    onClick={() => setActiveTimelineItem(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-[#350A1B] text-white rounded-2xl p-8 sm:p-12 border border-[#B97855]/30 shadow-md">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4">Join Our Journey</h2>
            <p className="text-sm sm:text-base text-[#FAF7F3] mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience authentic Pakistani heritage craft alongside high-quality everyday essentials. Browse our curated collection or connect with our merchant team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop"
                className="px-8 py-3.5 bg-[#B97855] text-white font-medium rounded-xl hover:bg-[#75462F] transition-all duration-200 shadow-sm inline-flex items-center justify-center"
              >
                Explore Marketplace
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-3.5 border border-[#E8DED8]/40 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
