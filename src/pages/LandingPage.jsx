import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import BentoFeatures from "../components/landing/BentoFeatures";
import ChatSection from "../components/landing/ChatSection";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {

return (

<div className="bg-[#050816] text-white overflow-hidden">

<Navbar />

<Hero />

<Stats />

<BentoFeatures />

<ChatSection />


<Testimonials />

<FAQ />

<CTA />

<Footer />

</div>

);

}