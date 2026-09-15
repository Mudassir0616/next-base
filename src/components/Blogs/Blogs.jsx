import {
  Checkbox,
  FormControlLabel,
  styled,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Tune } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import { BlogCategoryApi, BlogListApi } from "@/api/api";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import PageBanner from "../common/PageBanner";
import BlogCard from "./BlogCard";
import { useLenisContext } from "@/hooks/useLenis";
import { useSiteSetting } from "@/context/useSiteSettings";
import { mediaUrl } from "@/utils/functionUtils";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { label: "Newest first", value: "-created_at" },
  { label: "Oldest first", value: "created_at" },
];

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  "&.Mui-checked": {
    color: "#172846 !important",
  },
}));

// Custom styled pagination
const CustomPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    color: "#333",
    fontSize: "14px",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  "& .MuiPaginationItem-page.Mui-selected": {
    backgroundColor: "#172846",
    color: "white",
    "&:hover": {
      backgroundColor: "#172846",
    },
  },
  "& .MuiPaginationItem-previousNext": {
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.25rem",
  },
  display: "flex",
  justifyContent: "center",
}));

const Blogs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lenisRef = useLenisContext();
  const { settings } = useSiteSetting();

  // mobile only: filters are staged in the sheet and committed on "Apply Filter"
  const [filterOpen, setFilterOpen] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [loading, setloading] = useState(false);
  const [selected_categories, setSelectedCategories] = useState([]);
  const [search_term, setSearchTerm] = useState("");
  const [sort_by, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalItems: 0,
  });

  const blogSectionRef = useRef(null);

  const fetch_blogs = async (
    category_ids = "",
    s_term = "",
    page = 1,
    order_by = SORT_OPTIONS[0].value,
  ) => {
    setloading(true);
    try {
      // Build the query string dynamically based on category & search
      let query = `?page=${page}&page_size=${PAGE_SIZE}&nested=True&depth=3&order_by=${order_by}`;

      if (category_ids.length > 0) {
        category_ids?.map((cat) => {
          query += `&category=${cat}`;
        });
      }
      if (s_term) {
        // Append the search parameter if it is not blank
        query += `&title=${s_term}`;
      }

      const res = await BlogListApi.get(query);

      setBlogs(res?.results || []);
      setPagination({
        count: res?.last_page || Math.ceil((res?.total_items || 0) / PAGE_SIZE),
        next: res?.links?.next,
        previous: res?.links?.previous,
        currentPage: res?.current_page || page,
        totalItems: res?.total_items || 0,
      });
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setloading(false);
    }
  };

  const fetchBlogcategories = async () => {
    try {
      const res = await BlogCategoryApi.get(``);
      setBlogCategories(res?.results);
    } catch (err) {
      console.error("Error fetching blog categories:", err);
    }
  };

  useEffect(() => {
    fetchBlogcategories();
  }, []);

  useEffect(() => {
    if (!filterOpen) return;

    const lenis = lenisRef?.current;

    lenis?.stop();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen, lenisRef]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;
    const categories = searchParams.getAll("category");
    const order_by = searchParams.get("order_by") || SORT_OPTIONS[0].value;

    setSearchTerm(q);
    setSelectedCategories(categories);
    setSortBy(order_by);

    fetch_blogs(categories, q, page, order_by);
  }, [searchParams.toString()]);

  // Filters apply straight away — the URL stays the source of truth
  const push_filters = (categories, order_by = sort_by) => {
    const params = new URLSearchParams();

    if (search_term) {
      params.set("q", search_term);
    }

    categories.forEach((id) => {
      params.append("category", id);
    });

    if (order_by !== SORT_OPTIONS[0].value) {
      params.set("order_by", order_by);
    }

    params.set("page", "1");

    router.push(`/blogs?${params.toString()}`, undefined, { scroll: false });
  };

  const commit_categories = (next) => {
    setSelectedCategories(next);

    // inside the sheet the choice is staged until "Apply Filter"
    if (!filterOpen) {
      push_filters(next);
    }
  };

  const handle_category_change = (category_id) => {
    const all_ids = blogCategories?.map((cat) => cat.id) || [];

    let next;
    if (all_selected) {
      // every box is ticked, so this click is unticking one of them
      next = all_ids.filter((id) => id !== category_id);
    } else if (selected_categories.includes(category_id)) {
      next = selected_categories.filter((id) => id !== category_id);
    } else {
      next = [...selected_categories, category_id];
    }

    // ticking the last remaining box is the same as "All Articles"
    commit_categories(next.length === all_ids.length ? [] : next);
  };

  // "All Articles" ticks every category; an empty selection is how the API
  // asks for all of them
  const select_all_categories = () => commit_categories([]);

  const close_sheet = () => {
    // drop anything staged but not applied
    setSelectedCategories(searchParams.getAll("category"));
    setFilterOpen(false);
  };

  const apply_sheet = () => {
    setFilterOpen(false);
    push_filters(selected_categories);
  };

  const clear_sheet = () => {
    setSelectedCategories([]);
  };

  const handle_sort_change = (e) => {
    setSortBy(e.target.value);
    push_filters(selected_categories, e.target.value);
  };

  const clear = () => {
    router.push("/blogs", undefined, { scroll: false });
  };

  const handlePageChange = (_, page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);

    router.push(`/blogs?${params.toString()}`, undefined, { scroll: false });
  };

  // no selection and "one of each" are the same thing: every article shows
  const all_selected =
    selected_categories.length === 0 ||
    selected_categories.length === blogCategories?.length;

  // the API echoes its own default page_size, so count off what it actually returned
  const range_start =
    blogs.length === 0 ? 0 : (pagination.currentPage - 1) * PAGE_SIZE + 1;
  const range_end = range_start === 0 ? 0 : range_start + blogs.length - 1;

  return (
    <div className="blogs-page" ref={blogSectionRef}>
      <PageBanner
        title={settings?.our_blog_hero_title || "Insights & Blog"}
        description={
          settings?.our_blog_hero_description ||
          "Thought leadership on recruitment, HR, finance & advisory solutions."
        }
        image={mediaUrl(settings?.our_blog_hero_image, "/images/blog-bg.webp")}
        position="center 45%"
      />

      <div className="container">
        <div className="blogs-page-container">
          {/* backdrop only exists for the mobile sheet */}
          <div
            className={`filter-backdrop ${filterOpen ? "open" : ""}`}
            onClick={close_sheet}
            aria-hidden="true"
          />

          <div className={`blog-filter ${filterOpen ? "open" : ""}`}>
            <div className="filter-box">
              <div className="sheet-header">
                <h4>Filter</h4>

                <button type="button" onClick={close_sheet}>
                  Close
                </button>
              </div>

              <h4 className="filter-heading">Filter Articles</h4>

              <div className="filter-body">
                <p className="filter-label">Category</p>

                {/* Category checkboxes */}
                <div className="category">
                  <ul>
                    <li style={{ listStyle: "none" }}>
                      <FormControlLabel
                        control={
                          <CustomCheckbox
                            checked={all_selected}
                            onChange={select_all_categories}
                          />
                        }
                        label="All Articles"
                      />
                    </li>

                    {blogCategories?.map((cat) => (
                      <li key={cat.id} style={{ listStyle: "none" }}>
                        <FormControlLabel
                          control={
                            <CustomCheckbox
                              checked={
                                all_selected ||
                                selected_categories.includes(cat.id)
                              }
                              onChange={() => handle_category_change(cat.id)}
                            />
                          }
                          label={cat.category}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button onClick={clear} className="cta-btn desktop-action">
                Clear All Filter
              </button>

              <div className="sheet-actions">
                <button type="button" className="clear-btn" onClick={clear_sheet}>
                  Clear
                </button>

                <button type="button" className="cta-btn" onClick={apply_sheet}>
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          <div className="blogs">
            <div className="results-bar">
              <p className="count">
                Showing <strong>{pagination.totalItems}</strong> articles
              </p>

              <button
                type="button"
                className="filter-trigger"
                onClick={() => setFilterOpen(true)}
              >
                Filter <Tune />
              </button>

              <div className="sort">
                <label htmlFor="blog-sort">Sort by</label>
                <select
                  id="blog-sort"
                  value={sort_by}
                  onChange={handle_sort_change}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-grid">
              {blogs?.map((blog) => (
                <BlogCard data={blog} key={blog?.id} />
              ))}
            </div>

            {!loading && blogs?.length === 0 && (
              <p className="no-results">
                No articles match your filters yet.
              </p>
            )}

            {/* Pagination */}
            <div className="pagination-bar">
              <p className="range">
                Showing {range_start}-{range_end} out of {pagination.totalItems}
              </p>

              {pagination.count > 1 && (
                <CustomPagination
                  count={pagination.count}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  shape="rounded"
                  siblingCount={1}
                  boundaryCount={1}
                  renderItem={(item) => (
                    <PaginationItem
                      slots={{ previous: ChevronLeft, next: ChevronRight }}
                      {...item}
                    />
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
