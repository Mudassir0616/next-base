import JobDetails from "@/components/Careers/JobDetails";
import Seo from "@/components/common/Seo";
import { fetchApi } from "@/utils/functionUtils";
import { mapCareer } from "@/utils/mappers";
import { breadcrumbSchema, jobPostingSchema } from "@/utils/seo";
import React from "react";

const Index = ({ job, relatedJobs }) => {
    const path = `/careers/${job?.slug}`;
    // every opening carries the same short_description, so lead with the role
    const description = job?.about || job?.description;

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
                publishedTime={job?.posted}
                // a closed opening still renders, it just should not be indexed
                noindex={!job?.is_active}
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
    const res = await fetchApi(`/api/career/?slug=${params.slug}`);
    const job = mapCareer(res?.results?.[0]);

    if (!job) {
        return { notFound: true, revalidate: 1 };
    }

    // Related openings: everything else that is still open
    const related_res = await fetchApi(
        `/api/career/?is_active=true&order_by=order_by`,
    );

    const relatedJobs = (related_res?.results || [])
        .map((record) => mapCareer(record))
        .filter((record) => record.slug !== job.slug)
        .slice(0, 2);

    return {
        props: { job, relatedJobs },
        revalidate: 1,
    };
}

export default Index;
