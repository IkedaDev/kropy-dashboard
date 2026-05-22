import Image from "next/image";
import logo from '@/assets/logo.png';
import logoDark from '@/assets/logo.png';

export default function Logo(){
     return (
     <div>
        <Image className="h-20 object-contain dark:hidden" src={logo} alt="" />
        <Image className="h-20 object-contain hidden dark:block" src={logoDark} alt="" />
     </div>
     )
}