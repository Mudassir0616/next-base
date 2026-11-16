import React from "react";
import { motion } from "framer-motion";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**
 * One collapsible question. The question is a real <button> (keyboard and
 * screen-reader operable) that controls the answer region; a collapsed answer
 * is `inert`, so links inside it can't be tabbed to while it's hidden.
 */
const FAQItem = ({ faq, isOpen, toggle, id }) => {
  const answerId = `${id}-answer`;
  const iconSx = { fontSize: "30px", color: "#3C7777" };

  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-question"
        id={id}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <span className="question">{faq.question}</span>
        <span aria-hidden="true">
          {isOpen ? (
            <KeyboardArrowUpIcon sx={iconSx} />
          ) : (
            <KeyboardArrowDownIcon sx={iconSx} />
          )}
        </span>
      </button>
      <motion.div
        className="faq-answer"
        id={answerId}
        role="region"
        aria-labelledby={id}
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="description"
          inert={!isOpen}
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        ></div>
      </motion.div>
    </div>
  );
};

export default FAQItem;
