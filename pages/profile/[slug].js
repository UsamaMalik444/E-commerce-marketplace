import React, { useState, useEffect } from "react";
import {
  GetWalletProfile,
  fetchProducts,
  getSingleProductBySku,
} from "../../lib/api";
import Profile from "../../components/Profile/Profile";
import { useWallet } from "@solana/wallet-adapter-react";
import Loading from "../../components/Loading";
import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import * as web3 from "@solana/web3.js";

export default function ProfileViewer({}) {
  const { publicKey, connected } = useWallet();
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [walletProfile, setWalletProfile] = useState(null);
  const [collections, setCollections] = useState(null);
  const [noProfile, setNoProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const rpcUrl =
    "https://solana-mainnet.g.alchemy.com/v2/7eej6h6KykaIT45XrxF6VHqVVBeMQ3o7";
  const connection = new web3.Connection(rpcUrl);

  const renderProfilePage = () => {
    return <Profile data={walletProfile} collections={collections} />;
  };

  const renderNoProfilePage = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          width: "100vw",
        }}
      >
        <h1>No profile found for this wallet</h1>
      </div>
    );
  };

  useEffect(() => {
    if (publicKey) {
      setUserPublicKey(publicKey);
    }
  }, [publicKey]);

  useEffect(() => {
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_KEY, {
      extensions: {
        solana: new SolanaExtension({
          rpcUrl,
        }),
      },
    });
    async function checkUser() {
      const loggedIn = await magic.user.isLoggedIn();
      console.log("loggedIn", loggedIn);
      if (loggedIn) {
        magic.user.getMetadata().then((user) => {
          const pubKey = new web3.PublicKey(user.publicAddress);
          setUserPublicKey(pubKey);
          setUserEmail(user.email);
        });
      }
    }
    checkUser();
  }, []);

  useEffect(() => {
    // slug is the id of the wallet
    const id = window.location.pathname.split("/")[2];
    console.log("id", id);
    async function getWalletProfile() {
      const walletProfile = await GetWalletProfile(id);
      console.log("walletProfile", walletProfile);
      if (walletProfile) {
        setWalletProfile(walletProfile.wallet);
        if (
          walletProfile.collections !== undefined ||
          walletProfile.collections !== null
        ) {
          setCollections(walletProfile.collections);
        }
      } else {
        setNoProfile(true);
      }
      setLoading(false);
    }
    getWalletProfile();
  }, []);
  return (
    <>
      {loading ? <Loading /> : null}
      {noProfile ? renderNoProfilePage() : null}
      {!loading && !noProfile && walletProfile ? renderProfilePage() : null}
    </>
  );
}

// Specify dynamic routes to pre-render pages based on data.
// The HTML is generated at build time and will be reused on each request.
export async function getStaticProps({ params }) {
  const data = await getSingleProductBySku(params.slug);
  return {
    props: {
      product: data,
    },
  };
}

export async function getStaticPaths() {
  const data = await fetchProducts("ABC");
  const paths = data.map((product) => ({
    params: {
      slug: product.id,
    },
  }));
  return {
    paths,
    fallback: true,
  };
}
