import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { East } from "@mui/icons-material";
import { useSiteSetting } from "@/context/useSiteSettings";
import { highlight } from "@/utils/functionUtils";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const { settings } = useSiteSetting();

  // The step ribbon is static in the design; only the copy beside it is CMS driven.
  const steps = [
    {
      title: "ADVISE",
      description:
        "Define the right strategic direction by understanding business priorities, evaluating opportunities and identifying the path forward.",
      icon: "/icons/advise.svg",
    },
    {
      title: "DESIGN",
      description:
        "Translate strategy into practical solutions by designing the right operating models, processes, systems and capabilities.",
      icon: "/icons/design.svg",
    },
    {
      title: "IMPLEMENT",
      description:
        "Turn plans into action by bringing together the right expertise, resources and governance to deliver the solution.",
      icon: "/icons/implement.svg",
    },
    {
      title: "OPERATE",
      description:
        "Run critical business functions through efficient, scalable and well-governed shared services and managed solutions.",
      icon: "/icons/operations.svg",
    },
    {
      title: "IMPROVE",
      description:
        "Continuously enhance business performance through insights, process improvement, technology and operational excellence.",
      icon: "/icons/improvments.svg",
    },
  ];

  const process_ref = React.useRef([]);
  const line_ref = React.useRef([]);
  const container_ref = React.useRef(null);

  useEffect(() => {
    if (!steps?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        process_ref.current,
        {
          opacity: 0,
          y: 100,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container_ref.current,
            start: "top 70%",
            end: "bottom top",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        line_ref.current,
        {
          height: 0,
        },
        {
          height: "100%",
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container_ref.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, container_ref);

    return () => ctx.revert();
  }, [steps]);

  return (
    <section className="container" ref={container_ref}>
      <div className="flex-container process-container">
        <div className="content-side">
          <h2
            dangerouslySetInnerHTML={{
              __html: highlight(settings?.home_process_title),
            }}
          />

          <div
            dangerouslySetInnerHTML={{
              __html: settings?.home_process_description || "",
            }}
          />
        </div>

        <div className="process">
          {steps?.map((step_item, index) => (
            <div
              className="timeline_step"
              key={index}
              ref={(el) => (process_ref.current[index] = el)}
            >
              <div className="icon">
                <img src={step_item?.icon} alt="" />
              </div>

              <div className="step_content_wrapper">
                <h3 className="step_title_text">{step_item?.title}</h3>
                <p
                  className="step_description_text"
                  dangerouslySetInnerHTML={{ __html: step_item?.description }}
                ></p>
              </div>

              {index < steps?.length - 1 && (
                <div
                  className="vertical_line"
                  ref={(el) => (line_ref.current[index] = el)}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
