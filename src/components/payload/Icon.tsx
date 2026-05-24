import Image from "next/image";

import icon from '@/assets/icon.svg';

export default function Icon() {
   return (
      <div>
         <Image className="w-40" src={icon} alt="Icono Kropy" />
      </div>
   )
}