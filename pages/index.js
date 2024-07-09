import React, { useState, useEffect } from "react";
import HeadComponent from "../components/Head";
import Loading from "../components/Loading";
import { GetRandomShowcaseProducts, GetShowcaseCollections } from "../lib/api";
import styles from "../styles/Header.module.css";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import AOS from "aos";
import "aos/dist/aos.css";
import dynamic from "next/dynamic";
import Container from "react-bootstrap/Container";
import LoginMagic from "../components/MagicWallet/login";

import {
  IoArrowForward,
  IoStorefront,
  IoWalletOutline,
  IoCloseOutline,
  IoMailOutline,
  IoChevronBack,
} from "react-icons/io5";
import AccordionItem from "../components/FAQ";

// Constants
export const GRAPHCMS_TOKEN = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
export const WEB3STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN;

const App = (props) => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [loginOptionSelected, setLoginOptionSelected] = useState("");

  const WalletMultiButton = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );

  const keywords = ["Tips", "Pay Links", "Products", "Life"];
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [activeWord, setActiveWord] = useState(keywords[0]);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [showcaseCollections, setShowcaseCollections] = useState([]);

  const faqs = [
    {
      id: 1,
      header: "What is a Web3 ecommerce platform?",
      text: `A Web3 ecommerce platform is a decentralized, blockchain-based marketplace that leverages smart contracts and cryptocurrency for secure and transparent transactions between buyers and sellers. It combines the benefits of blockchain technology with traditional ecommerce features to create a more equitable and user-driven online shopping experience.`,
    },
    {
      id: 2,
      header: "How does a Web3 ecommerce platform work?",
      text: `A Web3 ecommerce platform connects buyers and sellers directly, without intermediaries. It utilizes blockchain technology and smart contracts to manage transactions, ensuring secure and transparent processing. Buyers use cryptocurrency to purchase products, while sellers receive payments in the form of digital assets.`,
    },
    {
      id: 3,
      header: " What are the benefits of using a Web3 ecommerce platform?",
      text: "Some benefits of using IkonShop include:  ➊ Decentralization: Elimination of middlemen reduces fees and potential for fraud.  ➋ Security: Blockchain technology ensures secure and transparent transactions.  ➌ Ownership: Users have full control over their data and digital assets.  ➍ Incentives: Tokenized rewards systems can encourage user engagement and loyalty.  ➎ Global accessibility: Anyone with an internet connection and a digital wallet can participate.",
    },
    // {
    //   id: 4,
    //   header: "What cryptocurrencies are supported on the platform?",
    //   text: `Supported cryptocurrencies are stablecoin USD Coin (USDC) and SOL. A seller may also implement other forms SPL tokens to accept in their store.`,
    // },
    {
      id: 4,
      header: "How do I create an account on IkonShop?",
      text: `To create an account, you will need a digital wallet compatible. For now they are: Phantom, Solflare, Solong, Atomic, Ledger Nano X.... Once installed, follow the platform's onboarding process, which typically involves connecting your wallet and approving any necessary transactions.`,
    },
    // {
    //   id: 6,
    //   header: "How do I buy and sell products on the platform?",
    //   text: `To buy products, browse the platform's listings, select an item, and complete the checkout process using your digital wallet. To sell products, create a new merchant account. Your digital wallet will be connected to manage transactions and receive payments.`,
    // },
    // {
    //   id: 7,
    //   header: "How are disputes resolved?",
    //   text: `Dispute resolution methods may vary depending on the type of Tx. IkonShop implements a decentralized dispute resolution systems and a merit based system. We analyze sellers and their sellers metrics.`,
    // },
    // {
    //   id: 4,
    //   header: "Are there fees associated with using a IkonShop?",
    //   text: `Fees may include transaction costs (such as gas fees for Solana). These fees are usually lower than those on traditional ecommerce platforms, as there are no intermediaries.`,
    // },
    // {
    //   id: 9,
    //   header: "How does the platform handle refunds and returns?",
    //   text: `Refund and return policies vary depending on the seller. Before making a purchase, review the seller's return policy and any specific guidelines.`,
    // },
    // {
    //   id: 5,
    //   header: "Is my personal information safe on IkonShop?",
    //   text: `IkonShop is built with user privacy in mind. By design, they minimize the amount of personal information required and give users full control over their data. However, we suggest you review our privacy policy and take necessary precautions, such as using a secure digital wallet and keeping your private keys safe.`,
    // },
  ];

  const handleToggle = (index) => {
    if (active === index) {
      setActive(null);
    } else {
      setActive(index);
    }
  };

  const renderEmailLogin = () => {
    return (
      <div className={styles.loginOptions_select}>
        Email:
        <LoginMagic />
        <div
          onClick={() => setLoginOptionSelected("")}
          className={styles.loginOption_ind_flex}
        >
          <IoChevronBack />
          <span>Back</span>
        </div>
      </div>
    );
  };

  const renderWalletLogin = () => {
    return (
      <div className={styles.loginOptions_select}>
        Browser Wallet:
        <WalletMultiButton
          style={{
            borderRadius: "50px",
            background: "#130b46",
            width: "240px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Manrope",
          }}
        />
        <div
          onClick={() => setLoginOptionSelected("")}
          className={styles.loginOption_ind_flex}
        >
          <IoChevronBack />
          <span>Back</span>
        </div>
      </div>
    );
  };

  const renderLoginOptionsSelect = () => {
    return (
      <div className={styles.loginOptions_select}>
        <h3>Connect with:</h3>

        <div
          className={styles.loginOption1}
          onClick={() => setLoginOptionSelected("email")}
        >
          <IoMailOutline />
          <span>Email</span>
        </div>
        <div
          className={styles.loginOption2}
          onClick={() => setLoginOptionSelected("wallet")}
        >
          <IoWalletOutline />
          <span>Browser Wallet</span>
        </div>
      </div>
    );
  };

  const renderLoginOptions = () => {
    return (
      <div className={styles.loginOptions}>
        <div className={styles.loginOptions_container}>
          {loginOptionSelected === "email" && renderEmailLogin()}
          {loginOptionSelected === "wallet" && renderWalletLogin()}
          {loginOptionSelected === "" && renderLoginOptionsSelect()}
          <button
            className={styles.closeButton}
            onClick={() => (
              setShowLoginOptions(false), setLoginOptionSelected("")
            )}
          >
            <IoCloseOutline />
          </button>
        </div>
      </div>
    );
  };

  // STORE SHOWCASE
  const renderStoreShowcase = () => {
    return (
      <div className="showcase_container">
        <div className="showcase_header">
          <h2>Featured Stores</h2>
          <p>Discover new stores and products</p>
        </div>
        <div className="showcase_row">
          {showcaseCollections.map((collection, index) => {
            if (collection.verified) {
              return (
                <div
                  className="showcase_item_container"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    // make background image the banner
                    backgroundImage: `url(${collection.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    router.push(`/store/${collection.slug}`);
                  }}
                >
                  <div className="showcase_main">
                    <div className="showcase_small_header">
                      <IoStorefront />
                      <span>{collection.projectName}</span>
                    </div>

                    {/* <ul className="showcase_stats"> */}
                    {/* <li># of Products: {collection.products.length}</li> */}
                    {/* <li># of Orders: {collection.orderTxn.length}</li>
                    <li># of Likes: {collection.upvotedWallets.length} </li> */}
                    {/* </ul> */}
                  </div>
                </div>
              );
            } else return null;
          })}
        </div>
      </div>
    );
  };

  // CONNECTED DISPLAY
  const renderStoreContainer = () => {
    return (
      <>
        {/* main container */}
        <div>
          <section className="info_section">
            <div className="container_main3">
              <h1>
                {/* Create, Receive, and Manage :{" "}
                <span className="active_span">{activeWord}</span>
                <br />
                on <span className="sol_span">Solana</span> */}
                Explore decentralized commerce like never before.
              </h1>
              <p className="info_body3">
                Enjoy secure, transparent, and censorship-resistant
                transactions, empowering you with unprecedented control over
                your online shopping experience.
              </p>

              <br />
              <br />
              {showLoginOptions && renderLoginOptions()}
              <div
                className="signup_button"
                // onClick={() => setShowLoginOptions(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "none",
                }}
              >
                Early Beta
              </div>
            </div>
            <div className="container_info_img hero_img">
              <img src="/hero.png" alt="" />
            </div>
          </section>

          {renderStoreShowcase()}

          {/* <section className="info_section">
            <div className="container_main2">
              <div className="info_small_header2">
                <IoPerson />
                <span>Consumer</span>
              </div>
              <h1>
                Receive payments, tipjars, and get useful insights on your
                dashboard.
              </h1>
              <p className="info_body">
                For everyday users, degens etc IkonShop serves as a useful and
                insightful tool to manage you web3 finance
              </p>

              <br />
              <br />
              <div className="buttons">
                <button
                  className="signup_button"
                  onClick={() => {
                    router.push("/register/user");
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
            <div className="container_info_img">
              <img src="/img2.png" alt="" />
            </div>
          </section> */}

          {/* <section className="products_show">
            <div className="container_section">
              <h2>See what creators are selling</h2>
              <p className="products_sub_head">
                Explore Awesome Products from trusted Vendors on our Marketplace
              </p>
              <img src="/arrow.png" className="arrow_img" />
              {showcaseProducts.length > 0 && (
              <div className="products_show_flex">
                <div className="products_show_col1"> */}
          {/* <div className="product">
                    <a href="https://www.ikonshop.io/product/p/&&c=cljhosqqco3vl0birae0voqzp&&id=314082836">
                      <img src="/nike.jpeg" className="prod_img" />
                      <div className="prod_overlay"></div>
                      <p>
                        Visit Store{" "}
                        <span>
                          <IoArrowForward />
                        </span>
                      </p>
                      <div className="prod_content">
                        <h4>Nike AirForce 1</h4>
                        <p>
                          <span>
                            <img src="/usdc.png" />
                          </span>
                          250
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="products_col1_flex">
                    <div className="product">
                      <a href="https://www.ikonshop.io/product/p/&&c=cl5if7qnp63me0bk8ayy2z8rj&&id=315735670">
                        <img src="/sneakerhead.jpg" className="prod_img" />
                        <div className="prod_overlay"></div>
                        <p>
                          Visit Store{" "}
                          <span>
                            <IoArrowForward />
                          </span>
                        </p>
                        <div className="prod_content">
                          <h4>3D Printed</h4>
                          <p>
                            <span>
                              <img src="/usdc.png" />
                            </span>
                            250
                          </p>
                        </div>
                      </a>
                    </div>
                    <div className="product">
                      <a href="https://www.ikonshop.io/product/p/&&c=cljhosqqco3vl0birae0voqzp&&id=313258829">
                        <img src="/hood.webp" className="prod_img" />
                        <div className="prod_overlay"></div>
                        <p>
                          Visit Store{" "}
                          <span>
                            <IoArrowForward />
                          </span>
                        </p>
                        <div className="prod_content">
                          <h4>Hoodie</h4>
                          <p>
                            <span>
                              <img src="/usdc.png" />
                            </span>
                            250
                          </p>
                        </div>
                      </a>
                    </div>
                  </div> */}

          {/* <div className="product">
                    
                      <a href={`https://www.ikonshop.io/product/${showcaseProducts.id}`}>
                      <img 
                        src={
                          showcaseProducts[0].productImages.length > 0 ?
                          showcaseProducts[0].productImages[0].url :
                          showcaseProducts[0].imageUrl
                        }
                        className="prod_img" 
                      />
                      <div className="prod_overlay"></div>
                      <p>
                        Visit Store{" "}
                        <span>
                          <IoArrowForward />
                        </span>
                      </p>
                      <div className="prod_content">
                        <h4>
                          {showcaseProducts[0].name}
                        </h4>
                        <p>
                          <span>
                            <img 
                              src="/usdc.png"
                            />
                          </span>
                          {showcaseProducts[0].price}
                        </p>
                      </div>
                     </a>
                    
                  </div>
                  <div className="products_col1_flex">
                    {
                      showcaseProducts.slice(1, 3).map((product, index) => {
                        return (
                          <div 
                            key={index} 
                            className="product"
                          >
                            <a href={`https://www.ikonshop.io/product/${product.id}`}>
                              <img src={
                                product.productImages.length > 0 ?
                                product.productImages[0].url :
                                product.imageUrl}
                                className="prod_img" />
                              <div className="prod_overlay"></div>
                              <p>
                                Visit Store{" "}
                                <span>
                                  <IoArrowForward />
                                </span>
                              </p>
                              <div className="prod_content">
                                <h4>{product.name}</h4>
                                <p>
                                  <span>
                                    <img src="/usdc.png" />
                                  </span>
                                  {product.price}
                                </p>
                              </div>
                            </a>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>

          

                <div className="products_show_col2">
                  <div className="product">
                    <a href=
                      {`https://www.ikonshop.io/product/${showcaseProducts[3].id}`}
                    >
                      <img 
                        src={
                          showcaseProducts[3].productImages.length > 0 ?
                          showcaseProducts[3].productImages[0].url :
                          showcaseProducts[3].imageUrl
                        }
                        className="prod_img"
                      />
                      <div className="prod_overlay"></div>
                      <p>
                        Visit Store{" "}
                        <span>
                          <IoArrowForward />
                        </span>
                      </p>
                      <div className="prod_content">
                        <h4>
                          {showcaseProducts[3].name}
                        </h4>
                        <p>
                          <span>
                            <img src="/usdc.png" />
                          </span>
                          {showcaseProducts[3].price}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

         

                <div className="products_show_col3">
                  <div
                    className="product"
                  >
                    <a href={`https://www.ikonshop.io/product/${showcaseProducts[4].id}`}>
                      <img src={
                        showcaseProducts[4].productImages.length > 0 ?
                        showcaseProducts[4].productImages[0].url
                        : showcaseProducts[4].imageUrl
                      } className="prod_img" />
                      <div className="prod_overlay"></div>
                      <p>
                        Visit Store{" "}
                        <span>
                          <IoArrowForward />
                        </span>
                      </p>
                      <div className="prod_content">
                        <h4>{showcaseProducts[4].name}</h4>
                        <p>
                          <span>
                            <img src="/usdc.png" />
                          </span>
                          {showcaseProducts[4].price}
                        </p>
                      </div>
                    </a>
                  </div>

                  <div className="product">
                    <a href=
                      {`https://www.ikonshop.io/product/${showcaseProducts[5].id}`}
                    >
                      <img 
                        src={
                          showcaseProducts[5].productImages.length > 0 ?
                          showcaseProducts[5].productImages[0].url
                          : showcaseProducts[5].imageUrl
                        }
                        className="prod_img"
                      />
                      <div className="prod_overlay"></div>
                      <p>
                        Visit Store{" "}
                        <span>
                          <IoArrowForward />
                        </span>
                      </p>
                      <div className="prod_content">
                        <h4>Cases</h4>
                        <p>
                          <span>
                            <img src="/usdc.png" />
                          </span>
                          {
                            showcaseProducts[5].price
                          }
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              )}
            </div>
          </section> */}

          <section className="faqs">
            <Container>
              <p className="faqs_small_header">Frequently asked questions</p>
              <h2>Questions you might have</h2>
              {faqs.map((faq, index) => {
                return (
                  <AccordionItem
                    key={index}
                    active={active}
                    handleToggle={handleToggle}
                    faq={faq}
                  />
                );
              })}
            </Container>
          </section>

          {/* <section className="info_section section2">
            <div className="container_info_img">
              <img src="/img1.png" alt="" />
            </div>
            <div className="container_main">
              <div className="info_small_header">
                <IoStorefront />
                <span>Merchant</span>
              </div>
              <h1>
                Create a Storefront, create physical/digital products and sell.
              </h1>
              <p className="info_body2">
                Merchants can create storefronts, physical/digital products,
                manage their orders, products, and many more securely on
                IkonShop.
              </p>

              <br />
              <br />
              <button
                className="signup_button"
                onClick={() => setShowLoginOptions(true)}
              >
                Connect Wallet
              </button>
            </div>
          </section> */}

          {/* <div className="features">
            <div className="ft_bg"></div>
            <Container>
              <div className="features_container" id="learn_more">
                <div className="features_row">
                  <img
                    className="features_img2"
                    src="/ft1.png"
                    data-aos="zoom-out"
                  />
                </div>

                <div className="features_row">
                  <h2
                    className="big_header"
                    data-aos="fade-up"
                    data-aos-delay="300"
                  >
                    Premiere Shopping Experience
                  </h2>
                  <p
                    className="features_body"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    We offer a familiar online shopping experience - browse
                    products, read descriptions, easy & secure checkout,
                    tracking information, order history, and so much more!
                  </p> */}

          {/* <div
                    className="features_btn"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    Shop Now
                  </div> */}
          {/* </div>
              </div>
            </Container>
          </div> */}

          {/* <div className="why_section">
            <div className="ft_bigred" data-aos="fade-down-right"></div>
            <div className="ft_outlineblue" data-aos="fade-left"></div>
            <Container>
              <div className="why_ikonshop">
                <h2 className="why_header">
                  <mark>How IkonShop Works</mark>
                </h2>
                <div className="why_content">
                  <div className="why_card_row">
                    <div className="why_content_card" data-aos="fade-up">
                      <div className="why_img_head">
                        <img src="/search.png" />
                      </div>
                      <div>
                        <p>Search and Discover</p>
                       
                      </div>
                    </div>
                    <div
                      className="why_content_card"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <div className="why_img_head">
                        <img src="/desc.png" />
                      </div>
                      <div>
                        <p>Browse and Choose</p>
                     
                      </div>
                    </div>

                    <div
                      className="why_content_card"
                      data-aos="fade-up"
                      data-aos-delay="300"
                    >
                      <div className="why_img_head">
                        <img src="/cart.png" />
                      </div>
                      <div>
                        <p>Multi-Store Cart</p>
                      
                      </div>
                    </div>
                    <div
                      className="why_content_card"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      <div className="why_img_head">
                        <img src="/check.png" />
                      </div>
                      <div>
                        <p>Wallet Based Payments</p>
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div> */}

          {/* <div className="compatible">
            <div className="comp_smallred"></div>
            <div className="comp_outlineblue"></div>
            <Container>
              <img src="/compatible_icon.png" />
              <h2 data-aos="fade-up">
                IkonShop is compatible with your favorite tools.
              </h2>
              <p data-aos="fade-up" data-aos-delay="200">
                Seamlessly integrate your Web2 e-commerce plugins.
              </p>
            </Container>
            <div className="compatible_cards">
              <div
                className="comp_card"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <img src="/shipstation.png" />
              </div>
              <div
                className="comp_card"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <img src="/shopify.png" />
              </div>
            </div>
          </div> */}

          {/* <div className="features features_ft2">
          
            <Container>
              <div className="features_container">
                <div class="avatars">
                  <a href="#" class="avatars__item">
                    <img class="avatar" src="/ik1.png" alt="" />
                  </a>
                  <a href="#" class="avatars__item">
                    <img class="avatar" src="/ik2.png" alt="" />
                  </a>
                  <a href="#" class="avatars__item">
                    <img class="avatar" src="/ik3.png" alt="" />
                  </a>
                  <a href="#" class="avatars__item">
                    <img class="avatar" src="/ik4.png" alt="" />
                  </a>
                  <a href="#" class="avatars__item">
                    <img class="avatar" src="/ik5.png" alt="" />
                  </a>
                </div>
                <h2 className="big_header">
                  Join innovative merchants & consumers who use IkonShop
                  everyday.
                </h2>

                <a href="#">
                  <div className="features_btn">Connect Wallet</div>
                </a>
              </div>
            </Container>
          </div> */}
        </div>
      </>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((activeWord) =>
        activeWord === keywords[keywords.length - 1]
          ? keywords[0]
          : keywords[keywords.indexOf(activeWord) + 1]
      );
    }, 1200);
    return () => clearInterval(interval);
  }, [activeWord]);

  useEffect(() => {
    if (showcaseCollections.length === 0) {
      GetShowcaseCollections().then((res) => {
        setShowcaseCollections(res);
      });
      GetRandomShowcaseProducts().then((res) => {
        console.log(res);
        setShowcaseProducts(res);
      });
      setLoading(false);
    }
  }, [showcaseCollections]);

  return (
    <div className="App">
      <HeadComponent />
      <main>
        {!loading && renderStoreContainer()}
        {loading ? <Loading /> : null}
      </main>
    </div>
  );
};

export default App;
