import MessagePanel from "@/components/common/MessagePanel";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";
import React from "react";

const NotFound = () => {
    return (
        <>
            <Seo title="Page Not Found" path="/404" noindex />

            <MessagePanel
                visual={
                    <p className="error-code">
                        4<span>0</span>4
                    </p>
                }
                title="We couldn't find that page"
                description="The page you're looking for may have moved or no longer exists. Let us guide you back to familiar territory."
                buttonText="Back to Homepage"
                buttonLink="/"
            />
        </>
    );
};

export const getStaticProps = seoStaticProps("/404");

export default NotFound;
