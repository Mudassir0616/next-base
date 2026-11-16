import JobDetails from "@/components/Careers/JobDetails";
import Seo from "@/components/common/Seo";
import { assertCmsData, fetchApi, fetchPageSeo, REVALIDATE_SECONDS } from "@/utils/functionUtils";
import { breadcrumbSchema, jobPostingSchema } from "@/utils/seo";
import React from "react";

const Index = ({ job, relatedJobs }) => {
    const path = `/careers/${job?.slug}`;
    // every opening carries the same short_description, so lead with the role
    const description = job?.about_role || job?.short_description;

    return (
        <>
            <Seo
                title={
                    job?.location
                        ? `${job?.title} — ${job?.location}`
                        : job?.title
                }
                description={description}
                image={job?.image}
                path={path}
                type="article"
                publishedTime={job?.created_at}
                // a closed opening still renders, it just should not be indexed
                noindex={job?.is_active === false}
                jsonLd={[
                    jobPostingSchema(job, path),
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Careers", path: "/careers" },
                        { name: job?.title, path },
                    ]),
                ]}
            />

            <JobDetails job={job} relatedJobs={relatedJobs} />
        </>
    );
};

export async function getStaticPaths() {
    const res = await fetchApi(`/api/career/?is_active=true&order_by=order_by`);

    return {
        paths: (res?.results || [])
            .filter((job) => job.slug)
            .map((job) => ({ params: { slug: job.slug } })),
        fallback: "blocking",
    };
}

export async function getStaticProps({ params }) {
    const res = await fetchApi(
        `/api/career/?slug=${encodeURIComponent(params.slug)}`,
    );
    // a failed request is not "this job doesn't exist" — don't cache a 404 for it
    assertCmsData(res);

    const job = res?.results?.[0];

    if (!job) {
        return { notFound: true, revalidate: REVALIDATE_SECONDS };
    }

    // Related openings: everything else that is still open
    const [related_res, { seoHead }] = await Promise.all([
        fetchApi(`/api/career/?is_active=true&order_by=order_by`),
        fetchPageSeo(`/careers/${job.slug}`),
    ]);

    const relatedJobs = (related_res?.results || [])
        .filter((record) => record.slug !== job.slug)
        .slice(0, 2);

    return {
        props: { job, relatedJobs, seoHead },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
