import Image from "next/image";

import icon from '@/assets/icon.png';

export default function Icon(){
     return (
     <div>
        <Image className="w-40" src={icon} alt="" />
     </div>
     )
}