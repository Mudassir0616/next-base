import Blogs from "@/components/Blogs/Blogs";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";
import { breadcrumbSchema } from "@/utils/seo";

const Index = ({ seo }) => {
    return (
        <>
            <Seo
                title="Insights & Articles"
                description={seo?.description}
                image={seo?.image}
                path="/blogs"
                jsonLd={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Blogs", path: "/blogs" },
                    ]),
                ]}
            />

            <Blogs />
        </>
    );
};

export const getStaticProps = seoStaticProps("/blogs", {
    description: "our_blog_hero_description",
    image: "our_blog_hero_image",
});

export default Index;
