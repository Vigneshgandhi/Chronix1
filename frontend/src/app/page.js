"use client";
import Hero from "./Components/Hero";
import React,{useEffect} from "react";
import Navbar from "./Components/Navbar";
import { initializeChronixStorage } from "./utils/Storagemanager";


export default function Home() {
  useEffect(() => {
      initializeChronixStorage();
    },[]);
  return (
    <React.Fragment>
      <Navbar />
      <Hero />
    </React.Fragment>
  );
}
