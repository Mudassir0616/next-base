import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css/effect-fade";
import { useSiteSetting } from "@/context/useSiteSettings";
import { highlight, mediaUrl } from "@/utils/functionUtils";
import { East } from "@mui/icons-material";

const HeroBanner = () => {
  const router = useRouter();
  const { settings, loading } = useSiteSetting();

  const images = [
    mediaUrl(settings?.home_image, "/images/banner-1.webp"),
    mediaUrl(settings?.home_image_two),
    mediaUrl(settings?.home_image_three),
  ].filter(Boolean);

  return (
    <div className="banner-container">
      <Swiper
        // the CMS images arrive after mount, and Swiper keeps whatever autoplay
        // and loop settings it was initialised with — so re-init on the new set
        key={images.join("|")}
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1500}
        loop={images.length > 1}
        autoplay={
          images.length > 1
            ? { delay: 3000, disableOnInteraction: false }
            : false
        }
        className="banner-swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="banner-image">
              <img src={image} alt="Hero Banner" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="banner-content container">
        <div className="content">
          {/* the copy is fetched in the browser — hold the space until it lands
              so the heading rule never shows above an empty title */}
          {loading ? (
            <div className="banner-skeleton" aria-hidden="true">
              <span className="skeleton-line title" />
              <span className="skeleton-line title short" />
              <span className="skeleton-line text" />
              <span className="skeleton-line text mid" />
              <span className="skeleton-line text short" />
            </div>
          ) : (
            <>
              <h1
                dangerouslySetInnerHTML={{
                  __html: highlight(settings?.home_title),
                }}
              />

              <p
                dangerouslySetInnerHTML={{
                  __html: settings?.home_description || "",
                }}
              />
            </>
          )}

          <div className="actions">
            <button
              onClick={() => router.push("/expertise")}
              className="white-cta"
            >
              Explore Our Expertise <East />
            </button>

            <button onClick={() => router.push("/contact")} className="cta-btn">
              <div className="icon-container">
                <img src="/icons/call.svg" />
              </div>
              Talk to Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
