import Image from "next/image";

import Sign from '@/assets/sign-white.svg';

export default function SignIcon() {
   return (
      <div>
         <Image className="w-40" src={Sign} alt="Logo vertical Kropy" />
      </div>
   )
}