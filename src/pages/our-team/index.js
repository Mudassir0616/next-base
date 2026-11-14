import BoardMembers from "@/components/BoardMembers/Index";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";

const Index = ({ seo }) => {
    return (
        <>
            <Seo
                title="Our Team"
                description={seo?.description}
                image={seo?.image}
                path="/our-team"
            />

            <BoardMembers />
        </>
    );
};

export const getStaticProps = seoStaticProps("/our-team", {
    description: "about_us_leadership_description",
});

export default Index;
