import MessagePanel from "@/components/common/MessagePanel";
import React from "react";

const NotFound = () => {
    return (
        <MessagePanel
            visual={
                <p className="error-code">
                    4<span>0</span>4
                </p>
            }
            title="We couldn't find that page"
            description="Grovanta helps organizations navigate complex growth landscapes, but this specific path seems to be off our roadmap. Let us guide you back to familiar territory."
            buttonText="Back to Homepage"
            buttonLink="/"
        />
    );
};

export default NotFound;
