
import "../styles/community-feed.css";
import { Providers } from "@/src/store/providers";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import Link from "next/link";
import { NavLink } from "./profile/update/[username]/components";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import { useEffect, useState } from "react";
import { getPresignedUrlForImage } from "@/src/services/api/auth.service";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import NavBar from "@/src/components/layouts/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <NavBar/>
      <div>{children}</div>
    </>
  );
}
