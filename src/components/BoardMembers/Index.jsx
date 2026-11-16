import { Close, East } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import PageBanner from "../common/PageBanner";
import CmsImage from "../common/CmsImage";
import { useLenisContext } from "@/hooks/useLenis";
import useDialogFocus from "@/hooks/useDialogFocus";
import { highlight, mediaUrl } from "@/utils/functionUtils";

// `members` and `hero` come from the page's getStaticProps, so the team is in
// the prerendered HTML.
const BoardMembers = ({ hero, members = [] }) => {
  const lenisRef = useLenisContext();
  const dialogRef = useRef(null);

  const [activeTab, setActiveTab] = useState("executive");
  const [selectedMember, setSelectedMember] = useState(null);

  useDialogFocus(dialogRef, Boolean(selectedMember));

  const tabs = [
    { key: "executive", label: "Executive Leadership Team", disabled: false },
    // { key: "expert", label: "Our Experts", disabled: true },
  ];

  const sections = {
    executive: {
      title: "Leading Grovanta. Building lasting client [partnerships]",
      description:
        "Our Executive Leadership Team sets the strategic direction for Grovanta and works closely with clients. Our wider team of functional and domain experts ensure we remain focused on delivering practical, high-quality and outcome-driven solutions.",
    },

    expert: {
      title: "Deep expertise. [Practical] experience.",
      description:
        "Our Subject Matter Experts (SMEs) bring deep functional knowledge and hands-on experience across Grovanta\u2019s diverse capabilities. Working alongside our Executive Leadership Team and delivery teams, they bring the right combination of functional, industry and technology expertise to address each client\u2019s unique requirements.",
    },
  };

  const activeMembers = members.filter(
    (member) => member.category === activeTab,
  );

  const activeSection = sections[activeTab];

  // Lock the page behind the profile modal
  useEffect(() => {
    if (!selectedMember) return;

    const lenis = lenisRef?.current;

    lenis?.stop();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedMember(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMember, lenisRef]);

  return (
    <div className="board-members-page">
      <PageBanner
        title="Experience That Brings Strategy to Life"
        description={hero?.description}
        image="/images/about-bg.webp"
        position="90% 45%"
      />

      <section className="container leadership-section">
        <div className="leadership-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              aria-pressed={activeTab === tab.key}
              onClick={() => {
                if (!tab.disabled) setActiveTab(tab.key);
              }}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="heading-center">
          <h2
            dangerouslySetInnerHTML={{
              __html: highlight(activeSection?.title),
            }}
          ></h2>
          <p>{activeSection.description}</p>
        </div>

        <div className="members">
          {activeMembers.map((member) => (
            <div className="member-card" key={member.id}>
              <div className="img-container">
                <CmsImage
                  src={mediaUrl(member.image, "/images/leader1.webp")}
                  alt={member.name}
                  width={600}
                  height={572}
                  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              <div className="member-info">
                <div className="details">
                  <h3>{member.name}</h3>
                  <p>{member.designation}</p>
                </div>

                {member?.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <img src="/icons/in.svg" alt="" />
                  </a>
                )}
              </div>

              {member.description && (
                <button
                  className="know-more"
                  onClick={() => setSelectedMember(member)}
                  aria-haspopup="dialog"
                >
                  Know more <East />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedMember && (
        <div
          className="member-modal"
          onClick={() => setSelectedMember(null)}
          role="presentation"
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-dialog-name"
            // Lenis preventDefaults every wheel/touch event while it is
            // stopped, so the modal has to opt its own scrolling back in
            data-lenis-prevent
          >
            <div className="modal-header">
              {/* inside the sticky header so it stays reachable while scrolling */}
              <button
                className="close-btn"
                onClick={() => setSelectedMember(null)}
                aria-label="Close"
              >
                <Close />
              </button>

              <div className="img-container">
                <CmsImage
                  src={mediaUrl(selectedMember.image, "/images/leader1.webp")}
                  alt=""
                  width={400}
                  height={400}
                  sizes="200px"
                />
              </div>

              <div className="details">
                <h3 id="member-dialog-name">{selectedMember.name}</h3>
                <p className="designation">{selectedMember.designation}</p>

                {selectedMember?.linkedin && (
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${selectedMember.name} on LinkedIn`}
                  >
                    <img src="/icons/in.svg" alt="" />
                  </a>
                )}

                <span className="divider" />
              </div>
            </div>

            <div
              className="modal-body"
              dangerouslySetInnerHTML={{
                __html: selectedMember.description || "",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardMembers;
