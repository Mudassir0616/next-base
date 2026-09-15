import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import MobileNavbar from "./MobileNavbar";
import Link from "next/link";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const [expertise, setExpertise] = useState([]);
  // Refs for audio and navigation container
  const navContainerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuItemsRef = useRef([]);
  menuItemsRef.current = [];

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [check, setCheck] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState({}); // State to manage which submenu is open

  const handleClick = () => {
    setCheck((prevCheck) => !prevCheck);
  };

  const toggleSubMenu = (menu) => {
    setOpenSubMenu((prevMenu) => ({
      ...prevMenu,
      [menu]: !prevMenu[menu],
    }));
  };

  // key of the open dropdown, so hovering one doesn't open the others
  const [openMenu, setOpenMenu] = useState(null);

  // const fetch_expertise = async () => {
  //   try {
  //     const res = await ExpertiseCategoryApi.get(`?order_by=order_by`);
  //     setExpertise(res?.results || []);
  //   } catch (error) {
  //     console.error("Failed to fetch expertise categories:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetch_expertise();
  // }, []);

  // hold the page still while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = check ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [check]);

  useEffect(() => {
    if (currentScrollY === 0) {
      // Topmost position: show navbar without floating-nav
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY && !check) {
      // Scrolling down: hide navbar and apply floating-nav
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY && !check) {
      // Scrolling up: show navbar with floating-nav
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  // Toggle Mobile Menu with Animation
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { x: "100%", y: "-100%", opacity: 0 },
        {
          x: "0%",
          y: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        menuItemsRef.current,
        {
          opacity: 0,
          transform:
            "translate3d(10px, 1px, -60px) rotateY(-60deg) rotateX(-40deg)",
          transformOrigin: "50% 50% -150px",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
          duration: 0.5,
          stagger: 0.1,
          delay: 0.2,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: "power3.in",
      });

      gsap.to(menuItemsRef.current, {
        opacity: 1,
        transform:
          "translate3d(10px, 1px, -60px) rotateY(-60deg) rotateX(40deg)",
        transformOrigin: "50% 50% 150px",
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  return (
    <nav className={`nav-container ${check ? "active" : ""}`}>
      <header className="nav-header container" ref={navContainerRef}>
        <nav className="nav-inner">
          {/* <!-- Logo and Product Button --> */}
          <div className="logo-container">
            <Link href={"/"}>
              <img src="/images/logo.png" alt="logo" className="logo" />
            </Link>
          </div>

          {/* <!-- Navigation Links --> */}
          <div className="nav-links-container">
            <div className="nav-links">
              <Link href={"/"} className="nav-link">
                Home
              </Link>

              <div
                className="nav-item"
                onMouseEnter={() => setOpenMenu("about")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div
                  className={`categories-dropdown ${
                    openMenu === "about" ? "active" : ""
                  }`}
                >
                  <span>About Us</span>
                  {openMenu === "about" ? <ExpandLess /> : <ExpandMore />}
                </div>

                {openMenu === "about" && (
                  <ul className="dropdown-menu">
                    <li>
                      <Link href={"/about-us"}>About Us</Link>
                    </li>
                    <li>
                      <Link href={"/our-team"}>Our Team</Link>
                    </li>
                    <li>
                      <Link href={"/careers"}>Careers</Link>
                    </li>
                  </ul>
                )}
              </div>

              {/* <div
                className="nav-item has-mega"
                onMouseEnter={() => setOpenMenu("expertise")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div
                  className={`categories-dropdown ${
                    openMenu === "expertise" ? "active" : ""
                  }`}
                >
                  <Link href={"/expertise"}>
                    <span>Expertise</span>
                  </Link>
                  {openMenu === "expertise" ? <ExpandLess /> : <ExpandMore />}
                </div>

                {openMenu === "expertise" && (
                  <div className="mega-menu">
                    {expertise.map((column) => (
                      <div className="mega-column" key={column.slug}>
                        <h4>
                          <Link href={`/expertise/${column.slug}`}>
                            {column.title}
                          </Link>
                        </h4>

                        <ul>
                          {column.api_expertise?.map((capability) => (
                            <li key={capability.slug}>
                              <Link
                                href={`/expertise/${column.slug}/${capability.slug}`}
                              >
                                {capability.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}

              <div
                className="nav-item"
                onMouseEnter={() => setOpenMenu("insights")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div
                  className={`categories-dropdown ${
                    openMenu === "insights" ? "active" : ""
                  }`}
                >
                  <span>Insights</span>
                  {openMenu === "insights" ? <ExpandLess /> : <ExpandMore />}
                </div>

                {openMenu === "insights" && (
                  <ul className="dropdown-menu">
                    <li>
                      <Link href={"/blogs"}>Blogs</Link>
                    </li>
                    <li>
                      <Link href={"/faqs"}>FAQs</Link>
                    </li>
                    <li>
                      <Link href={"/case-study"}>Success Stories</Link>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          <button
            className="cta-btn nav-cta"
            onClick={() => router.push("/contact")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.93463 3.91427L7.46486 2.85729C7.1577 2.16619 7.00412 1.82063 6.77444 1.55618C6.48659 1.22476 6.11138 0.98093 5.69162 0.852492C5.35669 0.75 4.97853 0.75 4.22224 0.75C3.11589 0.75 2.56272 0.75 2.09835 0.962672C1.55135 1.21319 1.05734 1.75716 0.860515 2.3257C0.693425 2.80834 0.741293 3.30433 0.837007 4.29632C1.85589 14.8552 7.64479 20.6441 18.2036 21.663C19.1957 21.7587 19.6917 21.8065 20.1742 21.6395C20.7429 21.4426 21.2868 20.9487 21.5374 20.4016C21.75 19.9373 21.75 19.3841 21.75 18.2777C21.75 17.5215 21.7499 17.1434 21.6475 16.8084C21.5191 16.3887 21.2752 16.0135 20.9438 15.7255C20.6794 15.4959 20.3339 15.3423 19.6427 15.0351L18.5857 14.5654C17.8373 14.2328 17.463 14.0664 17.0828 14.0302C16.7188 13.9956 16.3519 14.0467 16.0112 14.1793C15.6553 14.3179 15.3407 14.5801 14.7114 15.1045C14.0852 15.6264 13.772 15.8873 13.3894 16.0271C13.0501 16.1511 12.6016 16.197 12.2444 16.1444C11.8413 16.085 11.5327 15.92 10.9155 15.5902C8.99513 14.5639 7.93612 13.5049 6.90985 11.5846C6.57999 10.9673 6.41507 10.6587 6.35568 10.2556C6.30303 9.89837 6.34892 9.4499 6.47285 9.11064C6.61264 8.72799 6.87361 8.41484 7.39555 7.7885C7.91989 7.15929 8.18206 6.84469 8.32067 6.48873C8.45332 6.1481 8.50439 5.78113 8.46977 5.41723C8.43359 5.03694 8.26727 4.66272 7.93463 3.91427Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Contact Us
          </button>

          <div
            className={`${check ? "active-nav" : ""} hamburger`}
            onClick={handleClick}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      <MobileNavbar
        check={check}
        toggleSubMenu={toggleSubMenu}
        openSubMenu={openSubMenu}
        onNavigate={() => setCheck(false)}
        expertise={expertise}
      />
    </nav>
  );
};

export default Navbar;
