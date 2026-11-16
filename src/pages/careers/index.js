import Careers from "@/components/Careers/Index";
import Seo from "@/components/common/Seo";
import {
    assertCmsData,
    fetchApi,
    fetchPageSeo,
    listResults,
    REVALIDATE_SECONDS,
} from "@/utils/functionUtils";
import { breadcrumbSchema } from "@/utils/seo";

const Index = ({ seo, jobs, jobCategories }) => {
    return (
        <>
            <Seo
                title="Careers"
                description={seo?.description}
                image={seo?.image}
                path="/careers"
                jsonLd={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Careers", path: "/careers" },
                    ]),
                ]}
            />

            <Careers hero={seo} jobs={jobs} jobCategories={jobCategories} />
        </>
    );
};

export async function getStaticProps() {
    const [{ seoHead, seo }, jobs, categories] = await Promise.all([
        fetchPageSeo("/careers", {
            title: "career_hero_title",
            description: "career_hero_description",
            image: "career_hero_image",
        }),
        fetchApi("/api/career/?is_active=true&order_by=order_by&page_size=100"),
        fetchApi("/api/career-category/?order_by=order_by&page_size=100"),
    ]);

    assertCmsData(jobs, categories);

    return {
        props: {
            seoHead,
            seo,
            jobs: listResults(jobs),
            jobCategories: listResults(categories),
        },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
