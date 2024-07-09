import React, { useState, useEffect } from "react";
import { getAllClockworkSettings } from "../../lib/Clockwork/api";
import {
  GetCollectionSubs,
  fetchProductsByCollectionId,
  fetchProductsByCollectionSlug,
  upvoteCollection,
  downvoteCollection,
} from "../../lib/api";
import { checkForKey, getProducts } from "../../hooks/printful";
import PrintfulClient from "../../lib/Printful/api";
import styles from "../../styles/Product.module.css";
import Product from "../../components/Product/Product";
import PrintfulProduct from "../../components/Product/PrintfulProduct";
import SubscriptionCard from "../../components/SubscriptionCard";
import Link from "next/link";
import {
  LogoTwitter,
  LogoDiscord,
  LogoYoutube,
  LogoMedium,
  LogoWebComponent,
  LogoInstagram,
  TicketOutline,
} from "react-ionicons";
import {
  IoInformationCircle,
  IoCloseOutline,
  IoThumbsDown,
  IoThumbsUp,
} from "react-icons/io5";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";

function Store() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [userPublicKey, setUserPublicKey] = useState("");
  const [owner, setOwner] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [discordServer, setDiscordServer] = useState("");
  const [website, setWebsite] = useState("");
  const [youtube, setYoutube] = useState("");
  const [allSubs, setAllSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalToggle, setModalToggle] = useState(false);
  const [totalUpvotes, setTotalUpvotes] = useState(0);
  const [totalDownvotes, setTotalDownvotes] = useState(0);
  const [sellerPolicy, setSellerPolicy] = useState("");
  const [upvoteCounted, setUpvoteCounted] = useState(false);
  const [alreadyUpvoted, setAlreadyUpvoted] = useState(false);

  // PRINTFUL
  const [printfulLoading, setPrintfulLoading] = useState(true);
  const [hasPrintful, setHasPrintful] = useState(false);
  const [printfulProducts, setPrintfulProducts] = useState([]);

  const handleUpvote = async () => {
    if (userPublicKey && !upvoteCounted && !alreadyUpvoted) {
      try {
        upvoteCollection(collectionId, userPublicKey).then((res) => {
          if (res.code === 600) {
            setAlreadyUpvoted(true);
          }
          if (res.code === 200) {
            setUpvoteCounted(true);
            setTotalUpvotes(totalUpvotes + 1);
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else if (!userPublicKey) {
      alert("Please connect your wallet to upvote");
    } else if (alreadyUpvoted) {
      alert("You have already upvoted this store");
    }
  };

  const handleDownvote = async () => {
    if (userPublicKey) {
      downvoteCollection(collectionId, userPublicKey).then((res) => {
        if (res) {
          setTotalDownvotes(totalDownvotes + 1);
        }
      });
    } else {
      alert("Please connect your wallet to downvote");
    }
  };

  useEffect(() => {
    setLoading(true);
    async function showProductDetails() {
      const url = window.location.href;
      const slug = url.split("/")[4].split("?")[0];
      const collection = await fetchProductsByCollectionSlug(slug);
      console.log("collection", collection);
      const subscriptions = await getAllClockworkSettings({
        owner: collection.owner,
      });
      console.log("subscriptions", subscriptions);
      setAllSubs(subscriptions);
      var store_products = [];
      // filter through the collection.products and only add the ones that are type 'product'
      collection.products.forEach((product) => {
        if (product.type === "product" && product.hide !== true) {
          store_products.push(product);
        }
      });
      console.log("store_products", store_products);
      setProducts(store_products);
      setOwner(collection.owner);
      setCollectionId(collection.id);
      setBanner(
        collection.bannerImage ? collection.bannerImage.url : collection.banner
      );
      setSellerPolicy(collection.sellerPolicy);
      setProjectName(collection.projectName);
      setProjectDesc(collection.description);
      setTwitterHandle(collection.twitterHandle);
      setInstagramHandle(collection.instagramHandle);
      setDiscordServer(collection.discordServer);
      setWebsite(collection.website);
      setYoutube(collection.youtube);
      setTotalUpvotes(collection.upvote != null ? collection.upvote : 0);
      setTotalDownvotes(collection.downvote != null ? collection.downvote : 0);
      console.log("upvotes and downvotes", totalUpvotes, totalDownvotes);
      setLoading(false);
      const p = await checkForKey(collection.id);
      console.log("p is ", p);
      if (p) {
        const p_products = await getProducts(collection.id);
        console.log("p_products", p_products);
        setPrintfulProducts(p_products);
      }
    }
    showProductDetails();
  }, []);
  const changeContent = () => {
    setModalToggle(!modalToggle);
  };

  const [active, setActive] = useState(false);
  const [block, setBlock] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      async function gatherMagicData() {
        try {
          const data = localStorage.getItem("userMagicMetadata");
          const parsedData = await JSON.parse(data);
          console.log("parsedData", parsedData);
          const magicKey = new web3.PublicKey(parsedData.publicAddress);
          setUserPublicKey(magicKey.toString());
        } catch (error) {
          console.log(error);
        }
      }
      gatherMagicData();
    }
    if (publicKey) {
      setUserPublicKey(publicKey.toString());
    }
  }, [publicKey]);

  return (
    <>
      <div className="store_hero">
        <div className="containers">
          <div className="row1">
            <div className="p_title">
              <span>Project name:</span>
              <div className={styles.name_thumb}>
                <h4>{projectName}</h4>
                <div
                  className={styles.thumbs_up}
                  onClick={() => (console.log("upvote"), handleUpvote())}
                  aria-disabled={upvoteCounted || alreadyUpvoted}
                >
                  {totalUpvotes}

                  <IoThumbsUp
                    style={{
                      fontSize: "19px",
                    }}
                  />
                  {/* <div>
                    {totalUpvotes === 1 ? "LIKE" : "LIKES"}

                    {alreadyUpvoted
                      ? "Already upvoted"
                      : upvoteCounted
                      ? "Upvote counted"
                      : "Upvote this store"}
                  </div> */}
                </div>
              </div>
            </div>

            <div className="p_desc">
              <span>Description:</span>
              <p>{projectDesc}</p>
            </div>

            <div
              className={styles.seller_policy}
              onMouseOver={() => changeContent()}
            >
              <IoInformationCircle
                style={{
                  fontSize: "18px",
                }}
              />
              <p>Seller's Policy</p>
            </div>
            {modalToggle && (
              <div
                className={styles.seller_policy_container}
                // onClick={changeContent}
              >
                <div
                  className={styles.seller_policy_content}
                  // onClick={(e) => e.stopPropagation()}
                  onMouseOut={() => changeContent()}
                >
                  {/* <button className={styles.close_btn} onClick={changeContent}>
                    <IoCloseOutline />
                  </button> */}

                  <strong>{projectName.toUpperCase()} STORE POLICY</strong>
                  <p className={styles.seller_policy_content_p}>
                    {sellerPolicy}
                  </p>
                </div>
              </div>
            )}
            <div className="hero_socials">
              {twitterHandle !== "" && twitterHandle !== null && (
                <a href={twitterHandle} target="_blank" rel="noreferrer">
                  <LogoTwitter
                    style={{
                      color: "#fff",
                      background: "#dadada",
                      width: "50px",
                      height: "50px",
                      borderRadius: "24px",
                      fontSize: "16px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              )}
              {instagramHandle !== "" && instagramHandle !== null && (
                <a href={instagramHandle} target="_blank" rel="noreferrer">
                  <LogoInstagram
                    style={{
                      color: "#fff",
                      background: "#dadada",
                      width: "50px",
                      height: "50px",
                      borderRadius: "24px",
                      fontSize: "16px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              )}
              {youtube !== "" && youtube !== null && (
                <a href={youtube} target="_blank" rel="noreferrer">
                  <LogoYoutube
                    style={{
                      color: "#fff",
                      background: "#dadada",
                      width: "50px",
                      height: "50px",
                      borderRadius: "24px",
                      fontSize: "16px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              )}
              {discordServer !== "" && discordServer !== null && (
                <a href={discordServer} target="_blank" rel="noreferrer">
                  <LogoDiscord
                    style={{
                      color: "#fff",
                      background: "#dadada",
                      width: "50px",
                      height: "50px",
                      borderRadius: "24px",
                      fontSize: "16px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              )}
              {website !== "" && website !== null && (
                <a href={website} target="_blank" rel="noreferrer">
                  <LogoWebComponent
                    style={{
                      color: "#fff",
                      background: "#dadada",
                      width: "50px",
                      height: "50px",
                      borderRadius: "24px",
                      fontSize: "16px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              )}
            </div>

            {/* <div className={styles.rating_thumbs_div}>
              <h5>Rate your experience with this Seller</h5>
              {totalUpvotes !== null && totalDownvotes !== null && totalUpvotes + totalDownvotes !== 0 && (
                <span
                  style={{
                    textWeight: "bold",
                  }}
                >
                  Seller Rating: {
                    // seller rating logic here, display average rating as a percentage
                    
                    <span>{Math.round((totalUpvotes / (totalUpvotes + totalDownvotes)) * 100)}%</span>
                  }

                </span>
              )}
              
              <div className={styles.thumbs_div}>
           
                <div 
                  className={styles.thumbs_up}
                  onClick={()=> (
                    console.log("upvote"),
                    handleUpvote()
                  )}
                >
                  <IoThumbsUp
                    style={{
                      fontSize: "40px",
                    }}
                  />
                  <p>Upvote</p>
                </div>
                <div 
                  className={styles.thumbs_down}
                  onClick={()=> (
                    console.log("downvote"),
                    handleDownvote()
                  )}
                >
                  <IoThumbsDown
                    style={{
                      fontSize: "40px",
                    }}
                  />
                  <p>Downvote</p>
                </div>
                
              </div>
            </div>  */}
          </div>
          {banner !== "" && (
            <div className="row2">
              <img src={banner} alt="banner" />
              {/* <div className="overlay"></div> */}
            </div>
          )}
        </div>
      </div>
      {/* <div className="banner_hero">
            <div className="hero_text">
              <h1>Welcome to Ikon's Store.</h1>
              <button className="hero-button">Shop Now</button>
            </div>
            <div className="hero_overlay"></div>
            <img className="banner-container" src={banner} alt="banner" />
          </div> */}

      {/* <div className="search_container">
          <div className="input_wrap">
            <input
              type="text"
              name="product_search"
              placeholder="Search products"
            />
          </div>
        </div> */}
      <div className="products-container">
        {products.map((product, index) => (
          <Product key={index} product={product} />
        ))}

        {printfulProducts &&
          printfulProducts.map((product, index) => (
            <PrintfulProduct
              key={index}
              collectionId={collectionId}
              owner={owner}
              product={product}
            />
          ))}
      </div>

      {/* {!loading && allSubs.length > 0 && (
          <div className="sub_div">
            <h6 className="subscriptions_header">SUBSCRIPTIONS</h6>
            <TicketOutline style={{ marginTop: "-10px", marginLeft: "16px" }} />
          </div>
        )}
        <div className="products-container">
          {!loading &&
            allSubs.length > 0 &&
            allSubs.map((sub, index) => (
              <SubscriptionCard key={index} sub={sub} />
            ))}
        </div> */}
    </>
  );
}
export default Store;
