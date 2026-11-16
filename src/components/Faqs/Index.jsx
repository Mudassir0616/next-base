import React, { useState } from "react";
import PageBanner from "../common/PageBanner";
import FAQItem from "../common/FaqItem";
import ContactFrame from "../common/ContactFrame";
import { mediaUrl } from "@/utils/functionUtils";

const ALL_CATEGORIES = "All";

// `categories`, `faqs` and `hero` come from the page's getStaticProps, so the
// questions are in the prerendered HTML.
const Faqs = ({ hero, categories = [], faqs = [] }) => {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  // keyed by `${category}-${index}` so one open item per category at a time
  const [openItem, setOpenItem] = useState(null);

  // the CMS keeps questions and categories apart; group them for display
  const faqCategories = categories.map((category) => ({
    ...category,
    faqs: faqs.filter((faq) => faq.category === category.id),
  }));

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
        title={hero?.title || "Frequently Asked Questions"}
        description={hero?.description}
        image={mediaUrl(hero?.image, "/images/faq-bg.webp")}
        position="center 45%"
      />

      <section className="container faq-listing">
        <div className="faq-filters">
          {faqFilters.map((filter) => (
            <button
              key={filter}
              className={`chip ${activeCategory === filter ? "active" : ""}`}
              aria-pressed={activeCategory === filter}
              onClick={() => setActiveCategory(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {visibleCategories.map((category) => (
          <div className="faq-category" key={category.id || category.name}>
            <div className="category-header">
              <h2>{category.name}</h2>
              <span className="count">{category.faqs.length} Questions</span>
            </div>

            <div className="faqs">
              {category.faqs.map((faq, index) => {
                const key = `${category.name}-${index}`;

                return (
                  <FAQItem
                    key={faq.id || key}
                    id={`faq-${faq.id || key}`}
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
