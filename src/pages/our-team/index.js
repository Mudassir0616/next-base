import BoardMembers from "@/components/BoardMembers/Index";
import Seo from "@/components/common/Seo";
import {
    assertCmsData,
    fetchApi,
    fetchPageSeo,
    listResults,
    REVALIDATE_SECONDS,
} from "@/utils/functionUtils";
import { breadcrumbSchema } from "@/utils/seo";

const Index = ({ seo, members }) => {
    return (
        <>
            <Seo
                title="Our Team"
                description={seo?.description}
                image={seo?.image}
                path="/our-team"
                jsonLd={[
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Our Team", path: "/our-team" },
                    ]),
                ]}
            />

            <BoardMembers hero={seo} members={members} />
        </>
    );
};

export async function getStaticProps() {
    const [{ seoHead, seo }, leaders] = await Promise.all([
        fetchPageSeo("/our-team", {
            description: "about_us_leadership_description",
        }),
        fetchApi("/api/leadership/?order_by=order_by&page_size=100"),
    ]);

    assertCmsData(leaders);

    return {
        props: {
            seoHead,
            seo,
            members: listResults(leaders),
        },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
