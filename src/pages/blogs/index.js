import Blogs, { blogListQuery, toBlogPage } from "@/components/Blogs/Blogs";
import Seo from "@/components/common/Seo";
import {
    assertCmsData,
    fetchApi,
    fetchPageSeo,
    listResults,
    REVALIDATE_SECONDS,
} from "@/utils/functionUtils";
import { breadcrumbSchema } from "@/utils/seo";

const Index = ({ seo, initialPage, categories }) => {
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

            <Blogs hero={seo} initialPage={initialPage} categories={categories} />
        </>
    );
};

export async function getStaticProps() {
    const [{ seoHead, seo }, blogs, categories] = await Promise.all([
        fetchPageSeo("/blogs", {
            title: "our_blog_hero_title",
            description: "our_blog_hero_description",
            image: "our_blog_hero_image",
        }),
        // the default view; filtered views are fetched in the browser
        fetchApi(`/api/blog/${blogListQuery()}`),
        fetchApi("/api/blog-category/?page_size=100"),
    ]);

    assertCmsData(blogs, categories);

    return {
        props: {
            seoHead,
            seo,
            initialPage: toBlogPage(blogs),
            categories: listResults(categories).map((category) => ({
                id: category.id ?? null,
                category: category.category ?? "",
            })),
        },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
