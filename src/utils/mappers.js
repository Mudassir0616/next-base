import { mediaUrl } from "./functionUtils";


// Career -> /careers and /careers/[slug]
export const mapCareer = (record) => {
    if (!record) return null;

    return {
        id: record.id,
        slug: record.slug,
        title: record.title,
        image: mediaUrl(record.image, ""),
        is_active: record.is_active !== false,
        category: record.api_category?.name || "",
        location: record.location,
        type: record.job_type,
        description: record.short_description,
        posted: record.created_at,
        about: record.about_role,
        responsibilities: record.api_responsibility || [],
        required_skills: record.api_required_skill || [],
        nice_to_haves: record.api_nice_to_have || [],
    };
};
