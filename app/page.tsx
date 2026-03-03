'use client';
import Image from "next/image";
import { BookOpenCheck } from 'lucide-react';
import Card from "@/components/Card";
import { useState } from "react";
import { toast } from "sonner"

export default function Home() {

  const [email, setEmail] = useState("");
  const handleSubscribe = () => {    // Handle subscription logic here, e.g., send email to backend
   fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then(res => res.json()).then(data => {
      if (data.error){
        toast.error(data.error)
      } else {
        toast.success("Subscription successful!")
      }
    }).catch((error) => {
      toast.error("An error occurred. Please try again.")
    }).finally(() => {
      setEmail("")
    }) 
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-6 mx-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpenCheck />
          <h1 className="text-2xl font-bold"> Daily News </h1>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/" className="hover:text-gray-500">Home</a>
          <a href="/" className="hover:text-gray-500">Home</a>
        </nav>
      </header>
      {/* main content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Daily Briefs By Niko
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Stay informed with Daily Briefs by Niko — concise, AI-powered news summaries covering global events, business, technology, and more, all in one place.
          </p>
        </div>
        {/* input and suscrtibe button */}
        <div className="text-center flex items-center justify-center gap-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full max-w-md p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSubscribe} className="bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg transition-colors cursor-pointer">
            Subscribe
          </button>
        </div>
        {/* Card */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card title="AI" description="Global stock markets rallied today as investors reacted positively to signs of economic recovery and strong corporate earnings reports." />
          <Card title="Starups" description="Leading technology companies have unveiled their latest AI innovations, promising to revolutionize industries from healthcare to finance." />
          <Card title="Technology" description="World leaders at the Climate Change Summit have reached new agreements aimed at reducing carbon emissions and combating global warming." />
        </div>
      </div>
    </div>
  );
}
