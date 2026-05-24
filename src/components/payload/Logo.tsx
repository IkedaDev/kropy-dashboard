import Image from "next/image";
import logo from '@/assets/sign-white.svg';
import logoDark from '@/assets/sign-dark.svg';

export default function Logo() {
   return (
      <div>
         <Image className="h-40 object-contain dark:hidden" src={logo} alt="Logo Kropy" />
         <Image className="h-40 object-contain hidden dark:block" src={logoDark} alt="Logo Kropy" />
      </div>
   )
}