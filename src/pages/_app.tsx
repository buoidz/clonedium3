import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";
import { Toaster } from "react-hot-toast";

import "~/styles/globals.css";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Head from "next/head";


const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Head>
        <title>Clonedium3</title>
        <meta name="description" content="👀" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center"/>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
