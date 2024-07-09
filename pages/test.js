import { signIn, signOut, useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Page() {
  const { publicKey } = useWallet();

  const handleSignIn = async () => {
    const token = await signIn(publicKey.toString());
    console.log("signed in");
  };
  const { data: session } = useSession();
  return (
    <>
      {!session && (
        <>
          Not signed in <br />
          <button onClick={() => handleSignIn()}>Sign in</button>
        </>
      )}
      {session && (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
}
