import React, { useEffect, useState } from "react";
import PageBanner from "../common/PageBanner";
import FAQItem from "../common/FaqItem";
import ContactFrame from "../common/ContactFrame";
import { FaqApi, FaqCategoryApi } from "@/api/api";
import { useSiteSetting } from "@/context/useSiteSettings";
import { mediaUrl } from "@/utils/functionUtils";

const ALL_CATEGORIES = "All";

const Faqs = () => {
  const { settings } = useSiteSetting();

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  // keyed by `${category}-${index}` so one open item per category at a time
  const [openItem, setOpenItem] = useState(null);
  const [faqCategories, setFaqCategories] = useState([]);

  // The CMS keeps questions and categories apart, the page groups them.
  const fetch_faqs = async () => {
    try {
      const [category_res, faq_res] = await Promise.all([
        FaqCategoryApi.get(`?order_by=order_by`),
        FaqApi.get(`?order_by=order_by&page_size=200`),
      ]);

      const faqs = faq_res?.results || [];

      setFaqCategories(
        (category_res?.results || []).map((category) => ({
          name: category.name,
          faqs: faqs.filter((faq) => faq.category === category.id),
        })),
      );
    } catch (error) {
      console.error("Failed to fetch faqs:", error);
    }
  };

  useEffect(() => {
    fetch_faqs();
  }, []);

  const faqFilters = [
    ALL_CATEGORIES,
    ...faqCategories.map((category) => category.name),
  ];

  const visibleCategories =
    activeCategory === ALL_CATEGORIES
      ? faqCategories
      : faqCategories.filter((category) => category.name === activeCategory);

  const toggleItem = (key) =>
    setOpenItem((prev) => (prev === key ? null : key));

  return (
    <div className="faqs-page">
      <PageBanner
        title={settings?.our_faq_hero_title}
        description={settings?.our_faq_hero_description}
        image={mediaUrl(settings?.our_faq_hero_image, "/images/faq-bg.webp")}
        position="center 45%"
      />

      <section className="container faq-listing">
        <div className="faq-filters">
          {faqFilters.map((filter) => (
            <button
              key={filter}
              className={`chip ${activeCategory === filter ? "active" : ""}`}
              onClick={() => setActiveCategory(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {visibleCategories.map((category) => (
          <div className="faq-category" key={category.name}>
            <div className="category-header">
              <h2>{category.name}</h2>
              <span className="count">{category.faqs.length} Questions</span>
            </div>

            <div className="faqs">
              {category.faqs.map((faq, index) => {
                const key = `${category.name}-${index}`;

                return (
                  <FAQItem
                    key={key}
                    faq={faq}
                    isOpen={openItem === key}
                    toggle={() => toggleItem(key)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <ContactFrame
        title="Your next growth opportunity starts here."
        description="From talent acquisition and business transformation to managed services and strategic advisory, we're here to help you achieve measurable outcomes."
        buttonText="Let's Discuss Your Goals"
        buttonLink="/contact"
      />
    </div>
  );
};

export default Faqs;
