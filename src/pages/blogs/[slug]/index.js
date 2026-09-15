import BlogDetails from '@/components/Blogs/BlogDetails';
import Seo from '@/components/common/Seo';
import { fetchApi } from '@/utils/functionUtils'
import { articleSchema, breadcrumbSchema } from '@/utils/seo'
import React from 'react'

const Index = ({ data, error }) => {
    const path = `/blogs/${data?.slug}`;
    const description = data?.sub_title || data?.featured_text || data?.text;

    return (
        <>
            <Seo
                title={data?.title}
                description={description}
                image={data?.thumbnail}
                path={path}
                type="article"
                publishedTime={data?.created_at}
                modifiedTime={data?.updated_at}
                cmsHead={data?.head}
                jsonLd={[
                    articleSchema({
                        title: data?.title,
                        description,
                        image: data?.thumbnail,
                        path,
                        published: data?.created_at,
                        modified: data?.updated_at,
                        section: data?.category?.category,
                    }),
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Blogs", path: "/blogs" },
                        { name: data?.title, path },
                    ]),
                ]}
            />

            <BlogDetails blog_data={data} />
        </>
    );
};

export async function getStaticPaths() {
    const res = await fetchApi("/api/blog/");

    return {
        paths: (res?.results || [])
            .filter((blog) => blog?.slug)
            .map((blog) => ({ params: { slug: blog.slug } })),
        fallback: "blocking", // serve generated pages on-demand
    };
}

// For each slug, load any needed data
export async function getStaticProps({ params, locale }) {
    const res = await fetchApi(
        `/api/blog/?slug=${params.slug}&depth=3&nested=True`,
    );

    const data = res?.results?.[0] || null;

    if (!data) {
        return { notFound: true, revalidate: 1 };
    }

    return {
        props: {
            data,
            error: null,
        },
        revalidate: 1,
    };
}

export default Index;
