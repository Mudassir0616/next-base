import MessagePanel from "@/components/common/MessagePanel";
import React from "react";

const ThankYou = () => {
    return (
        <MessagePanel
            visual={
                <div className="illustration">
                    <img src="/images/thank-you.svg" alt="" />
                </div>
            }
            title="Thank You!"
            description="Your message has been sent successfully. Our team will review your inquiry and get back to you within 24 hours."
            buttonText="Return to Homepage"
            buttonLink="/"
        />
    );
};

export default ThankYou;
