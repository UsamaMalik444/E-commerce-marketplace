import React, { useState, useEffect } from "react";
import styles from "./styles/Profile.module.css";
import Loading from "../Loading";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  IoLogoFacebook,
  IoLogoDiscord,
  IoLogoTwitter,
  IoCopyOutline,
  IoWalletOutline,
  IoGlobeOutline,
  IoLogoInstagram,
  IoLogoYoutube,
  IoLogoGithub,
  IoLogoMedium,
  IoLogoLinkedin,
  IoLogoReddit,
  IoLogoTwitch,
  IoLogoTiktok,
  IoLogoSnapchat,
  IoLogoPinterest,
  IoLogoWhatsapp,
  IoLogoVimeo,
  IoLogoDribbble,
} from "react-icons/io5";
import { GetSimilarProfiles, GetUpvotedCollections } from "../../lib/api";
import Link from "next/link";

const Profile = (data) => {
  const profile = data.data;
  console.log("profile", profile);
  const collections = data.collections;
  const [loading, setLoading] = useState(true);
  const interests = profile.interest;
  const [socialLinks, setSocialLinks] = useState([]);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [upvotedCollections, setUpvotedCollections] = useState([]);
  const verified = profile.verified;
  const createdAt = profile.createdAt;
  const owner = profile.owner;
  const description = profile.description;
  const highscores = profile.highscores;
  const profileImage = profile.profileImage
    ? profile.profileImage.url
    : "/not_selected.png";
  const name = profile.name;

  const website_icons = {
    twitter: <IoLogoTwitter />,
    facebook: <IoLogoFacebook />,
    discord: <IoLogoDiscord />,
    instagram: <IoLogoInstagram />,
    youtube: <IoLogoYoutube />,
    website: <IoGlobeOutline />,
    github: <IoLogoGithub />,
    medium: <IoLogoMedium />,
    linkedin: <IoLogoLinkedin />,
    reddit: <IoLogoReddit />,
    twitch: <IoLogoTwitch />,
    tiktok: <IoLogoTiktok />,
    snapchat: <IoLogoSnapchat />,
    pinterest: <IoLogoPinterest />,
    whatsapp: <IoLogoWhatsapp />,
    vimeo: <IoLogoVimeo />,
    dribbble: <IoLogoDribbble />,
  };

  useEffect(() => {
    AOS.init({ once: true, duration: 800 });
    var a = [];
    console.log(socialLinksArray);
    const socialLinksArray = Object.keys(profile.socialLinks).map(
      (key) => profile.socialLinks[key]
    );

    setSocialLinks(socialLinksArray);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("profile", profile);
    GetSimilarProfiles(interests).then((res) => {
      console.log("similar profiles", res);
      setSimilarProfiles(res);
    });
    GetUpvotedCollections(owner).then((res) => {
      console.log("upvoted collections", res);
      setUpvotedCollections(res);
    });
  }, []);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className={styles.profile_parent}>
          <div
            className={styles.profile_wallet}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div onClick={() => window.navigator.clipboard.writeText(owner)}>
              <IoWalletOutline />
              <p>
                {owner.slice(0, 4)}...{owner.slice(-4)}
              </p>
            </div>

            {verified ? (
              <span className={styles.verified}>VERIFIED</span>
            ) : (
              <span className={styles.unverified}>UNVERIFIED</span>
            )}
            {collections.length > 0 ? (
              <span className={styles.collections}>MERCHANT</span>
            ) : null}
          </div>

          <div
            style={{ width: "auto", maxWidth: "960px" }}
            className={styles.profile_blob}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div
              className={styles.profile_img}
              data-aos="fade-up"
              data-aos-delay="250"
            >
              <img src={profileImage} alt="Profile picture" />
            </div>
            <h3 data-aos="fade-up" data-aos-delay="250">
              {name}
            </h3>
            <p
              className={styles.profile_bio}
              dangerouslySetInnerHTML={{ __html: description }}
              data-aos="fade-up"
              data-aos-delay="300"
            />

            <p
              className={styles.profile_duration}
              data-aos="fade-up"
              data-aos-delay="400"
            >
              Member Since : {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          {collections.length > 0 && (
            <div
              className={styles.profile_blob}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h5>Storefronts</h5>
              <div className={styles.collection_card}>
                <Link
                  href={`/store/${collections[0].slug}`}
                  key={collections[0].slug}
                >
                  <a>
                    <img
                      style={{ width: "100%", height: "100%" }}
                      src={
                        collections[0].bannerImage != null ||
                        collections[0].bannerImage != undefined
                          ? collections[0].bannerImage.url
                          : collections[0].banner
                      }
                      alt="Collection image"
                    />
                    <div className={styles.storefront_img_overlay}>
                      <div className={styles.collection_card_info}>
                        <h5>{collections[0].projectName}</h5>
                        <p>{collections[0].description}</p>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            </div>
          )}

          <div
            className={styles.profile_blob}
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <h5>Current Interests</h5>
            <div className={styles.interest_cards}>
              {interests.map((interest, index) => (
                <div key={index}>
                  {/* <img src="/star.png" /> */}
                  <span className={styles.interest}>
                    {interest.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={styles.profile_blob}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h5 data-aos="fade-up" data-aos-delay="250">
              Social links
            </h5>
            <span
              className={styles.social_links}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {socialLinks.map((link, index) => {
                console.log(link.split(".")[0]);

                return (
                  <div key={index}>
                    <Link
                      href={
                        link.includes("http") || link.includes("https")
                          ? link
                          : `https://${link}`
                      }
                      target="_blank"
                    >
                      <a className={styles.social_links}>
                        {website_icons[link.split(".")[1]]}
                        <p>{link}</p>
                      </a>
                    </Link>
                  </div>
                );
              })}
            </span>
          </div>

          {/* SIMILAR PROFILES */}
          {/* <div
            className={styles.profile_blob}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h5 data-aos="fade-up" data-aos-delay="250">
              Similar Profiles
            </h5>
            <span
              className={styles.social_links}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {similarProfiles.map((profile, index) => (
                <div key={index} >
                  <Link href={`https://ikonshop.io/profile/${profile.owner}`}>
                    <a className={styles.similar_profiles}>
                      <img className={styles.profile_img} src={profile.profileImage != null ? profile.profileImage.url : '/not_selected.png'} alt="Profile picture" />
                      <p>{profile.name}</p>
                    </a>
                  </Link>
                </div>
              ))}
            </span>
          </div> */}

          <div
            className={styles.profile_blob}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h5 data-aos="fade-up" data-aos-delay="250">
              Upvoted Collections
            </h5>
            <span
              className={styles.social_links}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {upvotedCollections.map((collection, index) => (
                <div key={index}>
                  <Link href={`/store/${collection.slug}`}>
                    <a className={styles.similar_profiles}>
                      <img
                        className={styles.profile_img_upvoted}
                        src={
                          collection.bannerImage != null
                            ? collection.bannerImage.url
                            : "/not_selected.png"
                        }
                        alt="Profile picture"
                      />
                      <p>{collection.projectName}</p>
                    </a>
                  </Link>
                </div>
              ))}
            </span>
          </div>

          <div className={styles.profile_share}>
            <p>Share this profile</p>
            <span>
              {/* Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20profile%20on%20IkonShop%20https://ikonshop.io/profile/${owner}`}
                target="_blank"
              >
                <IoLogoTwitter />
              </a>
              {/* FaceBook */}
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https://cryptosocial.network/profile/0x8f7b0f9f5b8f1b5b5b5b5b5b5b5b5b5b5b5b5b"
                target="_blank"
              >
                <IoLogoFacebook />
              </a>
              {/* Copy */}
              <a
                onClick={() =>
                  window.navigator.clipboard.writeText(
                    `https://ikonshop.io/profile/${owner}`
                  )
                }
              >
                <IoCopyOutline style={{ cursor: "pointer" }} />
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
