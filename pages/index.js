import Image from "next/image";
import { Logo } from '../components/logo';
import Link from "next/link";

export default function Home() {
  return ( 
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-space-900 relative">

      <Image src="/earth.avif" alt="Hero" layout="fill" objectFit="cover" className="absolute" />

      <div className="relative z-10 text-white px-10 py-10 text-center max-w-lg bg-space-700/70 rounded-lg backdrop-filter backdrop-blur-md">
        <Logo />
        <p className="mt-6 text-lg leading-relaxed">Unleash the power of automation with PostPulse, generating compelling content tailored to your topics and keywords</p>
        <Link href="/post/new" className="inline-block mt-6 py-3 px-6 text-lg font-semibold text-white bg-indigo-800 rounded-md hover:bg-indigo-700 transition-colors duration-200">
          Begin
        </Link>
      </div>
    </div>
  );
}

