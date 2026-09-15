import React from "react";
import { motion } from "framer-motion";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const FAQItem = ({ faq, isOpen, toggle }) => {
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={toggle}>
        <div className="question">{faq.question}</div>
        <span>
          {isOpen ? (
            <KeyboardArrowUpIcon sx={{ fontSize: "30px", color: "#3C7777" }} />
          ) : (
            <KeyboardArrowDownIcon
              sx={{ fontSize: "30px", color: "#3C7777" }}
            />
          )}
        </span>
      </div>
      <motion.div
        className="faq-answer"
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        onClick={toggle}
      >
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        ></div>
      </motion.div>
    </div>
  );
};

export default FAQItem;
